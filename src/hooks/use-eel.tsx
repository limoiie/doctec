import { eel } from "@/eel";

interface Eel {
  exit(): void;
  set_host(wsUrl: string): void;
}

export function useEel() {
  return {
    eel: eel as Eel
  };
}
