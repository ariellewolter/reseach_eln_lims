import React from "react";
import { ChevronLeft, ChevronRight, Calendar as Cal, LayoutGrid, Clock, Target } from "lucide-react";

export default function CalendarToolbar({
  mode, onModeChange, anchorDate, onToday, onPrev, onNext,
  slotMin, onSlotMinChange,
  onJumpToNow,                 // NEW
}: {
  mode: "day" | "week" | "month";
  onModeChange: (m: "day" | "week" | "month") => void;
  anchorDate: Date;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  slotMin?: number;
  onSlotMinChange?: (m: number) => void;
  onJumpToNow?: () => void;    // NEW
}) {
  const baseLabel = anchorDate.toLocaleString(undefined, { month: "long", year: "numeric" });
  const dayLabel  = anchorDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const label = mode === "day" ? dayLabel : baseLabel;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 bg-background/70">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="rounded-lg border px-2 py-1 hover:bg-accent/50"><ChevronLeft className="w-4 h-4"/></button>
        <button onClick={onNext} className="rounded-lg border px-2 py-1 hover:bg-accent/50"><ChevronRight className="w-4 h-4"/></button>
        <button onClick={onToday} className="rounded-lg border px-3 py-1 text-sm hover:bg-accent/50">Today</button>
        <div className="ml-2 font-medium">{label}</div>
      </div>

      <div className="flex items-center gap-3">
        {/* Slot granularity (only meaningful in Day view) */}
        <label className="hidden md:flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 opacity-70"/>
          <select
            value={slotMin || 15}
            onChange={(e) => onSlotMinChange?.(parseInt(e.target.value))}
            className="rounded-lg border bg-background/60 px-2 py-1"
            title="Minute granularity"
          >
            {[5,10,15,30,60].map(n => <option key={n} value={n}>{n} min</option>)}
          </select>
        </label>

        {/* NEW: Jump to now */}
        <button
          onClick={onJumpToNow}
          className="rounded-xl border px-3 py-1.5 text-sm inline-flex items-center gap-2 hover:bg-accent/50"
          title="Jump to current time"
        >
          <Target className="w-4 h-4" /> Now
        </button>

        <div className="inline-flex items-center rounded-xl border bg-background/60 p-1">
          <button
            onClick={() => onModeChange("day")}
            className={`px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2 ${mode==="day" ? "bg-accent/60 border" : "hover:bg-accent/40"}`}>
            <Clock className="w-4 h-4"/> Day
          </button>
          <button
            onClick={() => onModeChange("week")}
            className={`px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2 ${mode==="week" ? "bg-accent/60 border" : "hover:bg-accent/40"}`}>
            <Cal className="w-4 h-4"/> Week
          </button>
          <button
            onClick={() => onModeChange("month")}
            className={`px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2 ${mode==="month" ? "bg-accent/60 border" : "hover:bg-accent/40"}`}>
            <LayoutGrid className="w-4 h-4"/> Month
          </button>
        </div>
      </div>
    </div>
  );
}
