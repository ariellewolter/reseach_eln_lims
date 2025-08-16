import React, { useMemo, useState } from "react";
import { X, CalendarDays, Clock, Plus } from "lucide-react";
import MiniDayGrid from "./MiniDayGrid";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTitle: string;
  onCreate: (payload: { title: string; startISO: string; endISO: string; tags?: string[] }) => void;
};

function fmtRange(start: Date, end: Date) {
  const pad = (n:number)=> String(n).padStart(2,"0");
  const sameDay = start.toDateString() === end.toDateString();
  const day = start.toLocaleDateString(undefined, { month:"short", day:"numeric", weekday:"short" });
  const t1 = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const t2 = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  return sameDay ? `${day} ${t1}–${t2}` : `${start.toLocaleString()} → ${end.toLocaleString()}`;
}

export default function QuickScheduleDialog({ open, onClose, defaultTitle, onCreate }: Props) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState(defaultTitle || "");
  const [start, setStart] = useState<Date>(() => {
    const d = new Date(); d.setMinutes(0,0,0); return d;
  });
  const [end, setEnd] = useState<Date>(() => {
    const d = new Date(); d.setMinutes(0,0,0); d.setHours(d.getHours()+1); return d;
  });

  const dateObj = useMemo(() => {
    const d = new Date(date+"T00:00:00");
    return d;
  }, [date]);

  const onGridSelect = (s: Date, e: Date) => {
    // constrain selection to chosen date
    const day = dateObj;
    s.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    e.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    setStart(s); setEnd(e);
  };

  const rangeLabel = fmtRange(start, end);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl border bg-card shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-medium">Schedule from Selection</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          <label className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 opacity-70"/>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="bg-input border border-border text-foreground px-2 py-1 rounded-md w-48 outline-none focus:border-accent"/>
          </label>

          <label className="flex items-center gap-2">
            <Clock className="w-4 h-4 opacity-70"/>
            <div className="text-sm opacity-80">{rangeLabel}</div>
          </label>

          <MiniDayGrid
            date={dateObj}
            stepMin={30}
            onSelect={onGridSelect}
            defaultStart={start}
            defaultEnd={end}
          />

          <div>
            <input
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground placeholder-muted outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={()=>{
                onCreate({ title: title || "Scheduled block", startISO: start.toISOString(), endISO: end.toISOString() });
                onClose();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <Plus className="w-4 h-4"/> Create Event
            </button>
            <div className="text-xs opacity-60">Tip: drag on the grid to set start–end</div>
          </div>
        </div>
      </div>
    </div>
  );
}
