import {Button, Input, Space} from "antd";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

import {eel} from "../eel.js";
import type {EmbDetectionConfigData} from "../types/EmbDetectionConfigData.schema.d"

export function EmbeddingDetectionPage() {
  const [targetDirs, setTargetDirs] = useState("C:\\Projects\\samples");

  let navigate = useNavigate();

  function detect() {
    const cfg: EmbDetectionConfigData = {
      targetDirs: targetDirs.split(';'),
      maxDepth: 5,
    };
    // noinspection JSUnresolvedReference
    eel.detectEmbeddedFiles(cfg)(
        function (runUuid) {
          // redirect to results page
          navigate('/run/' + runUuid);
        }
    )
  }

  return (
      <div>
        <h1 className="page-title">Embedding Detection</h1>
        <Space>
          <Space.Compact>
            <Input placeholder="directories or files" value={targetDirs}
                   onChange={(e) => setTargetDirs(e.target.value)}/>
            <Button type="primary" disabled={!targetDirs} onClick={detect}>Start</Button>
          </Space.Compact>
        </Space>
      </div>
  )
}