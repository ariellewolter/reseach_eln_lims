import React, { useMemo, useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { CalendarEvent } from "@research/types";
import CalendarEventChip from "./CalendarEventChip";
import CalendarSpanBar from "./CalendarSpanBar";
import FloatingNowButton from "./FloatingNowButton";
import EventEditDialog from "./EventEditDialog";

export type CalendarGridWeekHandle = { scrollToNow: () => void };

function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}

const CalendarGridWeek = forwardRef<CalendarGridWeekHandle, {
  weekStart: Date;
  events: CalendarEvent[];
  onDragCreate: (start: Date, end: Date) => void;
  onDropTask: (taskId: string, date: Date, minutesFromMidnight: number) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent?: (id: string) => void;
}>(function GridWeek(props, ref) {
  const { weekStart, events, onDragCreate, onDropTask, updateEvent, deleteEvent } = props;
  
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);

  const weekStartTime = useMemo(() => weekStart.getTime(), [weekStart]);
  const weekEndTime = useMemo(() => addDays(weekStart, 7).getTime(), [weekStart]);

  const weekEvents = useMemo(() => events.filter(ev => {
    const start = new Date(ev.start).getTime();
    const end = new Date(ev.end).getTime();
    return start < weekEndTime && end > weekStartTime;
  }), [events, weekStartTime, weekEndTime]);

  // refs
  const scrollRef = useRef<HTMLDivElement>(null);  // NEW: scrollable wrapper
  const gridRef = useRef<HTMLDivElement>(null);
  const allDayRef = useRef<HTMLDivElement>(null);

  // compute today column + minutes
  const now = new Date();
  const isSameWeek =
    new Date(weekStart).toDateString() <= now.toDateString() &&
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6).toDateString() >= now.toDateString();
  const todayIdx = ((now.getDay() + 6) % 7); // Mon=0

  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

  // expose scrollToNow
  useImperativeHandle(ref, () => ({
    scrollToNow() {
      if (!scrollRef.current) return;
      const ratio = minutesSinceMidnight / (24 * 60);
      const target = Math.max(0, scrollRef.current.scrollHeight * ratio - scrollRef.current.clientHeight * 0.3);
      scrollRef.current.scrollTo({ top: target, behavior: "smooth" });
      setPulseAt(minutesSinceMidnight);
      window.setTimeout(() => setPulseAt(null), 2000);
    }
  }), [minutesSinceMidnight]);

  const [pulseAt, setPulseAt] = useState<number | null>(null); // NEW

  // Add now visibility state
  const [nowVisible, setNowVisible] = useState(true);

  // Check if current time is visible on screen
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const top = el.scrollTop;
      const h = el.clientHeight;
      const total = el.scrollHeight;
      const nowY = (minutesSinceMidnight / (24 * 60)) * total;
      const margin = h * 0.05; // small dead-zone so the button hides a bit early
      setNowVisible(nowY >= top + margin && nowY <= top + h - margin);
    };

    update();
    el.addEventListener("scroll", update);
    const t = window.setInterval(update, 30_000); // refresh as time moves
    return () => { el.removeEventListener("scroll", update); window.clearInterval(t); };
  }, [minutesSinceMidnight]);

  // Local jump to now function
  const jumpToNow = () => {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = minutesSinceMidnight / (24 * 60);
    const target = Math.max(0, el.scrollHeight * ratio - el.clientHeight * 0.3);
    el.scrollTo({ top: target, behavior: "smooth" });
    setPulseAt(minutesSinceMidnight);
    window.setTimeout(() => setPulseAt(null), 2000);
  };

  // helper to percent
  const pct = (mins: number) => (mins / (24 * 60)) * 100;

  // drag-move state
  const [moving, setMoving] = useState<null | {
    id: string; dayIdx: number; durationMin: number; offsetMin: number; startMin: number;
  }>(null);

  // editing state
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Helper functions for drag-to-move
  const minutesFromClientY = (clientY: number) => {
    const rect = document.querySelector('.calendar-week-grid')?.getBoundingClientRect();
    if (!rect) return 0;
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const ratio = y / rect.height;
    const mins = Math.floor(24 * 60 * ratio);
    return Math.round(mins / 30) * 30; // snap to 30-min intervals
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (moving) {
      const m = minutesFromClientY(e.clientY);
      const startMin = Math.max(0, Math.min(m - moving.offsetMin, 24*60 - moving.durationMin));
      setMoving(s => s ? ({ ...s, startMin }) : s);
    }
  };

  const handleMouseUp = () => {
    if (moving) {
      const day = new Date(weekStart); day.setDate(day.getDate() + moving.dayIdx);
      const start = new Date(day); start.setHours(0,0,0,0); start.setMinutes(moving.startMin);
      const end   = new Date(start); end.setMinutes(start.getMinutes() + moving.durationMin);
      updateEvent(moving.id, { start: start.toISOString(), end: end.toISOString(), allDay: false });
      setMoving(null);
    }
  };

  // compute span bars for the week:
  const spans = useMemo(() => {
    const weekStartMid = new Date(weekStart); weekStartMid.setHours(0,0,0,0);
    const weekEndMid   = new Date(weekStart); weekEndMid.setDate(weekEndMid.getDate()+7); weekEndMid.setHours(0,0,0,0);

    const bars: Array<{ id: string; title: string; startCol: number; endCol: number; tags?: string[] }> = [];
    for (const ev of events) {
      const s = new Date(ev.start), e = new Date(ev.end);
      // treat as a span if all-day or longer than 18h or crossing midnight
      const isSpan = ev.allDay || (e.getTime() - s.getTime() > 18*60*60*1000) || s.toDateString() !== e.toDateString();
      if (!isSpan) continue;

      const clampedStart = s < weekStartMid ? weekStartMid : s;
      const clampedEnd   = e > weekEndMid   ? weekEndMid   : e;
      if (clampedStart >= clampedEnd) continue;

      const startCol = Math.floor((clampedStart.getTime() - weekStartMid.getTime()) / (24*60*60*1000));
      const endCol   = Math.ceil((clampedEnd.getTime()   - weekStartMid.getTime()) / (24*60*60*1000));
      bars.push({ id: ev.id, title: ev.title, startCol: Math.max(0, startCol), endCol: Math.min(7, endCol), tags: ev.tags });
    }
    return bars;
  }, [events, weekStart]);

  const onDayClick = (day: Date, hour: number) => {
    const start = new Date(day); start.setHours(hour, 0, 0, 0);
    const end = new Date(day); end.setHours(hour + 1, 0, 0, 0);
    onDragCreate(start, end);
  };

  const onDayDrop = (day: Date, hour: number, taskId: string) => {
    const start = new Date(day); start.setHours(hour, 0, 0, 0);
    const end = new Date(day); end.setHours(hour + 1, 0, 0, 0);
    onDropTask(taskId, day, hour * 60);
  };

  return (
    <div className="relative h-[900px] rounded-xl border bg-background select-none" onMouseUp={handleMouseUp}>
      {/* Single unified calendar grid */}
      <div
        ref={scrollRef}
        className="overflow-auto h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => moving && setMoving(null)}
      >
        <div 
          className="calendar-week-grid grid grid-cols-[80px_repeat(7,1fr)] min-w-[800px]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => moving && setMoving(null)}
        >
          {/* Header row */}
          <div className="sticky top-0 bg-background/80 backdrop-blur z-10 border-b border-r border-neutral-200/40 dark:border-neutral-800/50 p-2"></div>
          {days.map((day, i) => (
            <div key={i} className="sticky top-0 bg-background/80 backdrop-blur z-10 border-b border-r border-neutral-200/40 dark:border-neutral-800/50 p-2 text-center">
              <div className="text-sm font-medium">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className="text-xs opacity-70">{day.getDate()}</div>
            </div>
          ))}

          {/* All-day span bars row */}
          <div className="sticky top-[72px] bg-background/80 backdrop-blur z-10 border-b border-r border-neutral-200/40 dark:border-neutral-800/50 p-2"></div>
          <div className="sticky top-[72px] bg-background/80 backdrop-blur z-10 border-b border-r border-neutral-200/40 dark:border-neutral-800/50 p-2" style={{ gridColumn: '2 / 9' }}>
            <div className="grid grid-cols-7 gap-1 items-start">
              {spans.map(bar => (
                <CalendarSpanBar key={bar.id} {...bar} />
              ))}
            </div>
          </div>

          {/* Time grid */}
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="border-r border-neutral-200/40 dark:border-neutral-800/50 p-2 text-right text-xs opacity-70">
                {String(hour).padStart(2, "0")}:00
              </div>
              {days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border-r border-b border-neutral-200/40 dark:border-neutral-800/50 p-1 min-h-[60px] relative hover:bg-accent/20 cursor-pointer"
                  onClick={() => onDayClick(day, hour)}
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes("application/x-task-id")) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData("application/x-task-id");
                    if (taskId) {
                      e.preventDefault();
                      onDayDrop(day, hour, taskId);
                    }
                  }}
                >
                  {/* Events in this time slot */}
                  {weekEvents
                    .filter(ev => {
                      const evStart = new Date(ev.start);
                      const evEnd = new Date(ev.end);
                      return evStart.getDate() === day.getDate() && 
                             evStart.getMonth() === day.getMonth() &&
                             evStart.getFullYear() === day.getFullYear() &&
                             evStart.getHours() === hour;
                    })
                    .map(ev => {
                      const evStart = new Date(ev.start);
                      const evEnd = new Date(ev.end);
                      const topMin = evStart.getMinutes();
                      const endMin = evEnd.getMinutes();
                      const topPct = (topMin / 60) * 100;
                      const heightPct = Math.max(10, ((endMin - topMin) / 60) * 100);
                      const duration = Math.max(30, Math.round((endMin - topMin) / 30) * 30);
                      const timeLabel = `${evStart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${evEnd.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
                      
                      return (
                        <div key={ev.id} className="absolute left-1 right-1 pointer-events-auto" style={{ top: `${topPct}%`, height: `${heightPct}%` }}>
                          <CalendarEventChip
                            title={ev.title}
                            timeLabel={timeLabel}
                            tags={ev.tags}
                            resizable={false}
                            draggable
                            onClick={() => {
                              // Open edit dialog
                              setEditingEvent(ev);
                            }}
                            onDoubleClick={() => {
                              // Quick edit on double click
                              setEditingEvent(ev);
                            }}
                            onDragStart={(e) => {
                              const mouseMin = minutesFromClientY(e.clientY);
                              const startRounded = Math.round(topMin / 30) * 30;
                              const offset = mouseMin - startRounded;
                              setMoving({ id: ev.id, dayIdx: dayIndex, durationMin: duration, offsetMin: offset, startMin: startRounded });
                            }}
                          />
                        </div>
                      );
                    })}
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Moving preview overlay */}
          {moving && (
            <div
              className="absolute pointer-events-none bg-purple-500/15 dark:bg-purple-400/20"
              style={{
                left: `${(moving.dayIdx / 7) * 100}%`,
                width: `${(1 / 7) * 100}%`,
                top: `${(moving.startMin / (24 * 60)) * 100}%`,
                height: `${(moving.durationMin / (24 * 60)) * 100}%`,
              }}
            />
          )}

          {/* NOW line across today's column */}
          {isSameWeek && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ top: `${pct(minutesSinceMidnight)}%` }}
            >
              <div
                className="absolute"
                style={{
                  left: `${(todayIdx / 7) * 100}%`,
                  width: `${(1 / 7) * 100}%`,
                  height: "2px",
                  background: "rgba(244,63,94,0.8)"
                }}
              />
            </div>
          )}

          {/* Pulse marker when jumping */}
          {isSameWeek && pulseAt !== null && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ top: `${pct(pulseAt)}%` }}
            >
              <div
                className="absolute"
                style={{ left: `${(todayIdx / 7) * 100}%`, width: `${(1 / 7) * 100}%` }}
              >
                <div className="relative h-3">
                  <div className="absolute left-2 w-3 h-3 rounded-full bg-rose-500/80 animate-ping" />
                  <div className="absolute left-2 w-3 h-3 rounded-full bg-rose-500/80" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Now Button */}
      <FloatingNowButton
        show={isSameWeek && !nowVisible}
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

export default CalendarGridWeek;
