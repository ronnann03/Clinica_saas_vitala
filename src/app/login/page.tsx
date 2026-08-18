import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.user.role === "paciente" ? "/portal" : "/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <LoginForm />
    </div>
  );
}
