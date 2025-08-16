import React, { useMemo, useState, useRef } from "react";
import CalendarToolbar from "../components/CalendarToolbar";
import CalendarGridWeek, { CalendarGridWeekHandle } from "../components/CalendarGridWeek";
import CalendarGridMonth from "../components/CalendarGridMonth";
import CalendarGridDay, { CalendarGridDayHandle } from "../components/CalendarGridDay";
import QuickScheduleDialog from "../components/QuickScheduleDialog";
import { useCalendarStore } from "../store/useCalendarStore";
import { useTasksStore } from "@/features/tasks/store/useTasksStore";
import NowBar from "@/features/calendar/components/NowBar";
import TaskEditDialog from "../../tasks/components/TaskEditDialog";

type Mode = "day" | "week" | "month";

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday=0
  x.setDate(x.getDate() - day);
  x.setHours(0,0,0,0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x;
}

export default function CalendarView() {
  const [mode, setMode] = useState<Mode>("week");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [slotMin, setSlotMin] = useState<number>(15); // minute precision for Day view

  const dayRef  = useRef<CalendarGridDayHandle>(null);
  const weekRef = useRef<CalendarGridWeekHandle>(null);

  // Debug logging
  console.log('CalendarView rendering with mode:', mode);
  console.log('Anchor date:', anchor);

  const events = useCalendarStore(s => s.events);
  const addEvent = useCalendarStore(s => s.addEvent);
  const updateEvent = useCalendarStore(s => s.updateEvent);
  const deleteEvent = useCalendarStore(s => s.deleteEvent);
  const updateTask = useTasksStore(s => s.updateTask);
  const deleteTask = useTasksStore(s => s.deleteTask);
  const tasks = useTasksStore(s => Object.values(s.tasks));

  // Debug logging
  console.log('Calendar events:', events);
  console.log('Tasks:', tasks);
  const unscheduled = useMemo(
    () => tasks.filter(t => !t.scheduled && t.status !== "done"),
    [tasks]
  );

  const weekStart  = useMemo(() => startOfWeek(anchor), [anchor]);
  const monthStart = useMemo(() => startOfMonth(anchor), [anchor]);
  const day        = anchor;

  // Additional debug logging
  console.log('Week start:', weekStart);
  console.log('Month start:', monthStart);
  console.log('Day:', day);
  console.log('Component render complete');

  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgDefaultTitle, setDlgDefaultTitle] = useState("");
  const [dlgTaskId, setDlgTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);

  const handleEditTask = (task: any) => {
    setEditingTask(task);
  };

  const handleSaveTask = (updatedTask: Partial<any>) => {
    updateTask(updatedTask.id!, updatedTask);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setEditingTask(null);
  };

  const openDialog = (title: string, start: Date, end: Date, fromTaskId?: string | null) => {
    setDlgDefaultTitle(title);
    setDlgTaskId(fromTaskId || null);
    setDlgOpen(true);
    // We'll store the start/end in a closure by passing them through onCreate below.
    (window as any).__tmpCreateRange = { start, end };
  };

  const onCreate = ({ title }: { title: string }) => {
    const r = (window as any).__tmpCreateRange as { start: Date; end: Date };
    if (!r) return setDlgOpen(false);
    const ev = addEvent({
      title,
      start: r.start.toISOString(),
      end:   r.end.toISOString(),
      source: dlgTaskId ? "task_block" : "manual",
      linkedTaskId: dlgTaskId || undefined,
    });
    if (dlgTaskId) {
      updateTask(dlgTaskId, { scheduled: ev.start, dueDate: ev.end });
    }
    setDlgOpen(false);
    setDlgTaskId(null);
    (window as any).__tmpCreateRange = null;
  };

  const goToday = () => setAnchor(new Date());
  const goPrev  = () => setAnchor(a => mode === "day" ? addDays(a, -1) : (mode === "week" ? addDays(a, -7) : new Date(a.getFullYear(), a.getMonth() - 1, 1)));
  const goNext  = () => setAnchor(a => mode === "day" ? addDays(a,  1) : (mode === "week" ? addDays(a,  7) : new Date(a.getFullYear(), a.getMonth() + 1, 1)));

  return (
    <div className="rounded-2xl border bg-background/60 overflow-hidden">
      <div style={{ padding: '20px', background: 'var(--bg-1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Calendar View</h1>
        <p style={{ marginBottom: '20px' }}>Mode: {mode}, Date: {anchor.toLocaleDateString()}</p>
        <p style={{ marginBottom: '20px' }}>Events: {events.length}, Tasks: {tasks.length}</p>
      </div>
      <CalendarToolbar
        mode={mode}
        onModeChange={setMode}
        anchorDate={anchor}
        onToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
        slotMin={slotMin}
        onSlotMinChange={setSlotMin}
        onJumpToNow={() => {
          if (mode === "day") dayRef.current?.scrollToNow();
          else if (mode === "week") weekRef.current?.scrollToNow();
          else {
            // month mode: just go to today
            setAnchor(new Date());
          }
        }}
      />

      <div className="p-4 pt-3">
        <NowBar stepMin={slotMin} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Unscheduled tasks to drag in */}
        <aside className="lg:col-span-3 space-y-3">
          <h4 className="text-sm font-medium opacity-80">Unscheduled Tasks</h4>
          {unscheduled.length ? (
            <div className="flex flex-col gap-2">
              {unscheduled.slice(0, 50).map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <button
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData("application/x-task-id", t.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="flex-1 text-left rounded-xl border bg-background px-3 py-2 hover:bg-accent/40"
                    title="Drag onto the calendar"
                  >
                    <div className="text-sm font-medium">{t.title}</div>
                    {t.priority && <div className="text-xs opacity-70">Priority: {t.priority}</div>}
                  </button>
                  <button
                    onClick={() => handleEditTask(t)}
                    className="p-2 rounded-lg border hover:bg-accent/20"
                    title="Edit task"
                  >
                    ✏️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-background/70 p-4 text-sm opacity-70">All caught up 🎉</div>
          )}
        </aside>

        <main className="lg:col-span-9">
          <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-2)', borderRadius: '8px' }}>
            <h3>Calendar Components</h3>
            <p>Events count: {events.length}</p>
            <p>Tasks count: {tasks.length}</p>
            <p>Current mode: {mode}</p>
          </div>
          {mode === "day" && (
            <CalendarGridDay
              ref={dayRef}                 // NEW
              day={day}
              events={events}
              stepMin={slotMin}
              onDragCreate={(start, end) => openDialog("New event", start, end)}
              onDropTask={(taskId, mins) => {
                const start = new Date(day); start.setHours(0,0,0,0); start.setMinutes(mins);
                const end = new Date(start); end.setMinutes(start.getMinutes() + 60);
                const t = tasks.find(x => x.id === taskId);
                openDialog(t?.title || "Task block", start, end, taskId);
              }}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
            />
          )}

          {mode === "week" && (
            <CalendarGridWeek
              ref={weekRef}                // NEW
              weekStart={weekStart}
              events={events}
              onDragCreate={(start, end) => openDialog("New event", start, end)}
              onDropTask={(taskId, date, minutesFromMidnight) => {
                const start = new Date(date);
                start.setHours(0,0,0,0);
                start.setMinutes(minutesFromMidnight);
                const end = new Date(start);
                end.setMinutes(start.getMinutes() + 60);
                const t = tasks.find(x => x.id === taskId);
                openDialog(t?.title || "Task block", start, end, taskId);
              }}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
            />
          )}

          {mode === "month" && (
            <CalendarGridMonth
              monthStart={monthStart}
              events={events}
              onClickDay={(d) => {
                const start = new Date(d); start.setHours(9,0,0,0);
                const end = new Date(d);   end.setHours(10,0,0,0);
                openDialog("New event", start, end);
              }}
              onDropTask={(taskId, d) => {
                const start = new Date(d); start.setHours(9,0,0,0);
                const end = new Date(d);   end.setHours(10,0,0,0);
                const t = tasks.find(x => x.id === taskId);
                openDialog(t?.title || "Task block", start, end, taskId);
              }}
            />
          )}
        </main>
      </div>

      {/* Dialog uses title only here; times come from temp range */}
      <QuickScheduleDialog
        open={dlgOpen}
        onClose={() => setDlgOpen(false)}
        defaultTitle={dlgDefaultTitle}
        onCreate={({ title, startISO, endISO }) => {
          const start = new Date(startISO);
          const end = new Date(endISO);
          (window as any).__tmpCreateRange = { start, end };
          onCreate({ title });
        }}
      />
      
      {/* Debug info */}
      <div style={{ padding: '20px', background: 'var(--bg-3)', fontSize: '12px' }}>
        <h4>Debug Info:</h4>
        <pre>{JSON.stringify({ mode, anchor: anchor.toISOString(), eventsCount: events.length, tasksCount: tasks.length, weekStart: weekStart.toISOString(), monthStart: monthStart.toISOString() }, null, 2)}</pre>
        <h4>Sample Events:</h4>
        <pre>{JSON.stringify(events.slice(0, 3), null, 2)}</pre>
      </div>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
