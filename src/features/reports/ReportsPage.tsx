import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  reportsAPI,
  type SalesReportData,
  type TopProduct,
  type CategoryRevenue,
  type InventorySummary,
  type ReportTemplateType,
} from "./api/reports.api";
import { branchesAPI, type Branch } from "@/features/admin/api/branches.api";
import { useBranchScope } from "@/hooks/useBranchScope";
import { SalesTrendChart } from "@/features/admin/dashboard/components/SalesTrendChart";
import { TopProductsChart } from "@/features/admin/dashboard/components/TopProductsChart";
import { PaymentMethodsChart } from "@/features/admin/dashboard/components/PaymentMethodsChart";
import { CategoryRevenueChart } from "@/features/admin/dashboard/components/CategoryRevenueChart";
import { StockStatusChart } from "@/features/admin/dashboard/components/StockStatusChart";

const REPORT_TYPES: { value: ReportTemplateType; label: string; description: string }[] = [
  {
    value: "sales_summary",
    label: "Sales Summary",
    description: "Revenue, tax, payment methods, and daily trends",
  },
  {
    value: "top_products",
    label: "Top Products",
    description: "Best sellers ranked by quantity and revenue",
  },
  {
    value: "inventory_summary",
    label: "Inventory Summary",
    description: "Stock status and inventory value snapshot",
  },
  {
    value: "category_revenue",
    label: "Revenue by Category",
    description: "Category performance and contribution",
  },
];

const formatCurrency = (value: number) => `KES ${Number(value || 0).toLocaleString()}`;

