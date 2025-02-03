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
        <HoverCardContent className="w-80">
          <div className="flex space-x-4">
            <Avatar>
              <StatusIcon status={job.status} showText={false} size={42} />
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center pt-2">
                <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  UUID:{" "}
                  <Tooltip>
                    <TooltipTrigger className="font-mono">
                      <span className="inline-block">
                        {job.uuid.substring(0, 16)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{job.uuid}</TooltipContent>
                  </Tooltip>
                </span>
              </div>
              {job.error && (
                <div className="flex pt-2">
                  <CircleAlertIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground ">
                    The task has encountered an error:{" "}
                    <p className="text-red-500">{job.error}</p>
                  </span>
                </div>
              )}
              <div className="flex pt-2">
                <PercentIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  Processed {job.nProcessed} / {job.nTotal}
                </span>
              </div>
              <div className="flex pt-2">
                <CalendarPlusIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  Launched {formatDateTime(job.launchedDate)}
                </span>
              </div>
              {job.finishedDate && (
                <div className="flex pt-2">
                  <CalendarCheckIcon className="mr-2 h-4 w-4 min-w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    Finished {formatDateTime(job.finishedDate)}
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
