import * as React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlusIcon,
  FileSearchIcon,
  FileSlidersIcon,
  IdCardIcon,
  PercentIcon,
  Radar,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { useEel } from "@/hooks/use-eel";
import { EmbDetectionRunData } from "@/types/EmbDetectionRunData.schema";
import { StatusIcon } from "@/cus-components/StatusIcon";
import { formatDateTime } from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Embed Detections",
      url: "/dashboard/task/detections",
      icon: FileSearchIcon,
      isActive: true,
    },
    {
      title: "Embed Detection Configs",
      url: "/dashboard/task/detections/configs",
      icon: FileSlidersIcon,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const [detectRuns, setDetectRuns] = React.useState<EmbDetectionRunData[]>([]);
  const { setOpen } = useSidebar();
  const { eel } = useEel();

  useEffect(() => {
    eel
      .fetchEmbeddingDetectionRuns(0, 1000)()
      .then((runs: EmbDetectionRunData[]) => {
        console.log("fetchEmbeddingDetectionRuns", runs);
        setDetectRuns(runs);
      });
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Radar className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">IIE Inc</span>
                    <span className="truncate text-xs">Institute</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        setOpen(true);
                      }}
                      isActive={activeItem.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Done</span>
              <Switch className="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {detectRuns.map((run) => (
                <Link
                  to={"/dashboard/task/detection/run/" + run.uuid}
                  key={run.uuid}
                  className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="flex items-center">
                      <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                      <span className="text-xs">
                        <Tooltip>
                          <TooltipTrigger className="font-mono">
                            <span className="inline-block">
                              {run.uuid.substring(0, 8)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{run.uuid}</TooltipContent>
                        </Tooltip>
                      </span>
                    </div>
                    <div className="flex items-center ml-auto">
                      <CalendarPlusIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                      <span className="ml-auto text-xs">
                        {formatDateTime(run.launchedDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <PercentIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                    <span className="text-xs text-muted-foreground">
                      {run.nProcessed} / {run.nTotal}
                    </span>
                  </div>
                  <span className="font-medium">
                    <StatusIcon status={run.status} size={16} />
                  </span>
                </Link>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
