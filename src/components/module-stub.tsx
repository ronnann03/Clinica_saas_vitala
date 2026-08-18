import { CheckCircle2 } from "lucide-react";

export function ModuleStub({
  title,
  features,
}: {
  title: string;
  features: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Este módulo está planificado y su modelo de datos ya existe en el
          esquema. Se activa en la siguiente iteración.
        </p>
        <ul className="mt-6 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-300" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
