import { Home, Settings } from "lucide-react";

interface PagePlaceholderProps {
  pageName: string;
  description?: string;
}

const PagePlaceholder = ({ pageName, description = "This feature is under development and will be available soon." }: PagePlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen bg-background text-text-primary">
      <div className="text-center">
        <Settings className="h-12 w-12 text-text-muted mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-4">{pageName}</h2>
        <p className="text-text-muted mb-8 max-w-md">{description}</p>
        <div className="bg-card p-6 rounded-lg text-center">
          <p className="text-sm text-text-secondary">Coming Soon</p>
          <p className="text-xs text-text-muted mt-2">Check back later for updates.</p>
        </div>
      </div>
    </div>
  );
};

export default PagePlaceholder;
