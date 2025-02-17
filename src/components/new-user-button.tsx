import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CirclePlusIcon } from "lucide-react";
import { useState } from "react";
import { eel } from "@/eel";
import type { UserData } from "@/types/UserData.schema";

export function DialogDemo() {
  const [formData, setFormData] = useState({
    username: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  
  const register = async () => {
    try {
      // 添加表单验证
      if (!formData.username || !formData.role || !formData.password) {
        alert('请填写所有必填字段');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }

      // 转换角色为is_admin布尔值
      const isAdmin = formData.role === 'admin';
      
      // 调用Python后端
      const result = await eel.register(
        formData.username,
        formData.password,
        isAdmin
      )();
      
      alert('用户创建成功');
      
      console.log('注册结果:', result);
      
      // 清空表单
      setFormData({
        username: '',
        role: '',
        password: '',
        confirmPassword: ''
      });
      
      // 这里可以添加关闭对话框的逻辑
    } catch (error) {
      console.error("注册失败:", error);
  }}


  return (
    <Dialog>
      <DialogTrigger asChild>
      <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white">
          <CirclePlusIcon className="w-4 h-4 mr-2" />
          新建用户
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新建用户</DialogTitle>
            <DialogDescription>
              在此处填写用户信息，完成后单击确认。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                用户名
              </Label>
              <Input 
                id="username" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                身份
              </Label>
              <select 
                id="role" 
                className="col-span-3 border rounded-md p-2" 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="" disabled>请选择身份</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                密码
              </Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                确认密码
              </Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={register} type="button">确认</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}