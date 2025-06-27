"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Form, Input, Button, Card, Typography, message } from "antd";

const LoginForm = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        message.error("登录失败：邮箱或密码错误");
      } else {
        message.success("登录成功！");
        router.push("/");
      }
    } catch (error) {
      message.error("发生未知错误，请联系管理员。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
      <Typography.Title level={4} style={{ textAlign: "center" }}>
        登录您的账户
      </Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "请输入有效的邮箱地址" },
          ]}
        >
          <Input placeholder="请输入您的邮箱" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password placeholder="请输入您的密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            立即登录
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: "center", color: "#999" }}>
        还没有账户？
        <Button type="link" onClick={() => router.push("/auth/register")}>
          立即注册
        </Button>
      </div>
    </Card>
  );
};

export default LoginForm;
