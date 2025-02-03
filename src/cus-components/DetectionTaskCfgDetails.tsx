import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eel } from "@/eel";
import { Skeleton } from "@/components/ui/skeleton";
import type { DetectionTaskCfgData } from "@/types/DetectionTaskCfgData.schema";
import { DetectionCfgHoverCard } from "@/cus-components/DetectionCfgHoverCard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlayCircleIcon } from "lucide-react";

export function DetectionTaskCfgDetails({
  configUuid,
}: {
  configUuid: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState<DetectionTaskCfgData | null>(null);
  const navigate = useNavigate();

  function loadData() {
    setLoading(true);
    setError(null);

    eel.fetchDetectionTaskCfgByUuid(configUuid)(
      function (config: DetectionTaskCfgData) {
        setLoading(false);
        setConfig(config);
      },
      function (error: never) {
        setLoading(false);
        setError(error);
      },
    );
  }

  useEffect(() => loadData(), [configUuid]);

  function startDetection() {
    if (!config) {
      toast.error("Failed to start detection task, config not loaded");
      return;
    }

    eel.launchDetectionTask(config)(function (jobUuid: string) {
      navigate(`/dashboard/detection/task-job/${jobUuid}`);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {loading && <Skeleton />}

      {!loading && !error && config && <DetectionCfgHoverCard cfg={config} />}
      <Button
        onClick={startDetection}
        disabled={loading || error || config?.status !== "READY"}
      >
        <PlayCircleIcon className="mr-2 h-4 w-4 opacity-70" />
      </Button>

      {error && (
        <span>
          Failed to load data,{" "}
          <a className="text-blue-600" onClick={loadData}>
            try again
          </a>
          ?
        </span>
      )}
    </div>
  );
}
