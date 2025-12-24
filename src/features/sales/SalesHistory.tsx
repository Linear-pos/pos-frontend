import { useState, useEffect } from "react";
import { Search, Calendar, Filter, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { salesAPI } from "../sales/api";
import type { Sale } from "@/types/sale";
import Receipt from "@/components/receipts/Receipt";
import { format } from "date-fns";

const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params: any = {
        page: currentPage,
        per_page: 20,
      };

      // Add date range filter
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        
        params.start_date = startDate.toISOString().split('T')[0];
        params.end_date = now.toISOString().split('T')[0];
      }

      const response = await salesAPI.getSales(params);
      setSales(response.data);
      setTotalPages(response.last_page);
      setTotalCount(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [currentPage, dateRange]);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = !searchQuery || 
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items?.some(item => 
        item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesPaymentMethod = paymentMethod === 'all' || 
      sale.payment_method === paymentMethod;

    return matchesSearch && matchesPaymentMethod;
  });

  const getTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getPaymentMethodColor = (method: string): "default" | "secondary" | "destructive" | "outline" => {
    const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      cash: 'secondary',
      mpesa: 'default',
      card: 'outline',
      bank_transfer: 'secondary'
    };
    return colors[method] || 'secondary';
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'secondary',
      pending: 'default',
      cancelled: 'destructive'
    };
    return colors[status] || 'secondary';
  };

  const handleViewReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setShowReceipt(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Receipt #', 'Items', 'Payment Method', 'Total', 'Status'],
      ...filteredSales.map(sale => [
        format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
        sale.id,
        sale.items?.length || 0,
        sale.payment_method,
        sale.total.toString(),
        sale.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Sales History</h1>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-600">
              KES {getTotalSales().toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Avg Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info-600">
              KES {filteredSales.length > 0 ? (getTotalSales() / filteredSales.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-600">
              {filteredSales.reduce((sum, sale) => 
                sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchSales} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error-600">{error}</p>
              <Button onClick={fetchSales} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">No sales found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-neutral-700">Date</th>
                    <th className="text-left p-4 font-medium text-neutral-700">Receipt #</th>
                    <th className="text-left p-4 font-medium text-neutral-700">Items</th>
                    <th className="text-left p-4 font-medium text-neutral-700">Payment</th>
                    <th className="text-right p-4 font-medium text-neutral-700">Total</th>
                    <th className="text-center p-4 font-medium text-neutral-700">Status</th>
                    <th className="text-center p-4 font-medium text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-neutral-50">
                      <td className="p-4 text-sm">
                        {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="p-4 font-mono text-sm">
                        {sale.id}
                        {sale.reference && (
                          <div className="text-xs text-neutral-500">{sale.reference}</div>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {sale.items?.length || 0} items
                        {sale.items && sale.items.length > 0 && (
                          <div className="text-xs text-neutral-500">
                            {sale.items[0].product?.name}
                            {sale.items.length > 1 && ` +${sale.items.length - 1} more`}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={getPaymentMethodColor(sale.payment_method)}>
                          {sale.payment_method?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-medium">
                        KES {sale.total.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReceipt(sale)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedSale && (
        <Receipt
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setSelectedSale(null);
          }}
          sale={selectedSale}
        />
      )}
    </div>
  );
};

export default SalesHistory;