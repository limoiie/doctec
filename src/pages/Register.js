import React from 'react';
import {Button, Form, Input, message} from 'antd';
import { useNavigate } from 'react-router-dom';
import {eel} from "../eel.js";

export function Register() {
  
  const navigate = useNavigate(); 
  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    try {
      // 使用 async/await 等待 Eel 后端返回的结果
      const result = await eel.addUser(values.username, values.password, values.email)();
      console.log(result); // 输出结果到控制台
  
      // 处理注册结果
      if (result.success) {
        message.success('注册成功！5秒后自动跳转到登录界面');
        setTimeout(() => {
          navigate('/'); // 跳转到登录页面
        }, 5000);
      } else {
        message.error(result.message || '注册失败，请稍后再试');
      }
    } catch (error) {
      message.error('发生错误，请重试');
      console.error(error);
    }
  };


  
  async function checkUsername(value) {

    const response = await fetch(`/api/check-username?username=${value}`);
    const data = await response.json();
  
    if (data.exists) {
      return Promise.reject(new Error('该用户名已被注册！'));
    }
  
    return Promise.resolve();
  }
  

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <Form
        name="register"
        style={{ maxWidth: 600, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", padding: 24, borderRadius: 8 }}
        onFinish={onFinish}
      >
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>注册</h2>
      <Form.Item
        name="username"
        label="用户名"
        rules={[
          {
            required: true,
            message: '请输入用户名！',
          },
          { min: 3, message: '用户名长度不能少于3个字符！' },
          /*
          {
            validator: async (_, value) => {
              if (!value) return Promise.reject(new Error('请输入用户名！'));

              // 调用检查用户名的函数
              await checkUsername(value);
            },
          },
          */
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[
          {
            required: true,
            message: '请输入密码！',
          },
          {
            min: 8,
            message: '密码长度必须至少为8个字符！',
          },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
            message: '密码必须包含字母、数字和特殊字符！',
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="密码确认"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: '请确认密码！',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('输入的新密码不匹配！'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          {
            type: 'email',
            message: '输入无效电子邮件！',
          },
          {
            required: true,
            message: '请输入你的邮箱！',
          },
        ]}
      >
        <Input />
      </Form.Item>

        <Button type="primary" htmlType="submit">
          注册
        </Button>

    </Form>
    </div>
  );
};