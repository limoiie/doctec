import type { EmbDetectionConfigData } from "@/types/EmbDetectionConfigData.schema";
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

export function EmbeddingDetectionCfgHoverCard({
  cfg,
}: {
  cfg: EmbDetectionConfigData;
}) {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">
            <Settings2Icon className="h-4 w-4" />
            <span>
              Config <code>{cfg.uuid.substring(0, 8)}</code>
            </span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">
                Configuration Details
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center pt-2">
                  <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    UUID: <code>{cfg.uuid}</code>
                  </span>
                </div>
                <div className="flex items-center pt-2">
                  <RulerIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    Max Depth: {cfg.maxDepth}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center pt-2">
                    <ScanSearchIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                    <span className="text-xs text-muted-foreground">
                      Target Directories:
                    </span>{" "}
                  </div>
                  <div className="flex flex-wrap gap-2 pl-6">
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
                    Save Directory: <code>{cfg.saveDirs}</code>
                  </span>{" "}
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
