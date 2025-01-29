import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eel } from "@/eel";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmbDetectionConfigData } from "@/types/EmbDetectionConfigData.schema";
import { EmbeddingDetectionCfgHoverCard } from "@/cus-components/EmbeddingDetectionCfgHoverCard";

export function EmbeddingDetectionConfigDetails({
  configUuid,
}: {
  configUuid: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState<EmbDetectionConfigData | null>(null);
  const navigate = useNavigate();

  function loadData() {
    setLoading(true);
    setError(null);

    eel.fetchEmbeddingDetectionConfigByUuid(configUuid)(
      function (config: EmbDetectionConfigData) {
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
    if (!config) return;

    eel.detectEmbeddedFiles(config)(function (runUuid: string) {
      navigate(`/dashboard/detection/task-run/${runUuid}`);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {loading && <Skeleton />}

      {!loading && !error && config && (
        <EmbeddingDetectionCfgHoverCard cfg={config} />
      )}

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
