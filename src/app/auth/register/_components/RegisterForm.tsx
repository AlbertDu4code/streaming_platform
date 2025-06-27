"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { registerUser } from "@/app/actions/auth";

const RegisterForm = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const result = await registerUser(values);
      if (result.success) {
        message.success("注册成功！将跳转至登录页面。");
        router.push("/auth/login");
      } else {
        message.error(result.error || "注册失败，请稍后重试。");
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
        创建您的账户
      </Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="用户名"
          name="name"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="请输入您的用户名" />
        </Form.Item>
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
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码长度不能少于6位" },
          ]}
        >
          <Input.Password placeholder="请输入您的密码" />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirmPassword"
          dependencies={["password"]}
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
          <Input.Password placeholder="请再次确认您的密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            立即注册
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: "center", color: "#999" }}>
        已有账户？
        <Button type="link" onClick={() => router.push("/auth/login")}>
          直接登录
        </Button>
      </div>
    </Card>
  );
};

export default RegisterForm;
