import { FileSearchIcon, FileSlidersIcon } from "lucide-react";

export enum Modules {
  DETECTION_TASKS,
  DETECTION_TASK_CONFIGS,
}

export interface NavItem {
  title: string;
  url: string;
  icon: any;
  isActive: boolean;
  module: Modules;
}

export const navMain: NavItem[] = [
  {
    title: "Embed Detections",
    url: "/dashboard/detection/task-run",
    icon: FileSearchIcon,
    isActive: true,
    module: Modules.DETECTION_TASKS,
  },
  {
    title: "Embed Detection Configs",
    url: "/dashboard/detection/task-config",
    icon: FileSlidersIcon,
    isActive: false,
    module: Modules.DETECTION_TASK_CONFIGS,
  },
];
