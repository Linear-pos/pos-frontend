import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface SalesTrendChartProps {
    data: { date: string; total: number }[];
}

export const SalesTrendChart = ({ data }: SalesTrendChartProps) => {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return isNaN(date.getTime()) ? str : format(date, "MMM dd");
                                }}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `KES ${value}`}
                            />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                            <Tooltip
                                contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
                                formatter={(value: number | undefined) => [`KES ${(value ?? 0).toLocaleString()}`, "Total Sales"]}
                                labelFormatter={(label) => {
                                    const date = new Date(label);
                                    return isNaN(date.getTime()) ? label : format(date, "MMM dd, yyyy");
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="var(--primary)"
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
