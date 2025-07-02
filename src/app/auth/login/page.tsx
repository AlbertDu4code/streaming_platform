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
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LoadingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/monitoring";
  const messageParam = searchParams.get("message");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    // 处理注册成功消息
    if (messageParam === "registration-success") {
      try {
        message.success("注册成功！请使用您的账户登录");
      } catch (msgError) {
        console.log("注册成功！请使用您的账户登录");
      }
    }

    // 处理登录错误
    if (errorParam) {
      let errorMsg = "登录失败";
      switch (errorParam) {
        case "CredentialsSignin":
          errorMsg = "邮箱或密码错误，请重新输入";
          break;
        case "AccessDenied":
          errorMsg = "访问被拒绝，请联系管理员";
          break;
        case "Verification":
          errorMsg = "验证失败，请重试";
          break;
        default:
          errorMsg = "登录过程中发生错误，请重试";
      }
      setErrorMessage(errorMsg);
    }
  }, [messageParam, errorParam]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 前端验证
      if (!validateEmail(values.email)) {
        setErrorMessage("请输入有效的邮箱地址");
        setLoading(false);
        return;
      }

      if (!values.password.trim()) {
        setErrorMessage("请输入密码");
        setLoading(false);
        return;
      }

      console.log("尝试登录:", values.email);

      const result = await signIn("credentials", {
        email: values.email.toLowerCase().trim(),
        password: values.password,
        redirect: false,
      });

      console.log("登录结果:", result);

      if (result?.error) {
        // 根据错误类型显示不同的错误信息
        let errorMsg = "登录失败";
        switch (result.error) {
          case "CredentialsSignin":
            errorMsg = "邮箱或密码错误，请检查后重新输入";
            break;
          case "AccessDenied":
            errorMsg = "访问被拒绝，账户可能被禁用";
            break;
          default:
            errorMsg = "登录失败，请重试";
        }

        setErrorMessage(errorMsg);
        try {
          message.error(errorMsg);
        } catch (msgError) {
          console.error(errorMsg);
        }
      } else if (result?.ok) {
        try {
          message.success("登录成功！");
        } catch (msgError) {
          console.log("登录成功！");
        }

        // 重新获取 session 并跳转
        const session = await getSession();
        console.log("获取到的session:", session);

        if (session) {
          router.push(callbackUrl);
        } else {
          setErrorMessage("登录状态异常，请重试");
        }
      } else {
        setErrorMessage("登录失败，请重试");
      }
    } catch (error) {
      console.error("登录过程中发生错误:", error);
      setErrorMessage("登录过程中发生网络错误，请检查网络连接后重试");
      try {
        message.error("登录过程中发生错误");
      } catch (msgError) {
        console.error("登录过程中发生错误:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setErrorMessage("");
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
          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={clearError}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            onFieldsChange={clearError}
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
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, message: "密码至少需要6个字符" },
              ]}
            >
              <Input.Password
                placeholder="请输入密码"
                prefix={<LockOutlined />}
                size="large"
                autoComplete="current-password"
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
                icon={loading ? <LoadingOutlined /> : null}
              >
                {loading ? "登录中..." : "登录"}
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
