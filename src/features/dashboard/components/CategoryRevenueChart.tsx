import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryRevenueChartProps {
    data: { category: string; totalRevenue: number }[];
}

export const CategoryRevenueChart = ({ data }: CategoryRevenueChartProps) => {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="category"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `KES ${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                                formatter={(value: number | undefined) => [`KES ${(value ?? 0).toLocaleString()}`, "Revenue"]}
                            />
                            <Bar
                                dataKey="totalRevenue"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
