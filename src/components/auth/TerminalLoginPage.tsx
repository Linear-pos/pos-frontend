import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceModeStore } from '@/stores/deviceMode.store';
import { useAuthStore } from '@/stores/auth.store';
import { axiosInstance } from '@/services/api';
import { PINPad } from '@/components/auth/PINPad';



export const TerminalLoginPage = () => {
    const navigate = useNavigate();
    const { mode, clearMode } = useDeviceModeStore();
    const { setAuth, setLoading, isLoading } = useAuthStore();
    const [pin, setPin] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // State for Reset Flow
    type FlowState = 'LOGIN' | 'NEW_PIN' | 'CONFIRM_PIN';
    const [flowState, setFlowState] = useState<FlowState>('LOGIN');
    const [tempPin, setTempPin] = useState('');
    const [newPinCandidate, setNewPinCandidate] = useState('');
    const [cashierId, setCashierId] = useState('');

    useEffect(() => {
        // Redirect if not in terminal mode
        if (mode.type !== 'terminal') {
            navigate('/select-mode');
        }
    }, [mode, navigate]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLoading || isSuccess) return;

            if (e.key >= '0' && e.key <= '9') {
                handleNumberClick(parseInt(e.key));
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Enter') {
                handleLogin();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pin, isLoading, isSuccess, flowState, tempPin, newPinCandidate, cashierId, mode]);

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
        const minLength = (flowState === 'LOGIN') ? 4 : 4;

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
                // Step 1: Attempt Login
                const response = await axiosInstance.post('/cashiers/auth', {
                    tenantId: mode.tenantId,
                    branchId: mode.branchId,
                    terminalId: mode.terminalId,
                    pin: pin
                });

                const payload = response.data?.data;
                const shouldReset = payload?.requiresPinReset;


                if (shouldReset === true || shouldReset === 'true') {
                    // Transition to Reset Flow
                    setTempPin(pin);
                    setCashierId(payload.user.id);
                    setPin('');
                    setFlowState('NEW_PIN');
                    setLoading(false);
                } else {
                    // Success Login
                    setIsSuccess(true);
                    setAuth(payload);
                    setTimeout(() => navigate('/pos'), 500);
                }

            } else if (flowState === 'NEW_PIN') {
                // Step 2: Receive New PIN
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
                // Step 3: Confirm and Reset
                if (pin !== newPinCandidate) {
                    setLocalError('PINs do not match. Try again.');
                    triggerShake();
                    setPin('');
                    setFlowState('NEW_PIN'); // Start over new pin entry
                    setLoading(false);
                    return;
                }

                // Perform Reset call which now returns AuthResponse directly
                const resetResponse = await axiosInstance.post('/cashiers/auth/reset-pin', {
                    tenantId: mode.tenantId,
                    branchId: mode.branchId,
                    terminalId: mode.terminalId,
                    cashierId: cashierId,
                    tempPin: tempPin,
                    newPin: pin
                });

                setIsSuccess(true);
                setAuth(resetResponse.data.data);
                setTimeout(() => navigate('/pos'), 500);
            }
        } catch (err: any) {
            console.error('Action error:', err);
            const errorMessage = err.response?.data?.message || 'Action failed';
            setLocalError(errorMessage);
            setPin('');
            triggerShake();
            // If reset failed, potentially stay in CONFIRM or go back unique error?
            // Usually stay to let them retry or correct.
            setLoading(false);
        }
    };

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const handleSwitchMode = () => {
        if (window.confirm('Switch to management mode? This will require re-entering the terminal code later.')) {
            clearMode();
            navigate('/select-mode');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className={`w-full max-w-sm ${isShaking ? 'animate-shake' : ''}`}>
                <PINPad
                    pin={pin}
                    onNumberClick={handleNumberClick}
                    onBackspace={handleBackspace}
                    onEnter={handleLogin}

                    title={mode.type === 'terminal' ? mode.terminalName : 'Terminal Login'}
                    subtitle={
                        flowState === 'LOGIN' ? (mode.type === 'terminal' ? mode.terminalCode : '') :
                            flowState === 'NEW_PIN' ? "Create New PIN" : "Confirm New PIN"
                    }
                    error={localError}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    maxLength={flowState === 'NEW_PIN' || flowState === 'CONFIRM_PIN' ? 6 : 4}
                    mode="card"
                    showLogo={true}

                    bottomContent={
                        <button
                            onClick={handleSwitchMode}
                            className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                            disabled={isLoading}
                        >
                            Management Mode
                        </button>
                    }
                />
            </div>

            {/* Styles for shake animation */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};

export default TerminalLoginPage;
