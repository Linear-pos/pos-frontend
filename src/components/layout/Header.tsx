import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  X,
  //   Bell,
} from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  // subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showSearch?: boolean;
  showUserMenu?: boolean;
  showViewSwitch?: boolean;
  showNotifications?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onSwitchUserView?: () => void;
  onLogoutClick?: () => void;
}

const Header = ({
  title,
  // subtitle,
  showSearch = false,
  showUserMenu = false,
  showNotifications,
  userInfo,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}: HeaderProps) => {
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const toggleSearch = () => {
    setSearchActive((prev) => !prev);
    if (searchActive) {
      setQuery("");
      onSearch?.("");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          {/* Left Section - Title */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg hidden sm:flex font-semibold text-foreground truncate">
              {title}
            </h1>
            <h1 className="text-lg sm:hidden font-semibold text-foreground truncate">
              Admin Dashboard
            </h1>
            {/* {subtitle && (
              <span className="text-sm hidden sm:flex text-muted-foreground whitespace-nowrap">
                • {subtitle}
              </span>
            )} */}
          </div>

          {/* Right Section - Actions and User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showSearch && (
              <div className="relative flex items-center">
                {searchActive ? (
                  <>
                    <Input
                      type="text"
                      value={query}
                      onChange={handleSearchChange}
                      placeholder="Search..."
                      className="w-48 sm:w-64 transition-all duration-200"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0"
                      onClick={toggleSearch}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSearch}
                    className="h-9 w-9"
                  >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                )}
              </div>
            )}

            {/* Open POS Button */}
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <a href="/pos">Open POS</a>
            </Button>

            {/* Notification Bell and Theme Toggle - Aligned together */}
            <div className="flex items-center gap-1">
              {/* Notification Bell */}
              {showNotifications && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative"
                  onClick={onNotificationClick}
                >
                  {/* <NotificationBell  */}

                  <span className="sr-only">Notifications</span>
                </Button>
              )}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark";
                  setTheme(newTheme);
                }}
              >
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:inline" />
              </Button>
            </div>

            {/* User Menu */}
            {showUserMenu && userInfo && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userInfo.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userInfo.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={onSwitchUserView}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    <span>Switch View</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogoutClick}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2 border-t border-border/40">
        {/* <BreadcrumbNavigation /> */}
      </div>
    </div>
  );
};

export default Header;
export type { HeaderProps, BreadcrumbItem };
