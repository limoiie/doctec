import { Button, Layout, Menu, MenuProps, message, Modal, theme } from "antd";
import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  ExclamationCircleFilled,
  ExportOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined,
  SecurityScanFilled,
} from "@ant-design/icons";

import "./App.css";
import { eel } from "./eel.js";
import { EmbeddingDetectionPage } from "./pages/EmbeddingDetectionPage";
import { EmbeddingDetectionHistoryPage } from "./pages/EmbeddingDetectionHistoryPage";

const { Sider, Header, Content } = Layout;
const { confirm } = Modal;

type MenuItem = Required<MenuProps>["items"][number];
const menuItems: MenuItem[] = [
  {
    key: "act-new-detection",
    icon: <PlayCircleOutlined />,
    label: "New Detection",
  },
  {
    key: "act-history",
    icon: <HistoryOutlined />,
    label: "History",
  },
  {
    key: "act-export",
    icon: <ExportOutlined />,
    label: "Export Report",
  },
  {
    key: "act-exit",
    icon: <LogoutOutlined />,
    label: "Exit",
  },
];

// noinspection JSUnresolvedReference
function App() {
  const navigate = useNavigate(); // Initialize navigate function
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    eel.set_host("ws://localhost:8888");
  }, []); // The empty array as the second argument ensures this runs only once after the initial render.

  function onMenuItemClick(item: MenuItem) {
    if (!item) {
      return;
    }

    switch (item.key) {
      case "act-new-detection":
        navigate("/");
        break;
      case "act-history":
        navigate("/history");
        break;
      case "act-export":
        messageApi
          .open({
            type: "error",
            content: "Not implemented yet!",
          })
          .then();
        break;
      case "act-exit":
        confirm({
          title: "Do you want to exit?",
          icon: <ExclamationCircleFilled />,
          content: "This will close the application.",
          onOk() {
            eel.exit();
          },
        });
        break;
    }
  }

  return (
    <>
      {contextHolder}
      <Layout>
        <Sider
          style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
          width={200}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className="h-16 grid grid-cols-1">
            <div
              className="place-self-center min-w-12 h-12 p-3 rounded-lg
                  cursor-pointer text-white text-base font-bold
                  flex flex-row items-center justify-center gap-2
                  bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                  hover:from-blue-400 hover:via-blue-400 hover:to-blue-400"
            >
              <SecurityScanFilled />
              <span
                className={
                  (collapsed ? "hidden" : "") +
                  " block overflow-hidden text-nowrap transition-all"
                }
              >
                EmbDoc Detector
              </span>
            </div>
          </div>
          <Menu mode="inline" items={menuItems} onClick={onMenuItemClick} />
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
            <Routes>
              <Route path="/" element={<EmbeddingDetectionPage />} />
              <Route
                path="/history"
                element={<EmbeddingDetectionHistoryPage />}
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default App;
