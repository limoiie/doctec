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
  PercentIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@/types";
import { formatDateTime, statusToDisplayText } from "@/utils";

export function EmbeddingDetectionRunHoverCard({
  run,
}: {
  run: EmbDetectionRunData;
}) {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">
            <StatusIcon status={run.status} showText={true} />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <StatusIcon status={run.status} showText={false} size={42} />
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                {statusToDisplayText(run.status as TaskStatus)}
              </h4>
              <p className="text-sm">
                The run of UUID{" "}
                <a href="#">
                  <code>{run.uuid.substring(0, 8)}</code>
                </a>{" "}
                is currently in the{" "}
                <span className="font-semibold">
                  {statusToDisplayText(run.status as TaskStatus)}
                </span>{" "}
                state.
              </p>
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
