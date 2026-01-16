import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";

interface Category {
    id: string; // or name if string
    name: string;
    count?: number;
}

interface CategorySidebarProps {
    categories: Category[];
    selectedCategory: string | null; // null = All
    onSelectCategory: (category: string | null) => void;
    className?: string;
}

export const CategorySidebar = ({
    categories,
    selectedCategory,
    onSelectCategory,
    className = "",
}: CategorySidebarProps) => {
    return (
        <div className={`flex flex-col gap-2 h-full ${className}`}>
            <div className="mb-4 px-2">
                <h3 className="font-semibold text-lg tracking-tight">Categories</h3>
            </div>
            <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                className="justify-start w-full"
                onClick={() => onSelectCategory(null)}
            >
                <LayoutGrid className="mr-2 h-4 w-4" />
                All Products
            </Button>
            {categories.map((cat) => (
                <Button
                    key={cat.id}
                    variant={selectedCategory === cat.name ? "secondary" : "ghost"}
                    className={`justify-start w-full ${selectedCategory === cat.name ? "bg-accent text-accent-foreground" : ""}`}
                    onClick={() => onSelectCategory(cat.name)}
                >
                    <span className="truncate flex-1 text-left">{cat.name}</span>
                    {cat.count !== undefined && (
                        <span className="ml-auto text-xs text-muted-foreground">{cat.count}</span>
                    )}
                </Button>
            ))}
        </div>
    );
};
