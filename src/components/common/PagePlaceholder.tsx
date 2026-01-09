interface PagePlaceholderProps {
  pageName: string;
  description?: string;
}

const PagePlaceholder = ({
  pageName,
  description = ` ${pageName} page is yet to be implemented.`,
}: PagePlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen bg-background text-text-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{pageName}</h1>

        <p className="text-text-muted mb-8 max-w-md">{description}</p>
      </div>
    </div>
  );
};

export default PagePlaceholder;
