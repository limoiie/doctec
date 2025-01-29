import type { EmbDetectionRunData } from "@/types/EmbDetectionRunData.schema.d";
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

export function EmbeddingDetectionRunHoverCard({
  run,
}: {
  run: EmbDetectionRunData;
}) {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="icon">
            <StatusIcon status={run.status} showText={false} />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex space-x-4">
            <Avatar>
              <StatusIcon status={run.status} showText={false} size={42} />
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center pt-2">
                <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  UUID:{" "}
                  <Tooltip>
                    <TooltipTrigger className="font-mono">
                      <span className="inline-block">
                        {run.uuid.substring(0, 16)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{run.uuid}</TooltipContent>
                  </Tooltip>
                </span>
              </div>
              {run.error && (
                <div className="flex items-center pt-2">
                  <CircleAlertIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    The run has encountered an error: <code>{run.error}</code>.
                  </span>
                </div>
              )}
              <div className="flex items-center pt-2">
                <PercentIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  Processed {run.nProcessed} / {run.nTotal}
                </span>
              </div>
              <div className="flex items-center pt-2">
                <CalendarPlusIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  Launched {formatDateTime(run.launchedDate)}
                </span>
              </div>
              {run.finishedDate && (
                <div className="flex items-center pt-2">
                  <CalendarCheckIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    Finished {formatDateTime(run.finishedDate)}
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
