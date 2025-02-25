import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import type { DetectionTaskCfgData } from "@/types/DetectionTaskCfgData.schema";
import { DetectionCfgHoverCard } from "@/cus-components/DetectionCfgHoverCard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlayCircleIcon } from "lucide-react";
import { useEel } from "@/hooks/use-eel";
export function DetectionTaskCfgDetails({
  configUuid,
}: {
  configUuid: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState<DetectionTaskCfgData | null>(null);

  const { eel } = useEel();
  const navigate = useNavigate();

  function loadData() {
    setLoading(true);
    setError(null);

    eel
      .fetchDetectionTaskCfgByUuid(configUuid)()
      .then(function (config: DetectionTaskCfgData) {
        setLoading(false);
        setConfig(config);
      })
      .catch(function (error: any) {
        setLoading(false);
        setError(error);
      });
  }

  useEffect(() => loadData(), [configUuid]);

  function startDetection() {
    if (!config) {
      toast.error("Failed to start detection task, config not loaded");
      return;
    }

    eel
      .launchDetectionTask(config)()
      .then(function (jobUuid: string) {
        navigate(`/dashboard/detection/task-job/${jobUuid}`);
      });
  }

  return (
    <div className="flex flex-col gap-2">
      {loading && <Skeleton />}

      <div className="flex flex-col items-start gap-2">
        {!loading && !error && config && <DetectionCfgHoverCard cfg={config} />}
        {!loading && !error && config && (
            <Button onClick={startDetection} variant="outline">
              <PlayCircleIcon />
              使用当前配置进行新检测
            </Button>
        )}
      </div>

      {error && (
        <span>
          加载数据失败，{" "}
          <a className="text-blue-600" onClick={loadData}>
          再试一次
          </a>
          ?
        </span>
      )}
    </div>
  );
}
