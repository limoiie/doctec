import * as React from "react";
import { Link } from "react-router-dom";
import { Radar } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Modules, NavItem, navMain } from "@/cus-components/SidebarNavDataAdmin";
import { useAuth } from "@/contexts/auth-context";


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeItem: NavItem;
}

export function AppSidebar({ activeItem, ...props }: AppSidebarProps) {
  const { setOpen } = useSidebar();
  const { user } = useAuth();

  return (
      <Sidebar
        collapsible="icon"
        className="!w-50 border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                size="lg" 
                asChild 
                className="md:h-8 md:p-0"
              >
                <Link to="admin/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Radar className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">文件违规流转检测工具</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => setOpen(true)}
                        isActive={activeItem.module === item.module}
                        className="px-2.5 md:px-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col items-center gap-4">
            <NavUser user={user!} />
          </div>
        </SidebarFooter>
      </Sidebar>
  );
}
