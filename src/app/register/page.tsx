import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect(session.user.role === "paciente" ? "/portal" : "/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <RegisterForm />
    </div>
  );
}
