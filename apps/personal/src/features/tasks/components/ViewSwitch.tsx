import React from "react";

type Opt = { value: string; label: string; icon?: React.ReactNode };
export default function ViewSwitch({
  value, onChange, options
}: { value: string; onChange: (v: any)=>void; options: Opt[] }) {
  return (
    <div className="inline-flex items-center rounded-xl border bg-card p-1">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition
            ${active ? "bg-accent/60 border border-accent/60" : "hover:bg-accent/40"}`}
            title={opt.label}
          >
            {opt.icon}{opt.label}
          </button>
        );
      })}
    </div>
  );
}
