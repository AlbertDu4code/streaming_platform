"use client";

import { Typography, Button, Dropdown, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  ReloadOutlined,
  DesktopOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onInitData: () => void;
}

export default function AppHeader({ user, onLogout, onInitData }: HeaderProps) {
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人资料",
    },
    {
      key: "init-data",
      icon: <ReloadOutlined />,
      label: "初始化示例数据",
      onClick: onInitData,
    },
    {
      key: "settings",
      icon: <DesktopOutlined />,
      label: "系统设置",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: onLogout,
    },
  ];

  return (
    <header
      style={{
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
        borderBottom: "1px solid #e5e7eb",
        height: 64,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
          padding: "0 24px",
        }}
      >
        <Title level={4} style={{ marginBottom: 0, marginLeft: 8 }}>
          视频直播用量自助查询平台
        </Title>

        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Button
            type="text"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Avatar size={35}>
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </Avatar>
            <span style={{ fontSize: 18 }}>{user.name || user.email}</span>
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    </header>
  );
}
