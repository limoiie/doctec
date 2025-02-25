import { useEffect, useState } from "react";
import { eel } from "@/eel";
import type { UserData } from "@/types/UserData.schema";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TrashIcon } from "lucide-react";
import { DialogDemo } from "@/components/new-user-button";
import { formatDateTime } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import React from "react";

export function UserDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutConfirmDialog, setShowLogoutConfirmDialog] =
    React.useState<boolean>(false);


  const currentUser = user?.username


  function loadData() {
    setLoading(true);
    setError(null);

    eel.fetchAllUsers()()
      .then((users: UserData[]) => {
        setUsers(users);
        setLoading(false);
      })
      .catch((error: any) => {
        setError(error.toString());
        setLoading(false);
      });
  }
  function handleDelete(username: string) {
    setShowLogoutConfirmDialog(false);
    eel.deleteUser(username)()
      .then(() => {
        setUserToDelete(null);
        loadData();
        //navigate(0);
      })
      .catch((error: any) => {
        setError('删除失败: ' + error.toString());
      });
    
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
    <div className="p-4">
      {loading && <p>加载中...</p>}
      {error && <p className="text-red-500">加载失败: {error}</p>}

      {!loading && !error && users && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
            <DialogDemo onUserCreated={loadData}/>
          </div>

          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-gray-900 font-semibold w-[200px]">用户名</TableHead>
                <TableHead className="text-gray-900 font-semibold">身份</TableHead>
                <TableHead className="text-gray-900 font-semibold">创建时间</TableHead>
                <TableHead className="text-gray-900 font-semibold">更新时间</TableHead>
                <TableHead className="text-gray-900 font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody className="border-t">
              {users.map((user) => (
                <TableRow key={user.username} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.is_admin ? '管理员' : '普通用户'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDateTime(user.created)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(user.updated)}
                  </TableCell>
                  <TableCell className="text-right">
                    <button 
                      onClick={() => setUserToDelete(user.username)}
                      disabled={user.username === currentUser}
                      className={`p-2 rounded-lg flex items-center gap-2 ${
                        user.username === currentUser 
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors'
                      }`}
                      title="删除用户"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="text-sm">删除</span>
                    </button>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
    <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>你确定删除吗？</AlertDialogTitle>
        <AlertDialogDescription>
          此操作无法撤消。这将永久删除该帐户。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setUserToDelete(null)}>
          取消
        </AlertDialogCancel>
        <AlertDialogAction 
          onClick={() => userToDelete && handleDelete(userToDelete)}
        >
          删除  
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
    </>
  );
}
