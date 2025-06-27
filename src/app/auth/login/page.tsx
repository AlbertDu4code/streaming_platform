"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/monitoring";
  const messageParam = searchParams.get("message");

  useEffect(() => {
    if (messageParam === "registration-success") {
      try {
        message.success("注册成功！请使用您的账户登录");
      } catch (msgError) {
        console.log("注册成功！请使用您的账户登录");
      }
    }
  }, [messageParam]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        try {
          message.error("登录失败，请检查邮箱和密码");
        } catch (msgError) {
          console.error("登录失败，请检查邮箱和密码");
        }
      } else {
        try {
          message.success("登录成功！");
        } catch (msgError) {
          console.log("登录成功！");
        }
        // 重新获取 session 并跳转
        await getSession();
        router.push(callbackUrl);
      }
    } catch (error) {
      try {
        message.error("登录过程中发生错误");
      } catch (msgError) {
        console.error("登录过程中发生错误:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          <Title level={2} style={{ color: "#222", marginBottom: 8 }}>
            视频直播用量查询平台
          </Title>
          <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
            请登录您的账户
          </Text>
        </div>

        <Card style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="邮箱地址"
              name="email"
              rules={[
                { required: true, message: "请输入邮箱地址" },
                { type: "email", message: "请输入有效的邮箱地址" },
              ]}
            >
              <Input
                placeholder="请输入邮箱地址"
                prefix={<UserOutlined />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                placeholder="请输入密码"
                prefix={<LockOutlined />}
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text type="secondary" style={{ fontSize: 12 }}>
              还没有账户？
            </Text>
          </Divider>

          <div className="text-center">
            <Link
              href="/auth/register"
              style={{ color: "#1890ff", fontWeight: 500 }}
            >
              立即注册
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
