const FIELDS = [
  { label: "PACIENTE", value: "María Quispe R.", delay: "kd-field-1" },
  { label: "DNI", value: "44 718 820", delay: "kd-field-2" },
  { label: "ESPECIALIDAD", value: "Medicina general", delay: "kd-field-3" },
  { label: "PRÓXIMA CITA", value: "18 ago · 10:30 a. m.", delay: "kd-field-4" },
] as const;

export function FichaCard() {
  return (
    <div className="kd-card relative mx-auto w-full max-w-sm rounded-sm border border-manila-line bg-white shadow-[6px_6px_0_0_var(--color-manila)] sm:max-w-md">
      {/* punch holes, like a real card-index card */}
      <div className="absolute top-1/2 -left-2.5 flex -translate-y-1/2 flex-col gap-6">
        <span className="h-2.5 w-2.5 rounded-full bg-paper ring-1 ring-manila-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-paper ring-1 ring-manila-line" />
      </div>

      <div className="border-b border-dashed border-manila-line px-6 py-3">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-ink-soft">
          <span>FICHA N.º 0142</span>
          <span>VITALA</span>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        {FIELDS.map((field) => (
          <div key={field.label} className={`kd-field ${field.delay}`}>
            <p className="font-mono text-[10px] tracking-wider text-ink-soft">
              {field.label}
            </p>
            <p className="mt-0.5 text-[15px] font-medium text-ink">{field.value}</p>
          </div>
        ))}

        <div className="kd-field kd-field-5 flex gap-6 border-t border-dashed border-manila-line pt-4">
          <div>
            <p className="font-mono text-[10px] tracking-wider text-ink-soft">FC</p>
            <p className="mt-0.5 text-[15px] font-medium text-ink">78 lpm</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-wider text-ink-soft">PA</p>
            <p className="mt-0.5 text-[15px] font-medium text-ink">118/76</p>
          </div>
        </div>
      </div>

      <div className="kd-stamp pointer-events-none absolute -right-4 -bottom-5 rounded-sm border-[3px] border-double border-stamp px-4 py-1.5">
        <span className="font-mono text-sm font-semibold tracking-[0.2em] text-stamp">
          ATENDIDO
        </span>
      </div>
    </div>
  );
}
