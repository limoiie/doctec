import React from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar-admin";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserDetails } from "@/cus-components/UserDetails";
import { PersonalInformationDetails } from "@/cus-components/PersonalInformationDetails";
import { navMain } from "@/cus-components/SidebarNavDataAdmin";

// Create a wrapper component to get the URL parameter

export default function AdminDashboardPage() {
  const location = useLocation();

  // Get active item based on current URL
  const activeItem =
    navMain.find((item) => location.pathname.endsWith(item.url)) ||
    navMain[0];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "200px",
        } as React.CSSProperties
      }
    >
      <AppSidebar activeItem={activeItem} />
      <SidebarInset>
        
        <div className="m-4">
          <Routes>
            <Route
              path="/user-management"
              element={<UserDetails />}
            />
            <Route
              path="/personal-information"
              element={<PersonalInformationDetails />}
            />
           
          </Routes>
        
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  );
}
