import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eel } from "@/eel";
import type { DetectionTaskCfgData } from "@/types/DetectionTaskCfgData.schema";

export function EmbeddingDetectionPage() {
  const [targetDirs, setTargetDirs] = useState("C:\\Projects\\samples");
  const [saveDir, setSaveDir] = useState("C:\\Projects\\samples_to_save");

  const navigate = useNavigate();

  function detect() {
    const cfg: DetectionTaskCfgData = {
      uuid: "",
      targetDirs: targetDirs.split(";"),
      saveDir: saveDir,
      configs: [
        // TODO
      ],
    };
    // noinspection JSUnresolvedReference
    eel.launchDetectionTask(cfg)(function (jobUuid: string) {
      // redirect to results page
      navigate("/job/" + jobUuid);
    });
  }

  return <div>TODO</div>;
}
