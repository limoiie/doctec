import {Button, Input, Space} from "antd";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

import {eel} from "../eel.js";
import type {EmbDetectionConfigData} from "../types/EmbDetectionConfigData.schema"

export function EmbeddingDetectionPage() {
  const [targetDirs, setTargetDirs] = useState("C:\\Projects\\samples");

  let navigate = useNavigate();

  function detect() {
    // noinspection JSUnresolvedReference
    eel.detectEmbeddedFiles({ targetDirs: targetDirs.split(';'), maxDepth: 5 })(
        function (runUuid) {
          // redirect to results page
          navigate('/run/' + runUuid);
        }
    )
  }

  function goToHistoryPage() {
    navigate('/history');
  }

  return (
      <div>
        <p>Embedding Detection</p>
        <Space>
          <Space.Compact>
            <Input placeholder="directories or files" value={targetDirs}
                   onChange={(e) => setTargetDirs(e.target.value)}/>
            <Button type="primary" disabled={!targetDirs} onClick={detect}>Start</Button>
          </Space.Compact>
          <Button onClick={goToHistoryPage}>History</Button>
        </Space>
      </div>
  )
}