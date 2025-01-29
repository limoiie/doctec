import { useEffect, useState } from "react";

import { eel } from "@/eel";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmbDetectionResultDataWithoutRun } from "@/types/EmbDetectionResultDataWithoutRun.schema.d";
import type { EmbDetectionRunData } from "@/types/EmbDetectionRunData.schema.d";
import { EmbeddingDetectionRunHoverCard } from "./EmbeddingDetectionRunHoverCard";
import { EmbeddingDetectionCfgHoverCard } from "./EmbeddingDetectionCfgHoverCard";
import { EmbeddingDetectionResDetails } from "./EmbeddingDetectionResDetails";

export function EmbeddingDetectionRunDetails({ runUuid }: { runUuid: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [run, setRun] = useState<EmbDetectionRunData | null>(null);
  const [result, setResult] = useState<EmbDetectionResultDataWithoutRun | null>(
    null,
  );

  function loadData() {
    setResult(null);
    setLoading(true);
    setError(null);

    eel.fetchEmbeddingDetectionRunByUuid(runUuid)(
      function (run: EmbDetectionRunData) {
        setLoading(false);
        setRun(run);
      },
      function (error: never) {
        setLoading(false);
        setError(error);
      },
    );

    eel.fetchEmbeddingDetectionResultByRunUuid(runUuid)(
      function (result: EmbDetectionResultDataWithoutRun) {
        setLoading(false);
        setResult(result);
      },
      function (error: never) {
        setLoading(false);
        setError(error);
      },
    );
  }

  useEffect(() => loadData(), [runUuid]);

  return (
    <div className="flex flex-col gap-2 bg-white">
      {loading && <Skeleton />}

      {!loading && !error && run && (
        <div className="grow flex flex-col gap-4">
          <div className="flex flex-row gap-2">
            <div>{run && <EmbeddingDetectionRunHoverCard run={run} />}</div>
            <div>
              {run && run.cfg && (
                <EmbeddingDetectionCfgHoverCard cfg={run.cfg} />
              )}
            </div>
          </div>
          <div className="grow">
            {result && <EmbeddingDetectionResDetails res={result} />}
          </div>
        </div>
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
