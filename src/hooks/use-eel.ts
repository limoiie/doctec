import { eel } from "@/eel";
import { EmbDetectionResultDataWithoutRun } from "@/types/EmbDetectionResultDataWithoutRun.schema";
import { DetectionTaskData } from "@/types/DetectionTaskData.schema";
import { EmbDetectionConfigData } from "@/types/EmbDetectionConfigData.schema";
import { UserData } from "@/types/UserData.schema";

interface Eel {
  exit(): void;

  set_host(wsUrl: string): void;

  /// Following are the functions that are exposed to the frontend, see index.py

  fetchDetectionTaskJobs(
    page_no: number,
    page_size: number,
  ): () => Promise<DetectionTaskData[]>;

  fetchEmbeddingDetectionRunByUuid(
    run_uuid: string,
  ): () => Promise<DetectionTaskData>;

  fetchDetectionTaskResByJobUuid(
    run_id: string,
  ): () => Promise<EmbDetectionResultDataWithoutRun>;

  fetchDetectionTaskCfgs(
    page_no: number,
    page_size: number,
  ): () => Promise<EmbDetectionConfigData[]>;

  fetchDetectionTaskCfgByUuid(
    config_uuid: string,
  ): () => Promise<EmbDetectionConfigData>;

  launchDetectionTask(cfg: any): () => Promise<string>;

  deleteDetectionTaskJobByUuid(run_uuid: string): () => Promise<boolean>;

  login(email: string, password: string): () => Promise<UserData>;

  validate_session(token: string): () => Promise<UserData | null>;

  logout(token: string): () => Promise<boolean>;

  debug(msg: string): () => Promise<void>;
}

interface UseEelReturn {
  eel: Eel;
  setupHost: (host: string, port: number) => void;
}

export function useEel(): UseEelReturn {
  function setupHost(host: string, port: number) {
    eel.set_host(`ws://${host}:${port}`);
  }

  return {
    eel: eel as Eel,
    setupHost,
  };
}
