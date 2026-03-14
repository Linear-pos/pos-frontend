import { useEffect, useMemo, useState } from 'react';
import { Search, X, Barcode } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { productsAPI, type Product, type ProductsQueryParams } from '../api/products.api';
import type { Category } from '../api/categories.api';

const PAGE_SIZE = 20;

interface ProductsWithoutBarcodeModalProps {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onOpenBarcode: (product: Product) => void;
}

export const ProductsWithoutBarcodeModal = ({
  open,
  categories,
  onClose,
  onOpenBarcode,
}: ProductsWithoutBarcodeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('active');
  const [categoryId, setCategoryId] = useState<string>('all');

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  const fetchMissing = async () => {
    setLoading(true);
    try {
      const params: ProductsQueryParams = {
        page,
        limit: PAGE_SIZE,
        sort_by: 'name',
        sort_order: 'asc',
        has_barcode: false,
      };

      if (search.trim()) params.search = search.trim();
      if (categoryId !== 'all') params.category = categoryId;
      if (status === 'active') params.is_active = true;
      if (status === 'inactive') params.is_active = false;

      // const response = await productsAPI.getProducts(params);
      const response = await productsAPI.getProducts(params)
      setItems(response.data);
      console.log("82", response.data);
      setPages(response.pagination.pages || 1);
      setTotal(response.pagination.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSearch('');
    setStatus('active');
    setCategoryId('all');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      fetchMissing();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, status, categoryId, search]);

  const activeFilters = useMemo(() => {
    const badges: Array<{ key: string; label: string; onClear: () => void }> = [];
    if (search.trim()) badges.push({ key: 'search', label: `Search: ${search.trim()}`, onClear: () => setSearch('') });
    if (categoryId !== 'all') {
      badges.push({
        key: 'category',
        label: `Category: ${categoryNameById.get(categoryId) || 'Unknown'}`,
        onClear: () => setCategoryId('all'),
      });
    }
    if (status !== 'active') badges.push({ key: 'status', label: `Status: ${status}`, onClear: () => setStatus('active') });
    return badges;
  }, [categoryId, categoryNameById, search, status]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[980px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Products Without Barcode</DialogTitle>
          <DialogDescription>
            Production-ready view to generate and print labels for products missing a barcode.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search name, sku, description..."
                className="pl-9"
              />
              {search.trim() && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => {
                    setPage(1);
                    setSearch('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select
              value={categoryId}
              onValueChange={(v) => {
                setPage(1);
                setCategoryId(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(v) => {
                setPage(1);
                setStatus(v as any);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((b) => (
                <Badge key={b.key} variant="secondary" className="gap-1">
                  {b.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3"
                    onClick={b.onClear}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{p.sku || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{(p as any).category || (p as any).category_id || 'Uncategorized'}</TableCell>
                      <TableCell className="text-right text-sm">{(p.stock_quantity ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">KES {(p.price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => onOpenBarcode(p)}
                        >
                          <Barcode className="h-4 w-4" />
                          Generate / Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
