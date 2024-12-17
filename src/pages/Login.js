import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Flex ,message} from "antd";
import { useNavigate } from "react-router-dom";


export function Login() {
  const navigate = useNavigate();  // 获取 navigate 函数
  
  const onFinish = (values) => {
    console.log("Received values of form: ", values);

    
    // 假设登录验证通过
    const loginSuccess = true; // 这里是模拟验证，你可以根据实际情况进行修改
    
    if (loginSuccess) {
      message.success('登录成功！');

      navigate('/mainwin'); // 登录成功后跳转到主界面
    } else {
      message.error('登录失败，用户名或密码错误！');

    }
  };
  

  const handleRegisterClick = () => {
    navigate("/register");  // 跳转到注册页面
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Form
        name="login"
        initialValues={{ remember: true }}
        style={{ maxWidth: 360, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", padding: 24, borderRadius: 8 }}
        onFinish={onFinish}
      >
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>登录</h2>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "请输入用户名！" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "请输入密码！" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>
      
        <Form.Item>
          <Button block type="primary" htmlType="submit">
            登录
          </Button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            还没有账号？ <a href="#" onClick={handleRegisterClick}>注册</a>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
