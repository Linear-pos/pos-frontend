import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import { axiosInstance } from '@/services/api';
import { User, Lock } from 'lucide-react';

export const AccountProfile = () => {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axiosInstance.put('/users/me', {
                name: profileData.name,
                email: profileData.email,
            });
            setSuccess('Profile updated successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.post('/users/me/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setSuccess('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-primary mb-6">Account Profile</h1>

            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-success-600/10 text-success-600 px-4 py-3 rounded-md mb-4">
                    {success}
                </div>
            )}

            <div className="grid gap-6">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your personal information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
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
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Input
                                    value={typeof user?.role === 'string' ? user.role : user?.role?.name || 'N/A'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    minLength={8}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 8 characters
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <Button type="submit" disabled={loading}>
                                {loading ? 'Changing...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AccountProfile;
