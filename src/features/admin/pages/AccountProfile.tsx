import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { axiosInstance } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Building2,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    Shield,
    UserRound,
} from 'lucide-react';

export const AccountProfile = () => {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Profile form
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    // Password form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        setProfileData({
            name: user?.name || '',
            email: user?.email || '',
        });
    }, [user?.name, user?.email]);

    const roleName = useMemo(() => {
        const r: any = user?.role;
        return typeof r === 'string' ? r : r?.name || 'N/A';
    }, [user?.role]);

    const initials = useMemo(() => {
        const name = (user?.name || '').trim();
        if (!name) return 'U';
        const parts = name.split(/\s+/).slice(0, 2);
        return parts.map(p => p.charAt(0).toUpperCase()).join('');
    }, [user?.name]);

    const tenantLabel = user?.tenant_name || (user?.tenant_id ? `Tenant ${user.tenant_id.slice(0, 8)}` : null);
    const branchLabel = user?.branch_name || (user?.branch_id ? `Branch ${String(user.branch_id).slice(0, 8)}` : null);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError(null);

        try {
            const response = await axiosInstance.put('/users/me', {
                name: profileData.name,
            });
            // Keep local auth store in sync even if backend response shape varies.
            setUser(user ? { ...user, name: profileData.name } : user);
            toast.success('Profile updated');

            // If backend returns a user payload, prefer it.
            const data = (response as any)?.data?.data;
            if (data && user) {
                setUser({
                    ...user,
                    name: data.name ?? profileData.name,
                    branch_id: data.branchId ?? user.branch_id,
                    branch_name: data.branchName ?? user.branch_name,
                });
            }
        } catch (err: any) {
            setProfileError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            setPasswordLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            setPasswordLoading(false);
            return;
        }

        try {
            await axiosInstance.post('/users/me/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password changed');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const copyToClipboard = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <section className="relative">
            <div className="pointer-events-none absolute inset-x-0 -top-10 h-48 overflow-hidden">
                <div className="absolute left-1/2 top-0 h-56 w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/18 via-emerald-500/12 to-primary/10 blur-3xl" />
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="mb-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted ring-1 ring-border">
                                <span className="text-sm font-semibold tracking-tight">{initials}</span>
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-semibold tracking-tight">Profile Information</h1>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="gap-1">
                                        <Shield className="h-3.5 w-3.5" />
                                        {roleName.replace('_', ' ')}
                                    </Badge>
                                    {/* {tenantLabel ? (
                                        <Badge variant="outline" className="gap-1">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {tenantLabel}
                                        </Badge>
                                    ) : null} */}
                                    {/* {branchLabel ? (
                                        <Badge variant="outline" className="gap-1">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {branchLabel}
                                        </Badge>
                                    ) : null} */}
                                </div>
                            </div>
                        </div>

                        {user?.id ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => copyToClipboard(user.id, "User ID")}
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy ID
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </motion.div>

                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                            <UserRound className="h-4 w-4" />
                            Profile
                        </div>
                        <div className="mt-4 grid gap-6 lg:grid-cols-5">
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-base">Profile Information</CardTitle>
                                    <CardDescription>Update your personal details.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {profileError ? (
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertDescription>{profileError}</AlertDescription>
                                        </Alert>
                                    ) : null}
                                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email</Label>
                                                <div className="relative">
                                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="pl-9 bg-muted"
                                                        value={profileData.email}
                                                        disabled
                                                        title="Email cannot be changed."
                                                        aria-readonly="true"
                                                    />
                                                </div>
                                                {/* <p className="text-xs text-muted-foreground">
                                                    Email is locked. Contact a system admin to change it.
                                                </p> */}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid gap-2">
                                            <Label>Role</Label>
                                            <Input value={roleName.replace('_', ' ')} disabled className="bg-muted" />
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <Button type="submit" disabled={profileLoading} className="min-w-36">
                                                {profileLoading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-base">Account Details</CardTitle>
                                    <CardDescription>Quick info for support and auditing.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg border bg-card p-3">
                                        <div className="text-xs text-muted-foreground">User ID</div>
                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <div className="min-w-0 font-mono text-xs truncate">{user?.id || 'N/A'}</div>
                                            {user?.id ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(user.id, "User ID")}
                                                    className="shrink-0"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Tenant</span>
                                            <span className="font-medium">{tenantLabel || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Branch</span>
                                            <span className="font-medium">{branchLabel || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="font-medium">{user?.is_active === false ? 'Inactive' : 'Active'}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                            <KeyRound className="h-4 w-4" />
                            Account Security
                        </div>
                        <div className="mt-4 grid gap-6 lg:grid-cols-5">
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>Use a strong password you do not reuse elsewhere.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {passwordError ? (
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertDescription>{passwordError}</AlertDescription>
                                        </Alert>
                                    ) : null}
                                    <form onSubmit={handlePasswordChange} className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type={showCurrent ? 'text' : 'password'}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2"
                                                    onClick={() => setShowCurrent(v => !v)}
                                                    tabIndex={-1}
                                                >
                                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showNew ? 'text' : 'password'}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        required
                                                        minLength={8}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-1 top-1/2 -translate-y-1/2"
                                                        onClick={() => setShowNew(v => !v)}
                                                        tabIndex={-1}
                                                    >
                                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="confirmPassword">Confirm</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirm ? 'text' : 'password'}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        required
                                                        minLength={8}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-1 top-1/2 -translate-y-1/2"
                                                        onClick={() => setShowConfirm(v => !v)}
                                                        tabIndex={-1}
                                                    >
                                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <Button type="submit" disabled={passwordLoading} className="min-w-40">
                                                {passwordLoading ? 'Updating...' : 'Update Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-base">Security Tips</CardTitle>
                                    <CardDescription>Small habits that prevent big problems.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="rounded-lg border bg-card p-3">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Shield className="h-4 w-4" />
                                            Use a unique password
                                        </div>
                                        <div className="mt-1 text-muted-foreground">
                                            Avoid reusing passwords across systems.
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-card p-3">
                                        <div className="flex items-center gap-2 font-medium">
                                            <KeyRound className="h-4 w-4" />
                                            Rotate if compromised
                                        </div>
                                        <div className="mt-1 text-muted-foreground">
                                            Change immediately if you suspect exposure.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AccountProfile;