const buildDateRangeParams = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const csvEscape = (value: string | number) => {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const downloadCsv = (rows: (string | number)[][], filename: string) => {
  const csvContent = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const buildDefaultDateRange = () => {
  const today = new Date();
  const start = subDays(today, 30);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
  };
};

export const ReportsPage = () => {
  const { branchId, isSystemAdmin, isBranchScoped } = useBranchScope();

  const defaultRange = useMemo(() => buildDefaultDateRange(), []);

  const [reportType, setReportType] = useState<ReportTemplateType>(
    "sales_summary"
  );
  const [startDate, setStartDate] = useState<string>(defaultRange.startDate);
  const [endDate, setEndDate] = useState<string>(defaultRange.endDate);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    branchId || null
  );

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [salesReport, setSalesReport] = useState<SalesReportData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);

  const printRef = useRef<HTMLDivElement | null>(null);

  const printDocumentTitle = useMemo(
    () => `${reportType}_${format(new Date(), "yyyy-MM-dd")}`,
    [reportType]
  );

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: printDocumentTitle,
  });

  useEffect(() => {
    if (!isSystemAdmin) return;

    const loadBranches = async () => {
      try {
        const response = await branchesAPI.getBranches({ limit: 100 });
        setBranches(response.data);
      } catch (error) {
        console.error("Failed to load branches:", error);
      }
    };

    loadBranches();
  }, [isSystemAdmin]);

  useEffect(() => {
    if (branchId) {
      setSelectedBranchId(branchId);
    }
  }, [branchId]);

  const resetReportData = () => {
    setSalesReport(null);
    setTopProducts([]);
    setCategoryRevenue([]);
    setInventorySummary(null);
  };

  const runReport = useCallback(async (config?: {
    type?: ReportTemplateType;
    startDate?: string;
    endDate?: string;
    branchId?: string | null;
  }) => {
    const runType = config?.type ?? reportType;
    const runStartDate = config?.startDate ?? startDate;
    const runEndDate = config?.endDate ?? endDate;
    const runBranchId = config?.branchId ?? selectedBranchId;
    const fallbackStartDate = runStartDate || defaultRange.startDate;
    const fallbackEndDate = runEndDate || defaultRange.endDate;

    resetReportData();
    setReportError(null);

    setReportLoading(true);

    try {
      let params: { startDate?: string; endDate?: string; branchId?: string } = {};

      if (runType === "inventory_summary") {
        if (runBranchId) {
          params = { branchId: runBranchId };
        }
      } else {
        if ((runStartDate && !runEndDate) || (!runStartDate && runEndDate)) {
          setReportError("Please select both start and end dates.");
          return;
        }
        const rangeParams = buildDateRangeParams(fallbackStartDate, fallbackEndDate);
        params = {
          ...rangeParams,
          ...(runBranchId ? { branchId: runBranchId } : {}),
        };
        if (!runStartDate || !runEndDate) {
          setStartDate(fallbackStartDate);
          setEndDate(fallbackEndDate);
        }
      }

      switch (runType) {
        case "sales_summary": {
          const data = await reportsAPI.getSalesReport(params);
          setSalesReport(data);
          break;
        }
        case "top_products": {
          const data = await reportsAPI.getTopProducts(params);
          setTopProducts(data);
          break;
        }
        case "category_revenue": {
          const data = await reportsAPI.getRevenueByCategory(params);
          setCategoryRevenue(data);
          break;
        }
        case "inventory_summary": {
          const data = await reportsAPI.getInventorySummary(params);
          setInventorySummary(data);
          break;
        }
        default:
          break;
      }
    } catch (error: any) {
      setReportError(error?.response?.data?.message || "Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  }, [
    reportType,
    startDate,
    endDate,
    selectedBranchId,
    defaultRange.startDate,
    defaultRange.endDate,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      runReport();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [runReport]);

  const handleExport = (formatType: "csv" | "xml" | "pdf") => {
    const today = format(new Date(), "yyyy-MM-dd");
    const title = reportTypeMeta?.label || "Report";
    const dateRange =
      reportType === "inventory_summary"
        ? "Current snapshot"
        : `${startDate || defaultRange.startDate} to ${endDate || defaultRange.endDate}`;
    const branchLabel = selectedBranchId
      ? branches.find((branch) => branch.id === selectedBranchId)?.name ||
        (isBranchScoped ? "Your branch" : "Branch")
      : "All branches";

    const escapeXml = (value: string | number) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const downloadText = (content: string, filename: string, type: string) => {
      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    if (formatType === "pdf") {
      if (!printRef.current) {
        toast.error("Print view is not ready yet.");
        return;
      }
      handlePrint();
      return;
    }

    if (reportType === "sales_summary") {
      const summary: SalesReportData = salesReport ?? {
        totalRevenue: 0,
        totalSalesCount: 0,
        averageSaleValue: 0,
        paymentMethods: [],
        dailyBreakdown: [],
        totalTax: 0,
      };

      const metricsRows: (string | number)[][] = [
        ["Total Revenue", summary.totalRevenue],
        ["Total Sales", summary.totalSalesCount],
        ["Average Sale Value", summary.averageSaleValue ?? summary.averageOrderValue ?? 0],
        ["Total Tax", summary.totalTax ?? 0],
      ];

      if (formatType === "csv") {
        const rows: (string | number)[][] = [
          ["Metric", "Value"],
          ...metricsRows,
          [],
          ["Payment Method", "Count", "Total"],
          ...summary.paymentMethods.map((pm) => [pm.method, pm.count, pm.total]),
        ];
        if (summary.dailyBreakdown?.length) {
          rows.push([]);
          rows.push(["Date", "Total"]);
          rows.push(
            ...summary.dailyBreakdown.map((row) => [row.date, row.total])
          );
        }
        downloadCsv(rows, `sales_summary_${today}.csv`);
        return;
      }

      if (formatType === "xml") {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<report type="sales_summary" generatedAt="${escapeXml(new Date().toISOString())}">
  <title>${escapeXml(title)}</title>
  <dateRange>${escapeXml(dateRange)}</dateRange>
  <branch>${escapeXml(branchLabel)}</branch>
  <metrics>
    ${metricsRows
      .map(
        ([label, value]) =>
          `<metric><label>${escapeXml(label)}</label><value>${escapeXml(value)}</value></metric>`
      )
      .join("")}
  </metrics>
  <paymentMethods>
    ${summary.paymentMethods
      .map(
        (pm) =>
          `<paymentMethod><method>${escapeXml(pm.method)}</method><count>${escapeXml(
            pm.count
          )}</count><total>${escapeXml(pm.total)}</total></paymentMethod>`
      )
      .join("")}
  </paymentMethods>
  <dailyBreakdown>
    ${summary.dailyBreakdown
      ?.map(
        (row) =>
          `<day><date>${escapeXml(row.date)}</date><total>${escapeXml(
            row.total
          )}</total></day>`
      )
      .join("")}
  </dailyBreakdown>
</report>`;
        downloadText(xml, `sales_summary_${today}.xml`, "application/xml");
        return;
      }

      return;
    }

    if (reportType === "top_products") {
      const rows = topProducts.map((product) => [
        product.name,
        product.sku,
        product.totalQuantity,
        product.totalRevenue,
      ]);

      if (formatType === "csv") {
        downloadCsv([["Product", "SKU", "Quantity", "Revenue"], ...rows], `top_products_${today}.csv`);
        return;
      }

      if (formatType === "xml") {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<report type="top_products" generatedAt="${escapeXml(new Date().toISOString())}">
  <title>${escapeXml(title)}</title>
  <dateRange>${escapeXml(dateRange)}</dateRange>
  <branch>${escapeXml(branchLabel)}</branch>
  <products>
    ${rows
      .map(
        ([name, sku, quantity, revenue]) =>
          `<product><name>${escapeXml(name)}</name><sku>${escapeXml(
            sku
          )}</sku><quantity>${escapeXml(quantity)}</quantity><revenue>${escapeXml(
            revenue
          )}</revenue></product>`
      )
      .join("")}
  </products>
</report>`;
        downloadText(xml, `top_products_${today}.xml`, "application/xml");
        return;
      }

      return;
    }

    if (reportType === "category_revenue") {
      const rows = categoryRevenue.map((category) => [
        category.category,
        category.totalRevenue,
        `${category.percentage}%`,
      ]);

      if (formatType === "csv") {
        downloadCsv([["Category", "Revenue", "Percentage"], ...rows], `category_revenue_${today}.csv`);
        return;
      }

      if (formatType === "xml") {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<report type="category_revenue" generatedAt="${escapeXml(new Date().toISOString())}">
  <title>${escapeXml(title)}</title>
  <dateRange>${escapeXml(dateRange)}</dateRange>
  <branch>${escapeXml(branchLabel)}</branch>
  <categories>
    ${rows
      .map(
        ([categoryName, revenue, percentage]) =>
          `<category><name>${escapeXml(categoryName)}</name><revenue>${escapeXml(
            revenue
          )}</revenue><percentage>${escapeXml(percentage)}</percentage></category>`
      )
      .join("")}
  </categories>
</report>`;
        downloadText(xml, `category_revenue_${today}.xml`, "application/xml");
        return;
      }

      return;
    }

    const stock: InventorySummary = inventorySummary ?? {
      totalItems: 0,
      totalStockValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    };
    const rows: (string | number)[][] = [
      ["Total Items", stock.totalItems],
      ["Low Stock Items", stock.lowStockItems],
      ["Out of Stock Items", stock.outOfStockItems],
      ["Total Stock Value", stock.totalStockValue],
    ];

    if (formatType === "csv") {
      downloadCsv([["Metric", "Value"], ...rows], `inventory_summary_${today}.csv`);
      return;
    }

    if (formatType === "xml") {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<report type="inventory_summary" generatedAt="${escapeXml(new Date().toISOString())}">
  <title>${escapeXml(title)}</title>
  <dateRange>${escapeXml(dateRange)}</dateRange>
  <branch>${escapeXml(branchLabel)}</branch>
  <metrics>
    ${rows
      .map(
        ([label, value]) =>
          `<metric><label>${escapeXml(label)}</label><value>${escapeXml(value)}</value></metric>`
      )
      .join("")}
  </metrics>
</report>`;
      downloadText(xml, `inventory_summary_${today}.xml`, "application/xml");
      return;
    }

    return;
  };

  const reportTypeMeta = REPORT_TYPES.find((type) => type.value === reportType);
  const printMeta = useMemo(() => {
    const title = reportTypeMeta?.label || "Report";
    const dateRange =
      reportType === "inventory_summary"
        ? "Current snapshot"
        : `${startDate || defaultRange.startDate} to ${endDate || defaultRange.endDate}`;
    const branchLabel = selectedBranchId
      ? branches.find((branch) => branch.id === selectedBranchId)?.name ||
        (isBranchScoped ? "Your branch" : "Branch")
      : "All branches";

    return { title, dateRange, branchLabel };
  }, [
    reportTypeMeta?.label,
    reportType,
    startDate,
    endDate,
    defaultRange.startDate,
    defaultRange.endDate,
    selectedBranchId,
    branches,
    isBranchScoped,
  ]);

  const printSections = useMemo(() => {
    if (reportType === "sales_summary") {
      const summary: SalesReportData = salesReport ?? {
        totalRevenue: 0,
        totalSalesCount: 0,
        averageSaleValue: 0,
        paymentMethods: [],
        dailyBreakdown: [],
        totalTax: 0,
      };

      const sections = [
        {
          title: "Summary Metrics",
          headers: ["Metric", "Value"],
          rows: [
            ["Total Revenue", formatCurrency(summary.totalRevenue)],
            ["Total Sales", summary.totalSalesCount],
            [
              "Average Sale Value",
              formatCurrency(
                summary.averageSaleValue ?? summary.averageOrderValue ?? 0
              ),
            ],
            ["Total Tax", formatCurrency(summary.totalTax ?? 0)],
          ],
        },
        {
          title: "Payment Methods",
          headers: ["Method", "Count", "Total"],
          rows: summary.paymentMethods.map((pm) => [
            pm.method.replace("_", " "),
            pm.count,
            formatCurrency(pm.total),
          ]),
        },
      ];

      if (summary.dailyBreakdown?.length) {
        sections.push({
          title: "Daily Breakdown",
          headers: ["Date", "Total"],
          rows: summary.dailyBreakdown.map((row) => [
            row.date,
            formatCurrency(row.total),
          ]),
        });
      }

      return sections;
    }

    if (reportType === "top_products") {
      return [
        {
          title: "Top Products",
          headers: ["Product", "SKU", "Quantity", "Revenue"],
          rows: topProducts.map((product) => [
            product.name,
            product.sku,
            product.totalQuantity,
            formatCurrency(product.totalRevenue),
          ]),
        },
      ];
    }

    if (reportType === "category_revenue") {
      return [
        {
          title: "Category Revenue",
          headers: ["Category", "Revenue", "Contribution"],
          rows: categoryRevenue.map((category) => [
            category.category,
            formatCurrency(category.totalRevenue),
            `${category.percentage}%`,
          ]),
        },
      ];
    }

    const stock: InventorySummary = inventorySummary ?? {
      totalItems: 0,
      totalStockValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    };

    return [
      {
        title: "Inventory Summary",
        headers: ["Metric", "Value"],
        rows: [
          ["Total Items", stock.totalItems],
          ["Low Stock Items", stock.lowStockItems],
          ["Out of Stock Items", stock.outOfStockItems],
          ["Total Stock Value", formatCurrency(stock.totalStockValue)],
        ],
      },
    ];
  }, [reportType, salesReport, topProducts, categoryRevenue, inventorySummary]);

  const renderReportResults = () => {
    if (reportType === "sales_summary") {
      const summary: SalesReportData = salesReport ?? {
        totalRevenue: 0,
        totalSalesCount: 0,
        averageSaleValue: 0,
        paymentMethods: [],
        dailyBreakdown: [],
        totalTax: 0,
      };

      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums text-primary">
                  {formatCurrency(summary.totalRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sales Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {summary.totalSalesCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums text-info-600">
                  {formatCurrency(
                    summary.averageSaleValue ??
                      summary.averageOrderValue ??
                      0
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tax
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums text-warning-600">
                  {formatCurrency(summary.totalTax ?? 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <SalesTrendChart data={summary.dailyBreakdown ?? []} />
            <PaymentMethodsChart data={summary.paymentMethods ?? []} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Breakdown</CardTitle>
              <CardDescription>Summary of counts and totals by payment type.</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.paymentMethods?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.paymentMethods.map((method) => (
                      <TableRow key={method.method}>
                        <TableCell className="font-medium capitalize">
                          {method.method.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{method.count}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(method.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-md border border-dashed border-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  No payment data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === "top_products") {
      return (
        <div className="grid gap-4 lg:grid-cols-4">
          <TopProductsChart data={topProducts} />
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Highest performing products in this range.</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="text-right tabular-nums">{product.totalQuantity}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(product.totalRevenue)}
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-md border border-dashed border-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  No products available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === "category_revenue") {
      return (
        <div className="grid gap-4 lg:grid-cols-4">
          <CategoryRevenueChart data={categoryRevenue} />
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Category Revenue</CardTitle>
              <CardDescription>Revenue distribution by category.</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryRevenue.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Contribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryRevenue.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(category.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{category.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-md border border-dashed border-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  No category data available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    const stock: InventorySummary = inventorySummary ?? {
      totalItems: 0,
      totalStockValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    };

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {stock.totalItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums text-warning-600">
                {stock.lowStockItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums text-destructive">
                {stock.outOfStockItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Stock Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums text-primary">
                {formatCurrency(stock.totalStockValue)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <StockStatusChart data={stock} />
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inventory Notes</CardTitle>
              <CardDescription>
                Track low stock and out of stock items to plan reorders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Inventory summaries are based on current stock levels and may not reflect
                pending restocks.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      <div ref={printRef} className="absolute left-[-10000px] top-0 w-[800px] text-slate-950">
        <div className="space-y-4">
          <div>
            <div className="text-xl font-semibold">{printMeta.title}</div>
            <div className="text-xs text-slate-500">
              Date Range: {printMeta.dateRange} · Branch: {printMeta.branchLabel}
            </div>
          </div>
          {printSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="text-sm font-semibold">{section.title}</div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {section.headers.map((header) => (
                      <th key={header} className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.length ? (
                    section.rows.map((row, rowIndex) => (
                      <tr key={`${section.title}-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${section.title}-${rowIndex}-${cellIndex}`}
                            className={`border border-slate-200 px-2 py-1 ${typeof cell === "number" ? "text-right tabular-nums" : "text-left"}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={section.headers.length}
                        className="border border-slate-200 px-2 py-2 text-center text-slate-500"
                      >
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Reports</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Reports refresh automatically as you adjust filters and date ranges.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant='outline' onClick={() => handleExport("pdf")}>Export as pdf</Button>
          <Button variant='outline' onClick={() => handleExport("xml")}>Export as XML</Button>
          <Button variant='default' onClick={() => handleExport("csv")}>Export as CSV</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Build a Report</CardTitle>
          <CardDescription className="max-w-2xl">
            {reportTypeMeta?.description || "Select a report type to begin."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportTemplateType)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={reportType === "inventory_summary"}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={reportType === "inventory_summary"}
                className="h-10"
              />
            </div>

            {isSystemAdmin ? (
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select
                  value={selectedBranchId ?? "all"}
                  onValueChange={(value) => setSelectedBranchId(value === "all" ? null : value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Branch Scope</Label>
                <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground h-10 flex items-center">
                  {isBranchScoped ? "Restricted to your branch" : "All branches"}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Reports refresh automatically as you update filters.
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {reportLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  Live
                </>
              )}
            </div>
          </div>

          {reportError && (
            <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {reportError}
            </div>
          )}
        </CardContent>
      </Card>

      {reportLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        renderReportResults()
      )}
    </div>
  );
};

export default ReportsPage;
