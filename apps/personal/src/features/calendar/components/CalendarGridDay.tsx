import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { CalendarEvent } from "@research/types";
import CalendarEventChip from "./CalendarEventChip";
import FloatingNowButton from "./FloatingNowButton";
import EventEditDialog from "./EventEditDialog";

export type CalendarGridDayHandle = { scrollToNow: () => void };

function minutesSinceMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

const CalendarGridDay = forwardRef<CalendarGridDayHandle, {
  day: Date;
  events: CalendarEvent[];
  stepMin?: number;
  onDragCreate: (start: Date, end: Date) => void;
  onDropTask: (taskId: string, minutesFromMidnight: number) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent?: (id: string) => void;
  autoScrollToNow?: boolean;
}>(function GridDay(props, ref) {
  const { day, events, stepMin = 15, onDragCreate, onDropTask, updateEvent, deleteEvent, autoScrollToNow = true } = props;
  
  const isToday = new Date().toDateString() === day.toDateString();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);
  const slotsPerDay = useMemo(() => Math.round(24 * (60 / stepMin)), [stepMin]);

  // drag-create state (snap to stepMin)
  const [drag, setDrag] = useState<{ startMin: number; endMin: number } | null>(null);

  // drag-move state
  const [moving, setMoving] = useState<null | {
    id: string;
    durationMin: number;
    offsetMin: number;    // mouse offset from event start
    startMin: number;     // live preview start
  }>(null);

  // resize state
  const [resizing, setResizing] = useState<null | {
    id: string;
    dir: "start" | "end";
    startMin: number;
    endMin: number;
  }>(null);

  const [pulseAt, setPulseAt] = useState<number | null>(null); // NEW

  // Add editing state
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Current-time line updater
  const [nowMin, setNowMin] = useState<number>(() => minutesSinceMidnight(new Date()));
  useEffect(() => {
    if (!isToday) return;
    const t = setInterval(() => setNowMin(minutesSinceMidnight(new Date())), 30 * 1000);
    return () => clearInterval(t);
  }, [isToday]);

  // Add now visibility state
  const [nowVisible, setNowVisible] = useState(true);

  // Check if current time is visible on screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const top = el.scrollTop;
      const h = el.clientHeight;
      const total = el.scrollHeight;
      const nowY = (nowMin / (24 * 60)) * total;
      const margin = h * 0.05; // small dead-zone so the button hides a bit early
      setNowVisible(nowY >= top + margin && nowY <= top + h - margin);
    };

    update();
    el.addEventListener("scroll", update);
    const t = window.setInterval(update, 30_000); // refresh as time moves
    return () => { el.removeEventListener("scroll", update); window.clearInterval(t); };
  }, [nowMin]);

  // Local jump to now function
  const jumpToNow = () => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ratio = nowMin / (24 * 60);
    const target = Math.max(0, el.scrollHeight * ratio - el.clientHeight * 0.3);
    el.scrollTo({ top: target, behavior: "smooth" });
    setPulseAt(nowMin);
    window.setTimeout(() => setPulseAt(null), 2000);
  };

  // expose imperative scroll
  useImperativeHandle(ref, () => ({
    scrollToNow() {
      if (!containerRef.current) return;
      const ratio = nowMin / (24 * 60);
      const target = Math.max(0, containerRef.current.scrollHeight * ratio - containerRef.current.clientHeight * 0.3);
      containerRef.current.scrollTo({ top: target, behavior: "smooth" });
      setPulseAt(nowMin);
      // auto-clear pulse after 2s
      window.setTimeout(() => setPulseAt(null), 2000);
    }
  }), [nowMin]);

  // Auto scroll near "now"
  useEffect(() => {
    if (!autoScrollToNow || !isToday || !containerRef.current) return;
    
    // Debounce auto-scroll to prevent conflicts
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const ratio = nowMin / (24 * 60);
      const target = Math.max(0, el.scrollHeight * ratio - el.clientHeight * 0.3);
      el.scrollTo({ top: target, behavior: "smooth" });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [autoScrollToNow, isToday, nowMin]);

  const minFromClientY = (clientY: number) => {
    const rect = gridRef.current!.getBoundingClientRect();
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const ratio = y / rect.height;
    const mins = Math.floor(24 * 60 * ratio);
    return Math.round(mins / stepMin) * stepMin; // snap
  };

  const toPct = (mins: number) => `${(mins / (24 * 60)) * 100}%`;

  // Mouse interactions
  const onMouseDown: React.MouseEventHandler = (e) => {
    if (!gridRef.current) return;
    setDrag({ startMin: minFromClientY(e.clientY), endMin: minFromClientY(e.clientY) });
  };
  const onMouseMove: React.MouseEventHandler = (e) => {
    if (resizing) {
      const m = minFromClientY(e.clientY);
      if (resizing.dir === "start") {
        const newStartMin = Math.max(0, Math.min(m, resizing.endMin - stepMin));
        setResizing(s => s ? ({ ...s, startMin: newStartMin }) : s);
      } else {
        const newEndMin = Math.min(24*60, Math.max(m, resizing.startMin + stepMin));
        setResizing(s => s ? ({ ...s, endMin: newEndMin }) : s);
      }
    } else if (moving) {
      const m = minFromClientY(e.clientY);
      const startMin = Math.max(0, Math.min(m - moving.offsetMin, 24*60 - moving.durationMin));
      setMoving(s => s ? ({ ...s, startMin }) : s);
    } else if (drag) {
      setDrag(d => d ? { ...d, endMin: minFromClientY(e.clientY) } : null);
    }
  };
  const onMouseUp: React.MouseEventHandler = () => {
    if (resizing) {
      const start = new Date(day); start.setHours(0,0,0,0); start.setMinutes(resizing.startMin);
      const end   = new Date(day); end.setHours(0,0,0,0); end.setMinutes(resizing.endMin);
      updateEvent(resizing.id, { start: start.toISOString(), end: end.toISOString(), allDay: false });
      setResizing(null);
    } else if (moving) {
      const start = new Date(day); start.setHours(0,0,0,0); start.setMinutes(moving.startMin);
      const end   = new Date(start); end.setMinutes(start.getMinutes() + moving.durationMin);
      updateEvent(moving.id, { start: start.toISOString(), end: end.toISOString(), allDay: false });
      setMoving(null);
    } else if (drag) {
      const a = Math.min(drag.startMin, drag.endMin);
      const b = Math.max(drag.startMin, drag.endMin);
      const start = new Date(day); start.setHours(0, 0, 0, 0); start.setMinutes(a);
      const end   = new Date(day); end.setHours(0, 0, 0, 0);   end.setMinutes(Math.max(a + stepMin, b));
      setDrag(null);
      onDragCreate(start, end);
    }
  };

  // Task drop
  const onDragOver: React.DragEventHandler = (e) => {
    if (e.dataTransfer.types.includes("application/x-task-id")) e.preventDefault();
  };
  const onDrop: React.DragEventHandler = (e) => {
    const id = e.dataTransfer.getData("application/x-task-id");
    if (!id) return;
    e.preventDefault();
    onDropTask(id, minFromClientY(e.clientY));
  };

  // Events for the day
  const dayStart = useMemo(() => { const d = new Date(day); d.setHours(0,0,0,0); return d; }, [day]);
  const dayEnd   = useMemo(() => { const d = new Date(day); d.setHours(23,59,59,999); return d; }, [day]);
  const list = useMemo(() => events.filter(ev => {
    const s = new Date(ev.start), e = new Date(ev.end);
    return (s <= dayEnd && e >= dayStart);
  }), [events, dayStart, dayEnd]);

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div ref={containerRef} className="h-[900px] overflow-auto">
        <div 
          className="relative grid grid-cols-[56px_1fr]" 
          onMouseLeave={() => {
            if (drag) setDrag(null);
            if (moving) setMoving(null);
            if (resizing) setResizing(null);
          }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {/* Time gutter */}
          <div className="relative">
            {hours.map(h => (
              <div key={h} className="relative h-[120px] border-b border-neutral-200/40 dark:border-neutral-800/50">
                <div className="sticky left-0 -translate-y-2 text-[11px] opacity-70 px-2">
                  {String(h).padStart(2,"0")}:00
                </div>
              </div>
            ))}
          </div>

                                {/* Grid */}
                      <div
                        ref={gridRef}
                        className="relative"
                        onMouseDown={onMouseDown}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                      >
            {/* Hour lines */}
            {hours.map(h => (
              <div
                key={h}
                className="h-[120px] border-b border-neutral-200/40 dark:border-neutral-800/50"
              >
                {/* Minor sub-divisions */}
                <div className="relative h-full">
                  {Array.from({ length: Math.floor(60 / stepMin) - 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-dashed border-neutral-200/30 dark:border-neutral-800/30"
                      style={{ top: `${((i + 1) * stepMin) / 60 * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Now line */}
            {isToday && (
              <div
                className="absolute left-0 right-0 z-10"
                style={{ top: toPct(nowMin) }}
              >
                <div className="h-[2px] bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
              </div>
            )}

            {/* NEW: pulse marker at now */}
            {isToday && pulseAt !== null && (
              <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: toPct(pulseAt) }}>
                <div className="relative h-3">
                  <div className="absolute left-2 w-3 h-3 rounded-full bg-rose-500/80 animate-ping" />
                  <div className="absolute left-2 w-3 h-3 rounded-full bg-rose-500/80" />
                </div>
              </div>
            )}

            {/* Existing events */}
            {list.map(ev => {
              const s = new Date(ev.start), e = new Date(ev.end);
              const topMin = Math.max(0, (s.getTime() - dayStart.getTime()) / 60000);
              const endMin = Math.min(24 * 60, (e.getTime() - dayStart.getTime()) / 60000);
              const topPct = (topMin / (24 * 60)) * 100;
              const heightPct = Math.max(2, ((endMin - topMin) / (24 * 60)) * 100);
              const durationMin = Math.max(15, Math.round((endMin - topMin) / stepMin) * stepMin);
              const timeLabel = `${s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
              return (
                <div key={ev.id} className="absolute left-2 right-2" style={{ top: `${topPct}%`, height: `${heightPct}%` }}>
                  <CalendarEventChip
                    title={ev.title}
                    timeLabel={timeLabel}
                    tags={ev.tags}
                    resizable
                    draggable
                    onClick={() => {
                      // Open edit dialog
                      setEditingEvent(ev);
                    }}
                    onDoubleClick={() => {
                      // Quick edit on double click
                      setEditingEvent(ev);
                    }}
                    onResizeStart={(dir) => {
                      const startMinRounded = Math.round(topMin / stepMin) * stepMin;
                      const endMinRounded   = Math.round(endMin / stepMin) * stepMin;
                      setResizing({ id: ev.id, dir, startMin: startMinRounded, endMin: endMinRounded });
                    }}
                    onDragStart={(e) => {
                      const mouseMin = minFromClientY(e.clientY);
                      const startMinRounded = Math.round(topMin / stepMin) * stepMin;
                      const duration = Math.max(stepMin, Math.round((endMin - topMin) / stepMin) * stepMin);
                      const offset = mouseMin - startMinRounded;
                      setMoving({ id: ev.id, durationMin: duration, offsetMin: offset, startMin: startMinRounded });
                    }}
                  />
                </div>
              );
            })}

            {/* Drag selection overlay */}
            {drag && (
              <div
                className="absolute left-2 right-2 bg-blue-500/15 dark:bg-blue-400/20 pointer-events-none rounded-md"
                style={{
                  top: toPct(Math.min(drag.startMin, drag.endMin)),
                  height: `calc(${toPct(Math.abs(drag.endMin - drag.startMin))})`,
                }}
              />
            )}

            {/* Moving preview overlay */}
            {moving && (
              <div
                className="absolute left-2 right-2 bg-purple-500/15 dark:bg-purple-400/20 pointer-events-none rounded-md"
                style={{
                  top: toPct(moving.startMin),
                  height: `calc(${toPct(moving.durationMin)})`,
                }}
              />
            )}

            {/* Resize preview overlay */}
            {resizing && (
              <div
                className="absolute left-2 right-2 bg-orange-500/15 dark:bg-orange-400/20 pointer-events-none rounded-md"
                style={{
                  top: toPct(resizing.startMin),
                  height: `calc(${toPct(resizing.endMin - resizing.startMin)})`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Now Button */}
      <FloatingNowButton
        show={isToday && !nowVisible}
        label={`Now · ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`}
        onClick={jumpToNow}
      />

      {/* Event Edit Dialog */}
      <EventEditDialog
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={(updatedEvent) => {
          updateEvent(updatedEvent.id!, updatedEvent);
          setEditingEvent(null);
        }}
        onDelete={(eventId) => {
          if (deleteEvent) {
            deleteEvent(eventId);
          }
          setEditingEvent(null);
        }}
      />
    </div>
  );
});

export default CalendarGridDay;


