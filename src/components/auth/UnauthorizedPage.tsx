import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function UnauthorizedPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-12 w-12 text-red-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>

                <p className="text-muted-foreground text-lg">
                    It looks like you don't have the necessary permissions to access this page.
                    If you believe this is an error, please reach out to your branch manager or administrator for assistance.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                    <Button variant="default" onClick={handleLogout} className="w-full sm:w-auto">
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default UnauthorizedPage;
