import { requirePatientSession } from "@/lib/patient-portal";
import { ProfileForm } from "@/components/portal/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

type EmergencyContact = { name?: string; phone?: string } | null;

export default async function PortalPerfilPage() {
  const { patient, user } = await requirePatientSession();
  const emergencyContact = patient.emergencyContact as EmergencyContact;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-slate-900">Mi perfil</h1>
      <p className="mt-1 text-sm text-slate-500">
        {patient.firstName} {patient.lastName} · {user.email}
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Mis datos</h2>
        <div className="mt-3">
          <ProfileForm phone={patient.phone} address={patient.address} emergencyContact={emergencyContact} />
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
