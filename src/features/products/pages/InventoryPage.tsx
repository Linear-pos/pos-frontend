import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const InventoryPage = () => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
                <div className="flex gap-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Receive Stock
                    </Button>
                    <Button variant="outline">
                        Stock Adjustment
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Stock Overview</TabsTrigger>
                    <TabsTrigger value="adjustments">Adjustments History</TabsTrigger>
                    <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Stock Levels</CardTitle>
                            <CardDescription>
                                Overview of current stock quantities and value across all products.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Stock Level Table Placeholder
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="adjustments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Adjustments</CardTitle>
                            <CardDescription>
                                History of all stock movements (In/Out/Adjustments).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Adjustments History Table Placeholder
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Alerts</CardTitle>
                            <CardDescription>
                                Products that are below their reorder level.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Low Stock Table Placeholder
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InventoryPage;
