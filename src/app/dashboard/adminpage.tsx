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
import { ThemeToggle } from "@/components/theme-toggle";
import { NewDetectionButton } from "@/components/new-detection-button";

// Create a wrapper component to get the URL parameter

export default function DashboardPage() {
  const location = useLocation();

  // Get active item based on current URL
  const activeItem =
    navMain.find((item) => location.pathname.startsWith(item.url)) ||
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
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {location.pathname
                .split("/")
                .filter((item) => item.length > 0)
                .slice(0, -1)
                .map((item, index, array) => (
                  <React.Fragment key={`breadcrumb-${index}`}>
                    <BreadcrumbItem
                      className={
                        index === array.length - 1 ? "hidden md:block" : ""
                      }
                    >
                      <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </React.Fragment>
                ))}
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {
                    location.pathname
                      .split("/")
                      .filter((item) => item.length > 0)
                      .slice(-1)[0]
                  }
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="m-4">
          <Routes>
            <Route
              path="user-management"
              element={<UserDetails />}
            />
            <Route
              path="personal-information"
              element={<PersonalInformationDetails />}
            />
           
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
