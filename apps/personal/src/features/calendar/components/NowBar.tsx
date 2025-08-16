import React, { useMemo, useState } from "react";
import useNow from "@/hooks/useNow";
import { useCalendarStore } from "@/features/calendar/store/useCalendarStore";
import { useTasksStore } from "@/features/tasks/store/useTasksStore";
import { roundUp, addMinutes, nextFreeWindowToday } from "../utils/smartTime";
import { Clock, Plus, Rocket } from "lucide-react";

export default function NowBar({ stepMin = 15 }: { stepMin?: number }) {
  const { now, tz } = useNow(30_000);
  const addEvent = useCalendarStore(s => s.addEvent);
  const events = useCalendarStore(s => Object.values(s.events));
  const addTask = useTasksStore(s => s.addTask);

  const [title, setTitle] = useState("");

  const rounded = useMemo(() => roundUp(now, stepMin), [now, stepMin]);
  const nextHour = useMemo(() => {
    const d = new Date(now); d.setMinutes(0,0,0); d.setHours(d.getHours()+1); return d;
  }, [now]);
  const free = useMemo(() => nextFreeWindowToday(events, stepMin), [events, stepMin, now]);

  const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDay  = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const quickEvent = (start: Date, end: Date) => {
    const t = title.trim() || "New Event";
    addEvent({ title: t, start: start.toISOString(), end: end.toISOString(), source: "manual" });
    setTitle("");
  };

  const quickTaskNow = (durationMin = 30) => {
    const start = rounded;
    const end = addMinutes(start, durationMin);
    const t = title.trim() || "New Task";
    addTask({ title: t, status: "todo", scheduled: start.toISOString(), dueDate: end.toISOString() });
    setTitle("");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border bg-background/70 px-4 py-3">
      {/* Left: clock */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 opacity-70" />
        <div className="text-sm">
          <span className="font-medium">{fmtDay(now)}</span>
          <span className="mx-2">•</span>
          <span>{fmtTime(now)} {tz?.replace("_"," ")}</span>
        </div>
      </div>

      {/* Center: quick title */}
      <div className="flex items-center gap-2 flex-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)…"
          className="w-full md:w-80 rounded-lg border bg-background/60 px-3 py-2 text-sm"
        />
        <button
          onClick={() => quickTaskNow(30)}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent/50"
          title="Create a task starting now (+30m)"
        >
          <Plus className="w-4 h-4" /> Task Now
        </button>
        <button
          onClick={() => quickEvent(rounded, addMinutes(rounded, 30))}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent/50"
          title="Create a 30m event starting at the next slot"
        >
          <Rocket className="w-4 h-4 rotate-45" /> 30m Event
        </button>
      </div>

      {/* Right: smart chips */}
      <div className="flex flex-wrap gap-2">
        <Chip onClick={() => quickEvent(rounded, addMinutes(rounded, 25))}>Start now · 25m</Chip>
        <Chip onClick={() => quickEvent(rounded, addMinutes(rounded, 50))}>Start now · 50m</Chip>
        <Chip onClick={() => quickEvent(nextHour, addMinutes(nextHour, 60))}>Top of hour · 1h</Chip>
        {free && (
          <Chip onClick={() => quickEvent(free.start, addMinutes(free.start, Math.min(60, (free.end.getTime()-free.start.getTime())/60000)))}>
            Next free slot · {fmtTime(free.start)}
          </Chip>
        )}
      </div>
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs hover:bg-accent/50"
    >
      {children}
    </button>
  );
}
