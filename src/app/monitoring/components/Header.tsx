"use client";

import { useMemo, type CSSProperties } from "react";
import { Typography, Button, Dropdown, Avatar, type MenuProps } from "antd";
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

const styles: Record<string, CSSProperties> = {
  header: {
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,21,41,.08)",
    borderBottom: "1px solid #e5e7eb",
    height: 64,
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    padding: "0 24px",
  },
  title: {
    marginBottom: 0,
    marginLeft: 8,
  },
  userDropdown: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 18,
  },
};

export default function AppHeader({ user, onLogout, onInitData }: HeaderProps) {
  const userMenuItems: MenuProps["items"] = useMemo(
    () => [
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
    ],
    [onInitData, onLogout]
  );

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Title level={4} style={styles.title}>
          视频直播用量自助查询平台
        </Title>

        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Button type="text" style={styles.userDropdown}>
            <Avatar size={35}>
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </Avatar>
            <span style={styles.userName}>{user.name || user.email}</span>
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    </header>
  );
}
