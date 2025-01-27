import { Divider, Skeleton } from "antd";
import { useEffect, useState } from "react";

import { eel } from "@/eel";
import type { EmbDetectionResultDataWithoutRun } from "@/types/EmbDetectionResultDataWithoutRun.schema.d";
import type { EmbDetectionRunData } from "@/types/EmbDetectionRunData.schema.d";
import { EmbeddingDetectionRunStatus } from "./EmbeddingDetectionRunStatus";
import { EmbeddingDetectionCfgDetails } from "./EmbeddingDetectionCfgDetails";
import { EmbeddingDetectionResDetails } from "./EmbeddingDetectionResDetails";

export function EmbeddingDetectionRunDetails({ runUuid }: { runUuid: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [run, setRun] = useState<EmbDetectionRunData | null>(null);
  const [result, setResult] = useState<EmbDetectionResultDataWithoutRun | null>(null);

  function loadData() {
    setLoading(true);
    setError(null);

    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRunByUuid(runUuid)(
      function(run: EmbDetectionRunData) {
        setLoading(false);
        setRun(run);
      },
      function(error: never) {
        setLoading(false);
        setError(error);
      }
    );

    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionResultByRunUuid(runUuid)(
      function(result: EmbDetectionResultDataWithoutRun) {
        setLoading(false);
        setResult(result);
      },
      function(error: never) {
        setLoading(false);
        setError(error);
      }
    );
  }

  useEffect(() => loadData(), [runUuid]);

  return (
    <div className="h-full ml-4 p-4 flex flex-col gap-2 overflow-scroll bg-white">
      <h1 className="page-title">Embedding Detection Run#{runUuid}</h1>
      {loading && <Skeleton active />}

      {!loading && !error && run && (
        <div className="grow flex flex-col gap-4">
          <div>
            <Divider orientation="left" orientationMargin="0">
              Detection Run Status
            </Divider>
            {run && <EmbeddingDetectionRunStatus run={run} />}
          </div>
          <div>
            <Divider orientation="left" orientationMargin="0">
              Detection Configuration
            </Divider>
            {run && run.cfg && <EmbeddingDetectionCfgDetails cfg={run.cfg} />}
          </div>
          <div className="grow">
            <Divider orientation="left" orientationMargin="0">
              Detection Result
            </Divider>
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
