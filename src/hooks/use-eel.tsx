import { eel } from "@/eel";

interface Eel {
  exit(): void;

  set_host(wsUrl: string): void;

  debug(msg: string): void;
}

export function useEel() {
  function setupHost(host: string, port: number) {
    eel.set_host(`ws://${host}:${port}`);
  }

  return {
    eel: eel as Eel,
    setupHost
  };
}
