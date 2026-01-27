// import { useRef, useEffect } from 'react'; // removed unused
// import { Button } from '@/components/ui/button'; // removed unused
import { Delete, ArrowRight, LockKeyhole } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PINPadProps {
    pin: string;
    onNumberClick: (num: number) => void;
    onBackspace: () => void;
    onEnter?: () => void;
    title?: string;
    subtitle?: string;
    error?: string | null;
    isLoading?: boolean;
    isSuccess?: boolean;
    maxLength?: number;
    showLogo?: boolean;
    mode?: 'card' | 'overlay'; // 'card' for full page, 'overlay' for glassmorphism
    topContent?: React.ReactNode;
    bottomContent?: React.ReactNode;
}

export const PINPad = ({
    pin,
    onNumberClick,
    onBackspace,
    onEnter,
    title,
    subtitle,
    error,
    isLoading = false,
    isSuccess = false,
    maxLength = 4,
    showLogo = false,
    mode = 'card',
    topContent,
    bottomContent
}: PINPadProps) => {

    // Keypad configuration
    // const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]; // removed unused

    const containerClasses = mode === 'overlay'
        ? "bg-background/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden w-full max-w-sm"
        : "bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 overflow-hidden w-full max-w-sm relative";

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className={`text-center ${mode === 'overlay' ? 'relative pt-10 pb-6 px-8 bg-gradient-to-b from-primary/10 to-transparent' : 'mb-8 relative z-10'}`}>
                {showLogo && (
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-background rounded-2xl shadow-lg flex items-center justify-center border border-border/50">
                            {/* Ideally replace with actual Image component if needed */}
                            <LockKeyhole className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                )}

                {topContent}

                {title && (
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p className="text-muted-foreground text-sm font-medium bg-secondary/50 py-1 px-3 rounded-full inline-block mt-2">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className={`px-8 ${mode === 'overlay' ? 'pb-8' : 'pb-0'}`}>
                {/* PIN Display */}
                <div className="mb-8 mt-2">
                    <div className="flex justify-center gap-4 h-12 items-center">
                        {Array.from({ length: maxLength }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={false}
                                animate={{
                                    scale: i < pin.length ? 1.2 : 1,
                                    backgroundColor: i < pin.length ? 'hsl(var(--primary))' : 'transparent',
                                    borderColor: i < pin.length ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                }}
                                // Use distinct styles based on mode if needed, but this shared style works well
                                className={`w-4 h-4 rounded-full border-2 border-muted-foreground/30 ${i < pin.length ? 'bg-primary border-primary' : ''}`}
                            />
                        ))}
                    </div>
                    <div className="h-6 mt-2 flex items-center justify-center text-center">
                        <AnimatePresence mode="wait">
                            {error ? (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm text-destructive font-medium"
                                >
                                    {error}
                                </motion.p>
                            ) : (
                                <p className="text-xs text-muted-foreground/70">
                                    {/* Optional hint could go here */}
                                </p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <motion.button
                            key={num}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNumberClick(num)}
                            className="h-16 rounded-2xl bg-secondary/50 hover:bg-secondary text-2xl font-semibold transition-colors border border-border/50"
                            disabled={isLoading}
                        >
                            {num}
                        </motion.button>
                    ))}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onBackspace}
                        className="h-16 rounded-2xl bg-secondary/30 hover:bg-secondary/50 flex items-center justify-center transition-colors hover:text-destructive"
                        disabled={isLoading}
                    >
                        <Delete className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNumberClick(0)}
                        className="h-16 rounded-2xl bg-secondary/50 hover:bg-secondary text-2xl font-semibold transition-colors border border-border/50"
                        disabled={isLoading}
                    >
                        0
                    </motion.button>

                    {onEnter ? (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onEnter}
                            className={`h-16 rounded-2xl flex items-center justify-center font-semibold text-lg transition-all ${pin.length >= 4
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'bg-secondary/30 text-muted-foreground'
                                }`}
                            disabled={isLoading || pin.length < 4}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isSuccess ? (
                                <ArrowRight className="h-6 w-6" />
                            ) : (
                                'Enter'
                            )}
                        </motion.button>
                    ) : (
                        // Placeholder for grid alignment if no enter button needed in grid
                        <div />
                    )}
                </div>

                {/* Bottom Content (Logout/Switch) */}
                {bottomContent && (
                    <div className="text-center pt-2">
                        {bottomContent}
                    </div>
                )}
            </div>
        </div>
    );
};
