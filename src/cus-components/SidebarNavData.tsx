import { FileSearchIcon, FileSlidersIcon } from "lucide-react";

export enum Modules {
  DETECTION_TASK_JOBS,
  DETECTION_TASK_CFGS,
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
    title: "文件检测任务",
    url: "/dashboard/detection/task-job",
    icon: FileSearchIcon,
    isActive: true,
    module: Modules.DETECTION_TASK_JOBS,
  },
  {
    title: "文件检测配置",
    url: "/dashboard/detection/task-cfg",
    icon: FileSlidersIcon,
    isActive: false,
    module: Modules.DETECTION_TASK_CFGS,
  },
];
