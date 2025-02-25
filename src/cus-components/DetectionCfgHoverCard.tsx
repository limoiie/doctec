import type { DetectionTaskCfgData } from "@/types/DetectionTaskCfgData.schema";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  IdCardIcon,
  RulerIcon,
  SaveIcon,
  ScanSearchIcon,
  Settings2Icon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar } from "@/components/ui/avatar";

export function DetectionCfgHoverCard({ cfg }: { cfg: DetectionTaskCfgData }) {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings2Icon className="h-4 w-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-100">
          <div className="flex space-x-4">
            <Avatar>
              <Settings2Icon size={42} />
            </Avatar>
            <div className="text-sm space-y-1">
              <div className="flex items-center pt-2">
                <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  配置编号：{" "}
                  <Tooltip>
                    <TooltipTrigger className="font-mono">
                      <span className="inline-block">
                        {cfg.uuid}
                      </span>
                    </TooltipTrigger>
                  </Tooltip>
                </span>
              </div>
              <div className="flex items-center pt-2">
                <ScanSearchIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  检测文件:
                </span>{" "}
                <div className="flex flex-wrap gap-2 ml-2">
                  {cfg.targetDirs.map((dir, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      className="h-6"
                    >
                      {dir}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center pt-2">
                <SaveIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  保存目录：<code>{cfg.saveDir}</code>
                </span>{" "}
              </div>
              {cfg.configs.map((config) => {
                switch (config.type) {
                  case "embedded-file":
                    return (
                      <div className="flex items-center pt-2">
                        <RulerIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                        <span className="text-xs text-muted-foreground">
                          最大深度：{config.maxDepth}
                        </span>
                      </div>
                    );
                  case "malicious-doc":
                    return (
                      <div className="flex items-center pt-2">
                        <RulerIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                        <span className="text-xs text-muted-foreground">
                          恶意阈值：{config.severityThreshold}
                        </span>
                      </div>
                    );
                }
              })}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
