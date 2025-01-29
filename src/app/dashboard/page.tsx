import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
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

// Create a wrapper component to get the URL parameter
const RunDetailsWrapper = () => {
  const { runUuid } = useParams();
  if (!runUuid) {
    return <Navigate to="/dashboard/task/detection/run" replace />;
  }
  return <EmbeddingDetectionRunDetails runUuid={runUuid} />;
};

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">All Runs</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Run</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="m-4">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="task/detection/run" replace />}
            />
            <Route
              path="task/detection/run"
              element={<EmbeddingDetectionRunDetailsUnselected />}
            />
            <Route
              path="task/detection/run/:runUuid"
              element={<RunDetailsWrapper />}
            />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
