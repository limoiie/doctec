import * as React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarPlusIcon, IdCardIcon, PercentIcon } from "lucide-react";
import { DetectionTaskJobData } from "@/types/DetectionTaskJobData.schema";
import { StatusIcon } from "@/cus-components/StatusIcon";
import { formatDateTime } from "@/utils";
import { useEel } from "@/hooks/use-eel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarDetectionTaskJobs() {
  const [detectRuns, setDetectRuns] = React.useState<DetectionTaskJobData[]>(
    [],
  );
  const { eel } = useEel();

  useEffect(() => {
    eel
      .fetchDetectionTaskJobs(0, 1_000_000)()
      .then((jobs: DetectionTaskJobData[]) => {
        console.log("fetchDetectionTaskJobs", jobs);
        setDetectRuns(jobs);
      });
  }, []);

  return (
    <>
      {detectRuns.map((job) => (
        <Link
          to={"/dashboard/detection/task-job/" + job.uuid}
          key={job.uuid}
          className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            <div className="flex items-center">
              <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs">
                <Tooltip>
                  <TooltipTrigger className="font-mono">
                    <span className="inline-block">
                      {job.uuid.substring(0, 8)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{job.uuid}</TooltipContent>
                </Tooltip>
              </span>
            </div>
            <div className="flex items-center ml-auto">
              <CalendarPlusIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="ml-auto text-xs">
                {formatDateTime(job.launchedDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <PercentIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              {job.nProcessed} / {job.nTotal}
            </span>
          </div>
          <span className="font-medium">
            <StatusIcon status={job.status} size={16} />
          </span>
        </Link>
      ))}
    </>
  );
}
