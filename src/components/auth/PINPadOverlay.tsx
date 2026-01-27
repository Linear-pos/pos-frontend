import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceModeStore } from '@/stores/deviceMode.store';
import { useAuthStore } from '@/stores/auth.store';
import { axiosInstance } from '@/services/api';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PINPad } from '@/components/auth/PINPad';



interface PINPadOverlayProps {
    onAuthenticated?: () => void;
}

/**
 * PIN Pad Overlay Component
 * Displays as a modal overlay over the POS interface
 * Blocks interaction until cashier authenticates
 */
export const PINPadOverlay = ({ onAuthenticated }: PINPadOverlayProps) => {
    const navigate = useNavigate();
    const { mode, clearMode } = useDeviceModeStore();
    const { setAuth, setLoading, isLoading } = useAuthStore();
    const [pin, setPin] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    // State for Reset Flow
    type FlowState = 'LOGIN' | 'NEW_PIN' | 'CONFIRM_PIN';
    const [flowState, setFlowState] = useState<FlowState>('LOGIN');
    const [tempPin, setTempPin] = useState('');
    const [newPinCandidate, setNewPinCandidate] = useState('');
    const [cashierId, setCashierId] = useState('');

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    // Auto-focus logic or key listening could go here
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (isLoading) return;

            if (e.key >= '0' && e.key <= '9') {
                handleNumberClick(parseInt(e.key));
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Enter') {
                if (pin.length >= 4) handleLogin();
            } else if (e.key === 'Escape') {
                setPin('');
                setLocalError(null);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [pin, isLoading, flowState, tempPin, newPinCandidate, cashierId, mode]);

    if (mode.type !== 'terminal') {
        return null;
    }

    const handleNumberClick = (num: number) => {
        const maxLength = (flowState === 'LOGIN') ? 4 : 6;
        if (pin.length < maxLength) {
            setPin(prev => prev + num);
            setLocalError(null);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setLocalError(null);
    };

    const handleLogin = async () => {
        const minLength = 4;

        if (pin.length < minLength) {
            setLocalError(flowState === 'LOGIN' ? 'PIN too short' : 'PIN must be 4-6 digits');
            triggerShake();
            return;
        }

        if (mode.type !== 'terminal') return;

        setLoading(true);
        setLocalError(null);

        try {
            if (flowState === 'LOGIN') {
                const response = await axiosInstance.post('/cashiers/auth', {
                    tenantId: mode.tenantId,
                    branchId: mode.branchId,
                    terminalId: mode.terminalId,
                    pin: pin
                });

                const payload = response.data?.data;
                const shouldReset = payload?.requiresPinReset;

                if (shouldReset) {
                    setTempPin(pin);
                    setCashierId(payload.user.id);
                    setPin('');
                    setFlowState('NEW_PIN');
                    setLoading(false);
                } else {
                    setAuth(payload);
                    if (onAuthenticated) onAuthenticated();
                }
            } else if (flowState === 'NEW_PIN') {
                if (pin === tempPin) {
                    setLocalError('New PIN cannot be the same as temporary PIN');
                    triggerShake();
                    setPin('');
                    setLoading(false);
                    return;
                }
                setNewPinCandidate(pin);
                setPin('');
                setFlowState('CONFIRM_PIN');
                setLoading(false);
            } else if (flowState === 'CONFIRM_PIN') {
                if (pin !== newPinCandidate) {
                    setLocalError('PINs do not match. Try again.');
                    triggerShake();
                    setPin('');
                    setFlowState('NEW_PIN');
                    setLoading(false);
                    return;
                }

                const resetResponse = await axiosInstance.post('/cashiers/auth/reset-pin', {
                    tenantId: mode.tenantId,
                    branchId: mode.branchId,
                    terminalId: mode.terminalId,
                    cashierId: cashierId,
                    tempPin: tempPin,
                    newPin: pin
                });

                setAuth(resetResponse.data.data);
                if (onAuthenticated) onAuthenticated();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Action failed';
            setLocalError(errorMessage);
            setPin('');
            triggerShake();
            setLoading(false);
        }
    };

    const handleSwitchMode = () => {
        if (window.confirm('Switch device mode? Terminal will need to be set up again.')) {
            clearMode();
            navigate('/select-mode');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, x: isShaking ? [-10, 10, -10, 10, 0] : 0 }}
                transition={{ duration: isShaking ? 0.4 : 0.2 }}
                className="w-full max-w-sm m-4"
            >
                <div className="bg-background/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                    {/* Header with decorative background */}
                    <PINPad
                        pin={pin}
                        onNumberClick={handleNumberClick}
                        onBackspace={handleBackspace}
                        onEnter={handleLogin}
                        title={mode.terminalName}
                        subtitle={
                            flowState === 'LOGIN' ? mode.terminalCode :
                                flowState === 'NEW_PIN' ? "Create New PIN" : "Confirm New PIN"
                        }
                        error={localError}
                        isLoading={isLoading}
                        maxLength={flowState === 'NEW_PIN' || flowState === 'CONFIRM_PIN' ? 6 : 4}
                        mode="overlay"
                        showLogo={true}
                        bottomContent={
                            <button
                                onClick={handleSwitchMode}
                                className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-1.5 py-2 px-4 rounded-full hover:bg-muted"
                                disabled={isLoading}
                            >
                                <X className="w-3 h-3" />
                                Switch Device Mode
                            </button>
                        }
                    />
                </div>
            </motion.div>
        </div>
    );
};
