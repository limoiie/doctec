import { Button } from "@/components/ui/button";
import { useEel } from "@/hooks/use-eel";

export function EmbeddingDetectionRunDetailsUnselected() {
  const { eel } = useEel();

  function debug() {
    eel.debug("Debugging...");
  }

  return (
    <div>
      No selection. Select a run to view details, or create a new run.
      <Button variant="ghost" onClick={debug}>
        Debug
      </Button>
    </div>
  );
}
