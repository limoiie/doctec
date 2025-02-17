import { UserPlus, Pencil } from "lucide-react";

export enum Modules {
  USER_MANAGEMENT,
  PERSONAL_INFORMATION
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
    title: "用户管理",
    url: "admin/dashboard/user-management",
    icon: UserPlus,
    isActive: true,
    module: Modules.USER_MANAGEMENT,
  },
  {
    title: "个人信息",
    url: "admin/dashboard/personal-information",
    icon: Pencil,
    isActive: false,
    module: Modules.PERSONAL_INFORMATION,
  },
];
