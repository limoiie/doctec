import { useEffect, useState } from "react";

import { eel } from "@/eel";
import { Skeleton } from "@/components/ui/skeleton";
import type { DetectionTaskJobData } from "@/types/DetectionTaskJobData.schema";
import type { DetectionTaskResData } from "@/types/DetectionTaskResData.schema";
import { DetectionJobHoverCard } from "./DetectionJobHoverCard";
import { DetectionCfgHoverCard } from "./DetectionCfgHoverCard";
import { DetectionResDetails } from "./DetectionResDetails";

export function DetectionJobDetails({ jobUuid }: { jobUuid: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [job, setJob] = useState<DetectionTaskJobData | null>(null);
  const [res, setRes] = useState<DetectionTaskResData | null>(null);

  function loadData() {
    setRes(null);
    setLoading(true);
    setError(null);

    eel.fetchDetectionTaskJobByUuid(jobUuid)(
      function (job: DetectionTaskJobData) {
        setLoading(false);
        setJob(job);
      },
      function (error: never) {
        setLoading(false);
        setError(error);
      },
    );

    eel.fetchDetectionTaskResByJobUuid(jobUuid)(
      function (result: DetectionTaskResData) {
        setLoading(false);
        setRes(result);
      },
      function (error: never) {
        setLoading(false);
        setError(error);
      },
    );
  }

  useEffect(() => loadData(), [jobUuid]);

  return (
    <div className="flex flex-col gap-2">
      {loading && <Skeleton />}

      {!loading && !error && job && (
        <div className="grow flex flex-col gap-4">
          <div className="flex flex-row gap-2">
            <div>{job && <DetectionJobHoverCard job={job} />}</div>
            <div>
              {job && job.cfg && <DetectionCfgHoverCard cfg={job.cfg} />}
            </div>
          </div>
          <div className="grow">{res && <DetectionResDetails res={res} />}</div>
        </div>
      )}

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
