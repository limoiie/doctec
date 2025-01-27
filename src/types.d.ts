export interface LoadStatus {
  state: "loading" | "loaded" | "error";
  error: string | null;
}
