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
  Alert,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { fetcher } from "@/lib/api-utils";
import { HttpError } from "@/lib/errors";

const { Title, Text } = Typography;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiErrorDetails {
  [key: string]: {
    _errors?: string[];
  };
}

interface ApiError {
  error?: string;
  message?: string;
  details?: ApiErrorDetails;
}

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
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
    let strengthText = "弱";
    if (strength >= 3) {
      strengthColor = "#00b42a";
      strengthText = "强";
    } else if (strength >= 2) {
      strengthColor = "#ff7d00";
      strengthText = "中等";
    }

    return { checks, strength, strengthPercent, strengthColor, strengthText };
  };

  const { checks, strength, strengthPercent, strengthColor, strengthText } =
    getPasswordStrength(password);

  const handleSubmit = async (values: RegisterFormData) => {
    setLoading(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      await fetcher<ApiError>("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.toLowerCase().trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      message.success("注册成功！正在跳转到登录页面...");

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push("/auth/login?message=registration-success");
      }, 1500);
    } catch (error) {
      if (error instanceof HttpError) {
        try {
          const errorData: ApiError = JSON.parse(error.message);
          if (errorData.details) {
            const newFieldErrors: { [key: string]: string } = {};
            Object.keys(errorData.details).forEach((field) => {
              const fieldError = errorData.details?.[field];
              if (fieldError?._errors?.length) {
                newFieldErrors[field] = fieldError._errors[0];
              }
            });
            if (Object.keys(newFieldErrors).length > 0) {
              setFieldErrors(newFieldErrors);
              return; // 阻止显示全局错误消息
            }
          }
          setErrorMessage(errorData.message || "注册失败");
          message.error(errorData.message || "注册失败");
        } catch (e) {
          setErrorMessage(error.message);
          message.error(error.message);
        }
      } else {
        const genericMessage = "注册过程中发生网络错误，请检查网络连接后重试";
        setErrorMessage(genericMessage);
        message.error(genericMessage);
      }
      console.error("注册过程中发生错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => {
    setErrorMessage("");
    setFieldErrors({});
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
          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={clearErrors}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              void handleSubmit(values as RegisterFormData);
            }}
            autoComplete="off"
            onFieldsChange={clearErrors}
          >
            <Form.Item
              label="姓名"
              name="name"
              validateStatus={fieldErrors.name ? "error" : ""}
              help={fieldErrors.name}
              rules={[
                { required: true, message: "请输入姓名" },
                { min: 2, message: "姓名至少需要2个字符" },
                { max: 50, message: "姓名不能超过50个字符" },
                {
                  pattern: /^[a-zA-Z\u4e00-\u9fa5\s]+$/,
                  message: "姓名只能包含中文、英文和空格",
                },
              ]}
            >
              <Input
                placeholder="请输入您的姓名"
                prefix={<UserOutlined />}
                size="large"
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              label="邮箱地址"
              name="email"
              validateStatus={fieldErrors.email ? "error" : ""}
              help={fieldErrors.email}
              rules={[
                { required: true, message: "请输入邮箱地址" },
                { type: "email", message: "请输入有效的邮箱地址" },
                { max: 100, message: "邮箱地址不能超过100个字符" },
              ]}
            >
              <Input
                placeholder="请输入邮箱地址"
                prefix={<MailOutlined />}
                size="large"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              validateStatus={fieldErrors.password ? "error" : ""}
              help={fieldErrors.password}
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, message: "密码至少需要6个字符" },
                { max: 100, message: "密码不能超过100个字符" },
                {
                  pattern: /(?=.*[a-z])(?=.*\d)/,
                  message: "密码必须包含至少一个小写字母和一个数字",
                },
              ]}
            >
              <Input.Password
                placeholder="请输入密码"
                prefix={<LockOutlined />}
                size="large"
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            {password && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Text style={{ fontSize: 12 }}>密码强度</Text>
                  <Text style={{ fontSize: 12, color: strengthColor }}>
                    {strengthText}
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
              validateStatus={fieldErrors.confirmPassword ? "error" : ""}
              help={fieldErrors.confirmPassword}
              hasFeedback
              rules={[
                { required: true, message: "请再次输入密码" },
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
                autoComplete="new-password"
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
                {loading ? "注册中..." : "注册账户"}
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
              立即登录
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
