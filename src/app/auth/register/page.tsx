"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  Form,
  Input,
  Button,
  Progress,
  Typography,
  Space,
  Divider,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };

    const strength = Object.values(checks).filter(Boolean).length;
    const strengthPercent = (strength / 4) * 100;

    let strengthColor = "#f53f3f";
    if (strength >= 3) strengthColor = "#00b42a";
    else if (strength >= 2) strengthColor = "#ff7d00";

    return { checks, strength, strengthPercent, strengthColor };
  };

  const { checks, strength, strengthPercent, strengthColor } =
    getPasswordStrength(password);

  const handleSubmit = async (values: RegisterFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          message.success("注册成功！请登录您的账户");
        } catch (msgError) {
          console.log("注册成功！请登录您的账户");
        }
        router.push("/auth/login?message=registration-success");
      } else {
        try {
          message.error(data.error || "注册失败");
        } catch (msgError) {
          console.error(data.error || "注册失败");
        }
      }
    } catch (error) {
      try {
        message.error("注册过程中发生错误");
      } catch (msgError) {
        console.error("注册过程中发生错误:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} style={{ color: "#222", marginBottom: 8 }}>
            创建新账户
          </Title>
          <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
            加入视频直播用量查询平台
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
              label="姓名"
              name="name"
              rules={[
                { required: true, message: "请输入姓名" },
                { min: 2, message: "姓名至少需要2个字符" },
              ]}
            >
              <Input
                placeholder="请输入您的姓名"
                prefix={<UserOutlined />}
                size="large"
              />
            </Form.Item>

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
                prefix={<MailOutlined />}
                size="large"
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            {password && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Text style={{ fontSize: 12 }}>密码强度</Text>
                  <Text style={{ fontSize: 12, color: strengthColor }}>
                    {strength <= 2 ? "弱" : strength <= 3 ? "中等" : "强"}
                  </Text>
                </div>
                <Progress
                  percent={strengthPercent}
                  strokeColor={strengthColor}
                  showInfo={false}
                  size="small"
                />
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    {checks.length ? (
                      <CheckCircleOutlined
                        style={{ color: "#00b42a", fontSize: 12 }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ color: "#f53f3f", fontSize: 12 }}
                      />
                    )}
                    <Text style={{ fontSize: 12 }}>至少6个字符</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    {checks.lowercase ? (
                      <CheckCircleOutlined
                        style={{ color: "#00b42a", fontSize: 12 }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ color: "#f53f3f", fontSize: 12 }}
                      />
                    )}
                    <Text style={{ fontSize: 12 }}>包含小写字母</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    {checks.uppercase ? (
                      <CheckCircleOutlined
                        style={{ color: "#00b42a", fontSize: 12 }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ color: "#f53f3f", fontSize: 12 }}
                      />
                    )}
                    <Text style={{ fontSize: 12 }}>包含大写字母</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    {checks.number ? (
                      <CheckCircleOutlined
                        style={{ color: "#00b42a", fontSize: 12 }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ color: "#f53f3f", fontSize: 12 }}
                      />
                    )}
                    <Text style={{ fontSize: 12 }}>包含数字</Text>
                  </div>
                </div>
              </div>
            )}

            <Form.Item
              label="确认密码"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "请确认密码" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="请再次输入密码"
                prefix={<LockOutlined />}
                size="large"
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
                注册账户
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text type="secondary" style={{ fontSize: 12 }}>
              已有账户？
            </Text>
          </Divider>

          <div className="text-center">
            <Link
              href="/auth/login"
              style={{ color: "#1890ff", fontWeight: 500 }}
            >
              直接登录
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
