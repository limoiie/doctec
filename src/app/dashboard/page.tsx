import React from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
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
import { EmbeddingDetectionRunDetails } from "@/cus-components/EmbeddingDetectionRunDetails";
import { EmbeddingDetectionRunDetailsUnselected } from "@/cus-components/EmbeddingDetectionRunDetailsUnselected";
import { EmbeddingDetectionConfigDetails } from "@/cus-components/EmbeddingDetectionConfigDetails";
import { navMain } from "@/cus-components/SidebarNavData";
import { ThemeToggle } from "@/components/theme-toggle";

// Create a wrapper component to get the URL parameter
const RunDetailsWrapper = () => {
  const { runUuid } = useParams();
  if (!runUuid) {
    return <Navigate to="/dashboard/detection/task-run" replace />;
  }
  return <EmbeddingDetectionRunDetails runUuid={runUuid} />;
};

// Create a wrapper component to get the URL parameter for config details
const ConfigDetailsWrapper = () => {
  const { configUuid } = useParams();
  if (!configUuid) {
    return <Navigate to="/dashboard/detection/task-config" replace />;
  }
  return <EmbeddingDetectionConfigDetails configUuid={configUuid} />;
};

export default function Page() {
  const location = useLocation();

  // Get active item based on current URL
  const activeItem =
    navMain.find((item) => location.pathname.startsWith(item.url)) ||
    navMain[0];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
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
                  <>
                    <BreadcrumbItem
                      key={index}
                      className={
                        index === array.length - 1 ? "hidden md:block" : ""
                      }
                    >
                      <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
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
              path="/"
              element={<Navigate to="detection/task-run" replace />}
            />
            <Route
              path="detection/task-run"
              element={<EmbeddingDetectionRunDetailsUnselected />}
            />
            <Route
              path="detection/task-run/:runUuid"
              element={<RunDetailsWrapper />}
            />
            <Route
              path="detection/task-config/:configUuid"
              element={<ConfigDetailsWrapper />}
            />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
