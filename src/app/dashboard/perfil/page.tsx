import { requireTenant } from "@/lib/tenant";
import { ROLE_LABELS } from "@/lib/roles";
import { ProfileInfoForm } from "@/components/profile/profile-info-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export default async function PerfilPage() {
  const { user } = await requireTenant();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-slate-900">Mi perfil</h1>
      <p className="mt-1 text-sm text-slate-500">
        {user.email} · {ROLE_LABELS[user.role]}
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Datos personales</h2>
        <div className="mt-3">
          <ProfileInfoForm firstName={user.firstName} lastName={user.lastName} phone={user.phone} />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Cambiar contraseña</h2>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
