import {Button, Input, Space} from "antd";
import {useState} from "react";

import {eel} from "../eel.js";
import {useNavigate} from "react-router-dom";

export function EmbeddingDetectionPage() {
  const [targetDirs, setTargetDirs] = useState(null);

  let navigate = useNavigate();

  function detect() {
    // noinspection JSUnresolvedReference
    eel.detectEmbeddedFiles(targetDirs)(
        function (resultId) {
          // redirect to results page
          navigate('/result/' + resultId.toString());
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