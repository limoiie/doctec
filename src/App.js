import { Button, Menu, Layout, theme } from "antd";
import React, { Component, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import "./App.css";
import { eel } from "./eel.js";
import { EmbeddingDetectionPage } from "./pages/EmbeddingDetectionPage";
import { EmbeddingDetectionRunPage } from "./pages/EmbeddingDetectionRunPage";
import { EmbeddingDetectionHistoryPage } from "./pages/EmbeddingDetectionHistoryPage";

const { Sider, Header, Content } = Layout;

// noinspection JSUnresolvedReference
function App() {
  const [status: LoadStatus, setStatus] = useState({state: 'loading'});
  const [runs, setRuns] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    eel.set_host("ws://localhost:8888");
  }, []); // The empty array as the second argument ensures this runs only once after the initial render.

  function loadData() {
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRuns(pageNo, pageSize)(
        function (runs) {
          setStatus({state: 'loaded'});
          setRuns(runs);
        },
        function (error) {
          setStatus({state: 'error', error: error});
        }
    );
  }

  return (
    <Layout>
      <Sider
        style={{ background: colorBgContainer }}
        width={200}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="App-logo-vertical" />
      </Sider>
      <Layout className="App">
        <Header className="App-header">
          <Button
            className="icon-button"
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </Header>
        <Content className="App-content">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<EmbeddingDetectionPage />} />
              <Route
                path="/history"
                element={<EmbeddingDetectionHistoryPage />}
              />
              <Route
                path="/run/:runUuid"
                element={<EmbeddingDetectionRunPage />}
              />
            </Routes>
          </BrowserRouter>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
