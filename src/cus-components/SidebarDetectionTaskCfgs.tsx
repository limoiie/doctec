import * as React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IdCardIcon } from "lucide-react";
import { DetectionTaskCfgData } from "@/types/DetectionTaskCfgData.schema";
import { useEel } from "@/hooks/use-eel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export function SidebarDetectionTaskCfgs() {
  const [detectConfigs, setDetectConfigs] = React.useState<
    DetectionTaskCfgData[]
  >([]);
  const { eel } = useEel();

  useEffect(() => {
    eel
      .fetchDetectionTaskCfgs(0, 1000)()
      .then((configs: DetectionTaskCfgData[]) => {
        console.log("fetchDetectionTaskCfgs", configs);
        setDetectConfigs(configs);
      });
  }, []);

  return (
    <>
      {detectConfigs.map((cfg) => (
        <Link
          to={"/dashboard/detection/task-cfg/" + cfg.uuid}
          key={cfg.uuid}
          className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            <div className="flex items-center">
              <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs">
                <Tooltip>
                  <TooltipTrigger className="font-mono">
                    <span className="inline-block">
                      {cfg.uuid.substring(0, 8)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{cfg.uuid}</TooltipContent>
                </Tooltip>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
            {cfg.configs.map((config) => {
              switch (config.type) {
                case "embedded-file":
                  return <Badge variant="outline">EmbFile</Badge>;
                case "malicious-doc":
                  return <Badge variant="outline">MalDoc</Badge>;
              }
            })}
          </div>
        </Link>
      ))}
    </>
  );
}
