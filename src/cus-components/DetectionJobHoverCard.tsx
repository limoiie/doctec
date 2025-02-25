import type { DetectionTaskJobData } from "@/types/DetectionTaskJobData.schema";
import { StatusIcon } from "./StatusIcon";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar } from "@/components/ui/avatar";
import {
  CalendarCheckIcon,
  CalendarPlusIcon,
  CircleAlertIcon,
  IdCardIcon,
  PercentIcon,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DetectionJobHoverCard({ job }: { job: DetectionTaskJobData }) {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="icon">
            <StatusIcon status={job.status} showText={false} />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-100">
          <div className="flex space-x-4">
            <Avatar>
              <StatusIcon status={job.status} showText={false} size={42} />
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center pt-2">
                <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  任务编号：{" "}
                  <Tooltip>
                    <TooltipTrigger className="font-mono">
                      <span className="inline-block">
                        {job.uuid}
                      </span>
                    </TooltipTrigger>
                    
                  </Tooltip>
                </span>
              </div>
              {job.error && (
                <div className="flex pt-2">
                  <CircleAlertIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground ">
                  任务遇到错误:{" "}
                    <p className="text-red-500">{job.error}</p>
                  </span>
                </div>
              )}
              <div className="flex pt-2">
                <Monitor className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  检测状态： {job.status === "pending" ? "等待中" : 
                    job.status === "in-progress" ? "进行中" :
                    job.status === "completed" ? "已完成" :
                    job.status === "failed" ? "失败" :
                    job.status === "cancelled" ? "已取消" : 
                    job.status}
                </span>
              </div>
              <div className="flex pt-2">
                <PercentIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  检测进程： {job.nProcessed} / {job.nTotal}
                </span>
              </div>
              <div className="flex pt-2">
                <CalendarPlusIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  开始时间： {formatDateTime(job.launchedDate)}
                </span>
              </div>
              {job.finishedDate && (
                <div className="flex pt-2">
                  <CalendarCheckIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    完成时间： {formatDateTime(job.finishedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
