import { eel } from "@/eel";
import { EmbDetectionResultDataWithoutRun } from "@/types/EmbDetectionResultDataWithoutRun.schema";
import { EmbDetectionRunData } from "@/types/EmbDetectionRunData.schema";
import { EmbDetectionConfigData } from "@/types/EmbDetectionConfigData.schema";
import { User } from "@/contexts/auth-context";

interface Eel {
  exit(): void;

  set_host(wsUrl: string): void;

  /// Following are the functions that are exposed to the frontend, see index.py

  fetchEmbeddingDetectionRuns(
    page_no: number,
    page_size: number,
  ): () => Promise<EmbDetectionRunData[]>;

  fetchEmbeddingDetectionRunByUuid(
    run_uuid: string,
  ): () => Promise<EmbDetectionRunData>;

  fetchEmbeddingDetectionResultByRunUuid(
    run_id: string,
  ): () => Promise<EmbDetectionResultDataWithoutRun>;

  fetchEmbeddingDetectionConfigs(
    page_no: number,
    page_size: number,
  ): () => Promise<EmbDetectionConfigData[]>;

  fetchEmbeddingDetectionConfigByUuid(
    config_uuid: string,
  ): () => Promise<EmbDetectionConfigData>;

  detectEmbeddedFiles(cfg: any): () => Promise<string>;

  deleteRun(run_uuid: string): () => Promise<boolean>;

  login(email: string, password: string): () => Promise<User>;

  validate_session(token: string): () => Promise<User | null>;

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
