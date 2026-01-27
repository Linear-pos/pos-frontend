import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockStatusChartProps {
    data: {
        totalItems: number;
        lowStockItems: number;
        outOfStockItems: number;
    };
}

export const StockStatusChart = ({ data }: StockStatusChartProps) => {
    const chartData = [
        { name: 'In Stock', value: data.totalItems - data.lowStockItems - data.outOfStockItems, color: 'var(--chart-1)' },
        { name: 'Low Stock', value: data.lowStockItems, color: 'var(--chart-4)' },
        { name: 'Out of Stock', value: data.outOfStockItems, color: 'var(--destructive)' },
    ].filter(item => item.value > 0);

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                stroke='none'
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
                                itemStyle={{ color: "var(--card-foreground)" }}
                                formatter={(value: number | undefined) => [`${(value ?? 0).toLocaleString()}`, "Items"]}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
