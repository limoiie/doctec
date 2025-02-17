import { useState } from "react";

import { eel } from "@/eel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { formatDateTime } from "@/utils";

export function PersonalInformationDetails() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setPasswordError("密码长度至少6位");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("新密码不一致");
      return;
    }
    
    try {
      setIsSubmitting(true);
      // 调用后端接口修改密码
      await eel.update_password(user?.sessionToken, oldPassword, newPassword)();
      setPasswordError("");
      // 清空表单
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError("修改密码失败，请检查旧密码是否正确");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl w-full mx-auto my-4">
      <CardHeader>
        <CardTitle>个人信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>用户名</Label>
          <Input 
            value={user?.username || "加载中..."} 
            disabled 
          />
        </div>
        
        <div className="space-y-2">
          <Label>身份</Label>
          <Input 
            value={user ? (user.is_admin ? "管理员" : "普通用户") : "加载中..."} 
            disabled 
          />
        </div>

        <div className="space-y-2">
          <Label>创建时间</Label>
          <Input 
            value={user ?.created || "加载中..."} 
            disabled 
          />
        </div>

        <div className="space-y-2">
          <Label>更新时间</Label>
          <Input 
            value={user ?.updated || "加载中..."} 
            disabled 
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">修改密码</Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>修改密码</DialogTitle>
              <DialogDescription>请输入旧密码和新密码</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>旧密码</Label>
                <Input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>新密码</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>确认新密码</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}
              
              <Button 
                onClick={handlePasswordChange}
                disabled={isSubmitting}
              >
                {isSubmitting ? "提交中..." : "确认修改"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
