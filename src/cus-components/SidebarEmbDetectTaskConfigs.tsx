import * as React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IdCardIcon, Settings2Icon } from "lucide-react";
import { EmbDetectionConfigData } from "@/types/EmbDetectionConfigData.schema";
import { useEel } from "@/hooks/use-eel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarEmbDetectTaskConfigs() {
  const [detectConfigs, setDetectConfigs] = React.useState<
    EmbDetectionConfigData[]
  >([]);
  const { eel } = useEel();

  useEffect(() => {
    eel
      .fetchEmbeddingDetectionConfigs(0, 1000)()
      .then((configs: EmbDetectionConfigData[]) => {
        console.log("fetchEmbeddingDetectionConfigs", configs);
        setDetectConfigs(configs);
      });
  }, []);

  return (
    <>
      {detectConfigs.map((config) => (
        <Link
          to={"/dashboard/detection/task-config/" + config.uuid}
          key={config.uuid}
          className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            <div className="flex items-center">
              <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs">
                <Tooltip>
                  <TooltipTrigger className="font-mono">
                    <span className="inline-block">
                      {config.uuid.substring(0, 8)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{config.uuid}</TooltipContent>
                </Tooltip>
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Settings2Icon className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              Max Depth: {config.maxDepth}
            </span>
          </div>
        </Link>
      ))}
    </>
  );
}
