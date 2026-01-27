import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SessionWarningModalProps {
    open: boolean;
    timeRemaining: number;
    onContinue: () => void;
    onLogout: () => void;
}

export const SessionWarningModal = ({
    open,
    timeRemaining,
    onContinue,
    onLogout
}: SessionWarningModalProps) => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onContinue()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <DialogTitle className="text-center text-xl">
                        Session Timeout Warning
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Your session is about to expire due to inactivity
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </div>
                            <p className="text-sm">
                                You will be automatically logged out in {timeRemaining} seconds
                            </p>
                        </AlertDescription>
                    </Alert>

                    <p className="text-sm text-muted-foreground text-center mt-4">
                        Click "Continue Working" to extend your session, or you will be logged out automatically.
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onLogout}
                        className="w-full sm:w-auto"
                    >
                        Logout Now
                    </Button>
                    <Button
                        onClick={onContinue}
                        className="w-full sm:w-auto"
                        autoFocus
                    >
                        Continue Working
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
