import type { ComponentType } from "react"
import { CreditCard } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { cn } from "@/lib/utils"

export interface MenuItem {
  title: string
  url: string
  icon: ComponentType<{ className?: string }>
  roles?: string[] // Optional: restrict to specific roles
}

export interface MenuGroup {
  label: string
  items: MenuItem[]
}

export interface SidebarProps {
  brandLogo?: string
  brandName: string
  brandSubtitle: string
  brandUrl: string
  menuGroups: MenuGroup[]
  footerGroups?: MenuGroup[]
}

const AppSidebar = ({
  brandLogo,
  brandName,
  brandSubtitle,
  brandUrl,
  menuGroups,
  footerGroups
}: SidebarProps) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;

  const isItemActive = (url: string) => {
    // Basic route match. Ignores query strings in menu URLs.
    const targetPath = url.split("?")[0];
    if (targetPath === "/") return location.pathname === "/";
    return location.pathname === targetPath || location.pathname.startsWith(`${targetPath}/`);
  };

  // Filter menu items based on user role
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter(item => {
      // If no roles specified, show to everyone
      if (!item.roles || item.roles.length === 0) return true;
      // Otherwise, check if user's role is in the allowed roles
      return item.roles.includes(userRole || '');
    });
  };

  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: filterMenuItems(group.items)
  }));

  const filteredFooterGroups = footerGroups?.map(group => ({
    ...group,
    items: filterMenuItems(group.items)
  }));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                tooltip={brandName}
                className={cn(
                  "h-12 px-2",
                  "data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground"
                )}
              >
                <Link to={brandUrl} className="flex items-center gap-3">
                  <div className="shrink-0 grid place-items-center size-8 rounded-md bg-sidebar-accent/60 ring-1 ring-sidebar-border/70 overflow-hidden">
                    {brandLogo ? (
                      <img
                        src={brandLogo}
                        alt={brandName}
                        className="size-8 object-contain"
                      />
                    ) : (
                      <CreditCard className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                    <div className="truncate text-sm font-semibold tracking-tight">
                      {brandName}
                    </div>
                    {brandSubtitle ? (
                      <div className="truncate text-xs text-sidebar-foreground/70">
                        {brandSubtitle}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <SidebarSeparator className="mt-2" />
      </SidebarHeader>

      <SidebarContent className="gap-3 ml-2">
        {filteredMenuGroups.map((group, index) => (
          <SidebarGroup
            key={index}
            className="py-1"
          >
            <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-wide uppercase text-sidebar-foreground/65">
              {group.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isItemActive(item.url)}
                      className="h-9 px-2.5"
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer groups - also compact */}
      {filteredFooterGroups && filteredFooterGroups.length > 0 && (
        <SidebarFooter className="pt-0">
          <SidebarSeparator className="mb-2" />
          {filteredFooterGroups.map((group, index) => (
            <SidebarGroup key={index} className="py-1">
              <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-wide uppercase text-sidebar-foreground/65">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isItemActive(item.url)}
                        className="h-9 px-2.5"
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

export default AppSidebar
