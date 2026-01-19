import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { subscriptionsAPI, type Subscription, type UsageStats, type Invoice } from '../api/subscriptions.api';
import { CreditCard, TrendingUp, Users, Package, Building2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const LicensingManagement = () => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Upgrade/Downgrade state
    const [selectedBranches, setSelectedBranches] = useState(1);
    const [upgrading, setUpgrading] = useState(false);

    // License key state
    const [licenseKey, setLicenseKey] = useState('');
    const [activating, setActivating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subData, usageData, invoicesData] = await Promise.all([
                subscriptionsAPI.getCurrentSubscription(),
                subscriptionsAPI.getUsageStats(),
                subscriptionsAPI.getInvoices(),
            ]);

            setSubscription(subData);
            setUsage(usageData);
            setInvoices(invoicesData);
            setSelectedBranches(subData.maxBranches);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!subscription || selectedBranches <= subscription.maxBranches) return;

        try {
            setUpgrading(true);
            await subscriptionsAPI.upgradeSubscription(selectedBranches);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upgrade subscription');
        } finally {
            setUpgrading(false);
        }
    };

    const handleDowngrade = async () => {
        if (!subscription || selectedBranches >= subscription.maxBranches) return;

        try {
            setUpgrading(true);
            await subscriptionsAPI.downgradeSubscription(selectedBranches);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to downgrade subscription');
        } finally {
            setUpgrading(false);
        }
    };

    const handleActivateLicense = async () => {
        if (!licenseKey.trim()) return;

        try {
            setActivating(true);
            await subscriptionsAPI.activateLicense(licenseKey);
            await fetchData();
            setLicenseKey('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate license key');
        } finally {
            setActivating(false);
        }
    };

    const calculatePrice = (branches: number) => {
        if (branches <= 0) return 0;
        if (branches === 1) return 5000;
        return 5000 + ((branches - 1) * 3000);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any }> = {
            trial: { variant: 'secondary', icon: Clock },
            active: { variant: 'default', icon: CheckCircle2 },
            suspended: { variant: 'destructive', icon: AlertCircle },
            cancelled: { variant: 'outline', icon: AlertCircle },
        };

        const config = variants[status] || variants.trial;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {status.toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading subscription data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!subscription || !usage) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No subscription found</AlertDescription>
            </Alert>
        );
    }

    const daysRemaining = subscription.trialEndsAt
        ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Licensing & Subscription</h1>
                <p className="text-muted-foreground">Manage your subscription and billing</p>
            </div>

            {/* Trial Warning */}
            {subscription.status === 'trial' && daysRemaining !== null && (
                <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                        Your trial ends in <strong>{daysRemaining} days</strong>. Upgrade to continue using all features.
                    </AlertDescription>
                </Alert>
            )}

            {/* Current Plan Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>Per-Branch Pricing</CardDescription>
                        </div>
                        {getStatusBadge(subscription.status)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Branches</p>
                            <p className="text-2xl font-bold">
                                {usage.branches.current} / {usage.branches.max}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Monthly Cost</p>
                            <p className="text-2xl font-bold">KES {subscription.pricePerMonth.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Next Billing</p>
                            <p className="text-2xl font-bold">
                                {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Branches</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usage.branches.current}</div>
                        <p className="text-xs text-muted-foreground">of {usage.branches.max} allowed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usage.users}</div>
                        <p className="text-xs text-muted-foreground">Unlimited</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usage.products}</div>
                        <p className="text-xs text-muted-foreground">Unlimited</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usage.branches.current * 50}GB</div>
                        <p className="text-xs text-muted-foreground">50GB per branch</p>
                    </CardContent>
                </Card>
            </div>

            {/* Upgrade/Downgrade */}
            <Card>
                <CardHeader>
                    <CardTitle>Adjust Your Plan</CardTitle>
                    <CardDescription>Add or remove branches from your subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Number of Branches</Label>
                            <span className="text-2xl font-bold">{selectedBranches}</span>
                        </div>
                        <Slider
                            value={[selectedBranches]}
                            onValueChange={(value) => setSelectedBranches(value[0])}
                            min={1}
                            max={20}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>1 branch</span>
                            <span>20 branches</span>
                        </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span>Base Price (1 branch)</span>
                            <span>KES 5,000</span>
                        </div>
                        {selectedBranches > 1 && (
                            <div className="flex justify-between">
                                <span>Additional Branches ({selectedBranches - 1} × KES 3,000)</span>
                                <span>KES {((selectedBranches - 1) * 3000).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total Monthly Cost</span>
                            <span>KES {calculatePrice(selectedBranches).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {selectedBranches > subscription.maxBranches && (
                            <Button onClick={handleUpgrade} disabled={upgrading} className="flex-1">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                {upgrading ? 'Upgrading...' : `Upgrade to ${selectedBranches} Branches`}
                            </Button>
                        )}
                        {selectedBranches < subscription.maxBranches && (
                            <Button onClick={handleDowngrade} disabled={upgrading} variant="outline" className="flex-1">
                                {upgrading ? 'Downgrading...' : `Downgrade to ${selectedBranches} Branches`}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* License Key Activation */}
            <Card>
                <CardHeader>
                    <CardTitle>Activate License Key</CardTitle>
                    <CardDescription>Have a license key? Activate it here</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                            maxLength={19}
                        />
                        <Button onClick={handleActivateLicense} disabled={activating || !licenseKey.trim()}>
                            {activating ? 'Activating...' : 'Activate'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View your past invoices and payments</CardDescription>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No invoices yet</p>
                    ) : (
                        <div className="space-y-2">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">KES {invoice.amount.toLocaleString()}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                            {invoice.status}
                                        </Badge>
                                        {invoice.status === 'pending' && (
                                            <Button size="sm" variant="outline">Pay Now</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LicensingManagement;
