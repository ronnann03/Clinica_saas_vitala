import { NAV_ITEMS } from "@/lib/nav";

export function ModuleTabs() {
  const modules = NAV_ITEMS.filter((item) => item.href !== "/dashboard");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((item, index) => {
        const Icon = item.icon;
        const alt = index % 2 === 1;
        return (
          <div
            key={item.href}
            className={`kd-tab border px-5 pt-6 pb-5 ${
              alt
                ? "border-manila-line bg-manila-deep"
                : "border-manila-line bg-manila"
            }`}
          >
            <div className="flex items-center gap-2 text-ink">
              <Icon className="h-4 w-4 shrink-0" />
              <h3 className="text-sm font-semibold">{item.label}</h3>
            </div>
            <ul className="mt-3 space-y-1.5">
              {item.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex gap-2 text-[13px] leading-snug text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
