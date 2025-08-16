import React, { useMemo, useRef, useState } from "react";

type Props = {
  date: Date; // the day we're scheduling on
  stepMin?: number; // slot size, default 30
  onSelect: (start: Date, end: Date) => void;
  defaultStart?: Date;
  defaultEnd?: Date;
};

export default function MiniDayGrid({ date, stepMin = 30, onSelect, defaultStart, defaultEnd }: Props) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);
  const container = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{startIdx:number; endIdx:number} | null>(null);

  const slots = useMemo(() => 24 * (60 / stepMin), [stepMin]); // e.g., 48 for 30 min
  const slotIdxFromClientY = (clientY: number) => {
    const rect = container.current!.getBoundingClientRect();
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const idx = Math.floor((y / rect.height) * slots);
    return Math.max(0, Math.min(slots - 1, idx));
  };

  const buildDateFromIdx = (idx: number) => {
    const d = new Date(date);
    d.setHours(0, idx * stepMin, 0, 0);
    return d;
  };

  const onMouseDown: React.MouseEventHandler = (e) => {
    if (!container.current) return;
    const idx = slotIdxFromClientY(e.clientY);
    setDragging({ startIdx: idx, endIdx: idx });
  };
  
  const onMouseMove: React.MouseEventHandler = (e) => {
    if (!dragging) return;
    const idx = slotIdxFromClientY(e.clientY);
    setDragging(s => s ? { ...s, endIdx: idx } : null);
  };
  
  const onMouseUp: React.MouseEventHandler = () => {
    if (!dragging) return;
    const a = Math.min(dragging.startIdx, dragging.endIdx);
    const b = Math.max(dragging.startIdx, dragging.endIdx) + 1; // inclusive end slot
    const start = buildDateFromIdx(a);
    const end = buildDateFromIdx(b);
    onSelect(start, end);
    setDragging(null);
  };

  // Highlight defaults or drag range
  const [hilow, hihigh] = (() => {
    if (dragging) {
      const a = Math.min(dragging.startIdx, dragging.endIdx);
      const b = Math.max(dragging.startIdx, dragging.endIdx) + 1;
      return [a, b];
    }
    if (defaultStart && defaultEnd) {
      const a = (defaultStart.getHours()*60 + defaultStart.getMinutes())/stepMin;
      const b = (defaultEnd.getHours()*60 + defaultEnd.getMinutes())/stepMin;
      return [a, b];
    }
    return [null, null] as any;
  })();

  return (
    <div
      ref={container}
      className="h-72 w-full border rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 select-none relative"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={() => dragging && setDragging(null)}
      onMouseUp={onMouseUp}
    >
      {hours.map(h => (
        <div key={h} className="relative h-1/24 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="absolute left-2 top-1 text-xs opacity-60">{String(h).padStart(2,"0")}:00</div>
        </div>
      ))}

      {hilow !== null && hihigh !== null && (
        <div
          className="absolute left-0 right-0 bg-blue-500/15 dark:bg-blue-400/20 pointer-events-none"
          style={{
            top: `${(100 * (hilow as number)) / slots}%`,
            height: `${(100 * ((hihigh as number) - (hilow as number))) / slots}%`,
          }}
        />
      )}
    </div>
  );
}
