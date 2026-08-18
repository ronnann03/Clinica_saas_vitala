const CLINICS = [
  { name: "Clínica San Rafael", items: ["Usuarios", "Médicos", "Pacientes", "Citas", "Pagos"] },
  { name: "Clínica del Valle", items: ["Usuarios", "Médicos", "Pacientes", "Citas", "Pagos"] },
  { name: "Clínica Norte", items: ["Usuarios", "Médicos", "Pacientes", "Citas", "Pagos"] },
];

export function TenantTree() {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-sm border border-ink bg-ink px-5 py-2 font-mono text-xs font-semibold tracking-wider text-paper">
        VITALA
      </div>
      <div className="h-6 w-px bg-hairline" />

      <div className="grid w-full grid-cols-1 gap-6 border-t border-hairline pt-6 sm:grid-cols-3">
        {CLINICS.map((clinic) => (
          <div key={clinic.name} className="flex flex-col items-center">
            <div className="-mt-[30px] mb-3 h-6 w-px bg-hairline" />
            <div className="w-full rounded-sm border border-manila-line bg-manila px-4 py-2 text-center">
              <p className="text-sm font-semibold text-ink">{clinic.name}</p>
            </div>
            <ul className="mt-3 w-full space-y-1 border-l border-dashed border-hairline pl-3">
              {clinic.items.map((item) => (
                <li key={item} className="font-mono text-[12px] text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
