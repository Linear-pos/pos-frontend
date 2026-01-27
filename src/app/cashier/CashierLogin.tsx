import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinPad } from '../../components/cashier/PinPad';
import { useCashierStore } from '../../stores/cashier.store';
import { authenticateCashier } from '../../services/cashier.api';
import { useAuthStore } from '../../stores/auth.store';
import { LogOut, Store } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function CashierLogin() {
    const navigate = useNavigate();
    const { setCashier } = useCashierStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePinSubmit = async (pin: string) => {
        setError('');
        setLoading(true);

        try {
            // Get tenant ID from authenticated user
            const tenantId = user?.tenant_id;
            if (!tenantId) {
                throw new Error('No tenant found. Please login first.');
            }

            // Authenticate cashier
            const response = await authenticateCashier({
                tenantId,
                pin,
            });

            if (response.success) {
                // Store cashier info and token
                setCashier(response.data.cashier, response.data.token);

                // Navigate to terminal selection
                navigate('/cashier/terminal-select');
            } else {
                setError('Authentication failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Cashier login error:', err);

            if (err.response?.status === 403) {
                setError('Account is locked. Please contact your supervisor.');
            } else if (err.response?.status === 401) {
                setError('Invalid PIN. Please try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                        <Store className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Cashier Login
                    </h1>
                    <p className="text-muted-foreground">
                        {user?.name ? `Welcome, ${user.name}` : 'Enter your PIN to continue'}
                    </p>
                </div>

                {/* PIN Pad Card */}
                <div className="bg-card text-card-foreground rounded-2xl shadow-xl p-8">
                    <PinPad
                        onComplete={handlePinSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                        error={error}
                        title="Enter Your PIN"
                        subtitle="4-6 digit PIN"
                    />
                </div>

                {/* Back to Main Menu */}
                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Back to Main Menu
                    </Button>
                </div>
            </div>
        </div>
    );
}
