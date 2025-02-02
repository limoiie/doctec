import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input, Layout, Space, Typography } from "antd";
import { eel } from "@/eel";
import type { EmbDetectionConfigData } from "@/types/EmbDetectionConfigData.schema.d";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export function EmbeddingDetectionPage() {
  const [targetDirs, setTargetDirs] = useState("C:\\Projects\\samples");
  const [saveDirs, setSaveDirs] = useState("C:\\Projects\\samples_to_save");

  const navigate = useNavigate();

  function detect() {
    const cfg: EmbDetectionConfigData = {
      uuid: "",
      targetDirs: targetDirs.split(";"),
      saveDirs: saveDirs,
      maxDepth: 5,
    };
    // noinspection JSUnresolvedReference
    eel.detectEmbeddedFiles(cfg)(function (runUuid: string) {
      // redirect to results page
      navigate("/run/" + runUuid);
    });
  }

  return (
    <div>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            backgroundColor: "#001529",
            color: "#fff",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        ></Header>
        <Content
          style={{ padding: "20px", display: "flex", justifyContent: "center" }}
        >
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <Space>
              <Text strong>要检测的文件目录:</Text>
              <Input
                placeholder="Enter directories or files to detect"
                value={targetDirs}
                onChange={(e) => setTargetDirs(e.target.value)}
                style={{ width: "300px" }}
              />
            </Space>
            <Space>
              <Text strong>提取文件的保存目录:</Text>
              <Input
                placeholder="Enter directories or files to save results"
                value={saveDirs}
                onChange={(e) => setSaveDirs(e.target.value)}
                style={{ width: "300px" }}
              />
            </Space>
            <Button
              type="primary"
              block
              disabled={!targetDirs || !saveDirs}
              onClick={detect}
            >
              Start Detection
            </Button>
          </Space>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Malicious Document Detection ©2024 Created by Yule
        </Footer>
      </Layout>
    </div>
  );
}
