import { eel } from "@/eel";
import { UserData } from "@/types/UserData.schema";
import {
  DetectionTaskCfgData,
  DetectionTaskJobData,
} from "@/types/DetectionTaskJobData.schema";
import { DetectionTaskResData } from "@/types/DetectionTaskResData.schema";

interface Eel {
  exit(): void;

  set_host(wsUrl: string): void;

  /// Following are the functions that are exposed to the frontend, see index.py

  fetchDetectionTaskJobs(
    page_no: number,
    page_size: number,
  ): () => Promise<DetectionTaskJobData[]>;

  fetchDetectionTaskJobByUuid(
    job_uuid: string,
  ): () => Promise<DetectionTaskJobData>;

  fetchDetectionTaskCfgs(
    page_no: number,
    page_size: number,
  ): () => Promise<DetectionTaskCfgData[]>;

  fetchDetectionTaskCfgByUuid(
    config_uuid: string,
  ): () => Promise<DetectionTaskCfgData>;

  fetchDetectionTaskResByJobUuid(
    job_uuid: string,
  ): () => Promise<DetectionTaskResData>;

  launchDetectionTask(cfg: any): () => Promise<string>;

  deleteDetectedFileByUuid(job_uuid: string): () => Promise<boolean>;

  login(username: string, password: string): () => Promise<UserData>;

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
