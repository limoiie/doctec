import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm onLogin={login} />
      </div>
    </div>
  );
}
