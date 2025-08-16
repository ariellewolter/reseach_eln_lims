import React, { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Target, ListChecks, Plus } from "lucide-react";

import { useCalendarStore } from "../store/useCalendarStore";
import { useTasksStore } from "@/features/tasks/store/useTasksStore";

import CalendarGridDay, { CalendarGridDayHandle } from "@/features/calendar/components/CalendarGridDay";
import NowBar from "@/features/calendar/components/NowBar";
import quickWhen from "@/features/tasks/utils/quickWhen";

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d: Date)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }

export default function DayFocusView() {
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [slotMin, setSlotMin] = useState<number>(15);
  const dayRef = useRef<CalendarGridDayHandle>(null);

  const events = useCalendarStore(s => s.events);
  const dayStart = useMemo(() => startOfDay(anchor), [anchor]);
  const dayEnd   = useMemo(() => endOfDay(anchor), [anchor]);

  const dayEvents = useMemo(() => {
    return events.filter(ev => {
      const s = new Date(ev.start), e = new Date(ev.end);
      return s <= dayEnd && e >= dayStart;
    }).sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }, [events, dayStart, dayEnd]);

  const tasks = useTasksStore(s => s.tasks);

  // Tasks scheduled for this day OR due this day
  const agendaTasks = useMemo(() => {
    return tasks.filter(t => {
      const s = t.scheduled ? new Date(t.scheduled) : null;
      const d = t.dueDate ? new Date(t.dueDate) : null;
      const within = (ts: Date | null) => ts && ts >= dayStart && ts <= dayEnd;
      return within(s) || within(d);
    }).sort((a, b) => {
      const aTime = a.scheduled ? +new Date(a.scheduled) : 9e15;
      const bTime = b.scheduled ? +new Date(b.scheduled) : 9e15;
      return aTime - bTime;
    });
  }, [tasks, dayStart, dayEnd]);

  const addEvent = useCalendarStore(s => s.addEvent);
  const addTask  = useTasksStore(s => s.addTask);
  const updateTask = useTasksStore(s => s.updateTask);
  const updateEvent = useCalendarStore(s => s.updateEvent);
  const deleteEvent = useCalendarStore(s => s.deleteEvent);

  // quick capture input
  const [capture, setCapture] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskDescription, setEditingTaskDescription] = useState("");
  const [editingTaskScheduled, setEditingTaskScheduled] = useState("");
  const [editingTaskDueDate, setEditingTaskDueDate] = useState("");
  const [editingTaskTags, setEditingTaskTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [editingTaskPriority, setEditingTaskPriority] = useState<string>("med");
  const [editingTaskStatus, setEditingTaskStatus] = useState<string>("todo");

  const createQuickTask = () => {
    const raw = capture.trim();
    if (!raw) return;
    
    // Use quickWhen to parse natural language time expressions
    const { cleanTitle, when } = quickWhen(raw, slotMin);
    
    // Default to current day if no specific time is parsed
    const scheduled = when.scheduled || new Date(dayStart).toISOString();
    const due = when.dueDate || new Date(Math.min(+dayEnd, +new Date(scheduled) + 60*60*1000)).toISOString();
    
    addTask({ 
      title: cleanTitle || "New Task", 
      status: "todo", 
      scheduled, 
      dueDate: due,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setCapture("");
  };

  const startEditingTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskDescription(task.description || "");
    setEditingTaskScheduled(task.scheduled || "");
    setEditingTaskDueDate(task.dueDate || "");
    setEditingTaskTags(task.tags || []);
    setEditingTaskPriority(task.priority || "med");
    setEditingTaskStatus(task.status || "todo");
  };

  const saveEditedTask = () => {
    if (editingTaskId && editingTaskTitle.trim()) {
      updateTask(editingTaskId, { 
        title: editingTaskTitle.trim(),
        description: editingTaskDescription.trim() || undefined,
        scheduled: editingTaskScheduled || undefined,
        dueDate: editingTaskDueDate || undefined,
        tags: editingTaskTags,
        priority: editingTaskPriority as any,
        status: editingTaskStatus as any
      });
      setEditingTaskId(null);
      setEditingTaskTitle("");
      setEditingTaskDescription("");
      setEditingTaskScheduled("");
      setEditingTaskDueDate("");
      setEditingTaskTags([]);
      setEditingTaskPriority("med");
      setEditingTaskStatus("todo");
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
    setEditingTaskDescription("");
    setEditingTaskScheduled("");
    setEditingTaskDueDate("");
    setEditingTaskTags([]);
    setEditingTaskPriority("med");
    setEditingTaskStatus("todo");
  };

  const addTag = () => {
    if (newTag.trim() && !editingTaskTags.includes(newTag.trim())) {
      setEditingTaskTags([...editingTaskTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditingTaskTags(editingTaskTags.filter(tag => tag !== tagToRemove));
  };

  const counts = useMemo(() => {
    const overdue = agendaTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
    const done = agendaTasks.filter(t => t.status === "done").length;
    return { total: agendaTasks.length, overdue, done };
  }, [agendaTasks]);

  const isToday = new Date().toDateString() === anchor.toDateString();

  return (
    <div className="min-h-screen w-full">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-fuchsia-500/15 to-indigo-600/20 blur-2xl -z-10" />
        <div className="px-6 lg:px-10 py-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setAnchor(a => addDays(a, -1))} className="rounded-lg border px-2 py-1 hover:bg-accent/50"><ChevronLeft className="w-4 h-4"/></button>
              <button onClick={() => setAnchor(a => addDays(a,  1))} className="rounded-lg border px-2 py-1 hover:bg-accent/50"><ChevronRight className="w-4 h-4"/></button>
              <button onClick={() => setAnchor(new Date())} className="rounded-lg border px-3 py-1 text-sm hover:bg-accent/50">Today</button>

              <div className="ml-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 opacity-70" />
                <input
                  type="date"
                  value={anchor.toISOString().slice(0,10)}
                  onChange={(e) => setAnchor(new Date(e.target.value + "T12:00:00"))}
                  className="rounded-lg border bg-background/60 px-2 py-1"
                />
              </div>

              <div className="ml-3 text-xl md:text-2xl font-semibold tracking-tight">
                {anchor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="hidden md:flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 opacity-70"/>
                <select
                  value={slotMin}
                  onChange={(e) => setSlotMin(parseInt(e.target.value))}
                  className="rounded-lg border bg-background/60 px-2 py-1"
                  title="Minute granularity"
                >
                  {[5,10,15,30,60].map(n => <option key={n} value={n}>{n} min</option>)}
                </select>
              </label>
              <button
                onClick={() => dayRef.current?.scrollToNow()}
                className="rounded-xl border px-3 py-1.5 text-sm inline-flex items-center gap-2 hover:bg-accent/50"
                title="Jump to current time"
              >
                <Target className="w-4 h-4" /> Now
              </button>
            </div>
          </div>

          <NowBar stepMin={slotMin} />
        </div>
      </div>

      {/* Body: Day grid + Focus pane */}
      <div className="px-6 lg:px-10 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        <main className="xl:col-span-8">
          <CalendarGridDay
            ref={dayRef}
            day={anchor}
            events={dayEvents}
            stepMin={slotMin}
            onDragCreate={(start, end) => {
              addEvent({ 
                title: "New event", 
                start: start.toISOString(), 
                end: end.toISOString(), 
                source: "manual",
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }}
            onDropTask={(taskId, minutesFromMidnight) => {
              const start = new Date(dayStart); start.setMinutes(minutesFromMidnight);
              const end = new Date(start); end.setMinutes(start.getMinutes() + 60);
              updateTask(taskId, { scheduled: start.toISOString(), dueDate: end.toISOString() });
            }}
            updateEvent={updateEvent}
            deleteEvent={deleteEvent}
          />
        </main>

        <aside className="xl:col-span-4 space-y-4">
          {/* Capture */}
          <div className="rounded-2xl border bg-background/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-4 h-4 opacity-70" />
              <div className="font-medium">
                {editingTaskId ? "Edit task" : "Quick capture for this day"}
              </div>
            </div>
            
            {editingTaskId ? (
              // Edit mode
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEditedTask();
                      if (e.key === "Escape") cancelEditing();
                    }}
                    placeholder="Task title"
                    className="w-full rounded-lg border bg-background/60 px-3 py-2 text-sm"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingTaskDescription}
                    onChange={(e) => setEditingTaskDescription(e.target.value)}
                    placeholder="Task description (optional)"
                    className="w-full rounded-lg border bg-background/60 px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Scheduled</label>
                    <input
                      type="datetime-local"
                      value={editingTaskScheduled ? editingTaskScheduled.slice(0, 16) : ""}
                      onChange={(e) => setEditingTaskScheduled(e.target.value ? e.target.value + ":00" : "")}
                      className="w-full rounded-lg border bg-background/60 px-2 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      type="datetime-local"
                      value={editingTaskDueDate ? editingTaskDueDate.slice(0, 16) : ""}
                      onChange={(e) => setEditingTaskDueDate(e.target.value ? e.target.value + ":00" : "")}
                      className="w-full rounded-lg border bg-background/60 px-2 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={editingTaskPriority}
                      onChange={(e) => setEditingTaskPriority(e.target.value)}
                      className="w-full rounded-lg border bg-background/60 px-2 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="med">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={editingTaskStatus}
                      onChange={(e) => setEditingTaskStatus(e.target.value)}
                      className="w-full rounded-lg border bg-background/60 px-2 py-2 text-sm"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      className="flex-1 rounded-lg border bg-background/60 px-2 py-2 text-sm"
                      placeholder="Add tag"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 border rounded-lg text-sm hover:bg-accent/20"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {editingTaskTags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-accent/20 rounded text-sm flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-accent/40 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={saveEditedTask} 
                    className="flex-1 px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/80"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={cancelEditing} 
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-accent/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Create mode
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={capture}
                    onChange={(e) => setCapture(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createQuickTask()}
                    placeholder={`e.g. "write draft now for 25m" or "meeting today 3pm"`}
                    className="flex-1 rounded-lg border bg-background/60 px-3 py-2 text-sm"
                  />
                  <button onClick={createQuickTask} className="rounded-lg border px-3 py-2 text-sm hover:bg-accent/50">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs opacity-60">
                  Examples: <code>now</code>, <code>for 25m</code>, <code>in 30m</code>, <code>today 3pm</code>, <code>tmr 9am</code>
                </p>
              </div>
            )}
          </div>

          {/* Agenda */}
          <div className="rounded-2xl border bg-background/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Agenda</div>
              <div className="text-xs opacity-70">
                {counts.overdue ? <span className="mr-2">Overdue: <b>{counts.overdue}</b></span> : null}
                Done: <b>{counts.done}</b> / {counts.total}
              </div>
            </div>
            {agendaTasks.length ? (
              <div className="space-y-2">
                {agendaTasks.map(t => (
                  <AgendaItem 
                    key={t.id} 
                    task={t} 
                    isEditing={editingTaskId === t.id}
                    onToggle={() => {
                      const next = t.status === "done" ? "todo" : "done";
                      updateTask(t.id, { status: next, completedAt: next === "done" ? new Date().toISOString() : undefined });
                    }}
                    onEdit={() => startEditingTask(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-background/70 p-4 text-sm opacity-70">Nothing scheduled for this day.</div>
            )}
          </div>

          {/* Day's Events (compact) */}
          <div className="rounded-2xl border bg-background/60 p-4">
            <div className="font-medium mb-2">Events</div>
            {dayEvents.length ? (
              <div className="space-y-2">
                {dayEvents.map(ev => {
                  const s = new Date(ev.start), e = new Date(ev.end);
                  const label = `${s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
                  return (
                    <div key={ev.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div className="truncate">
                        <div className="text-sm font-medium truncate">{ev.title}</div>
                        <div className="text-xs opacity-70">{label}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Open event edit dialog - you can implement this similar to the calendar views
                            console.log('Edit event:', ev.id);
                          }}
                          className="text-xs rounded-md border px-2 py-1 hover:bg-accent/50"
                          title="Edit event"
                        >
                          ✏️
                        </button>
                        {isToday && (
                          <button
                            onClick={() => dayRef.current?.scrollToNow()}
                            className="text-xs rounded-md border px-2 py-1 hover:bg-accent/50"
                          >
                            Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border bg-background/70 p-4 text-sm opacity-70">No events.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- tiny subcomponent ---------- */
function AgendaItem({ task, onToggle, onEdit, isEditing }: { task: any; onToggle: () => void; onEdit: () => void; isEditing: boolean }) {
  const time = task.scheduled ? new Date(task.scheduled).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : null;
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${isEditing ? 'bg-accent/20 border-accent' : 'bg-background/60'}`}>
      <button
        onClick={onToggle}
        className={`rounded-md border px-2 py-1 text-xs ${task.status==='done' ? 'opacity-60' : 'hover:bg-accent/50'}`}
      >
        {task.status === "done" ? "Undo" : "Done"}
      </button>
      <div className="flex-1">
        <div className="text-sm font-medium">{task.title}</div>
        <div className="text-xs opacity-70">
          {time ? `⏰ ${time}` : "⏳ unscheduled"} {task.dueDate ? ` · due ${new Date(task.dueDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ""}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {task.priority && task.priority !== "med" && (
            <span className={`text-[10px] rounded px-1.5 py-0.5 ${
              task.priority === "urgent" ? "bg-red-500/20 text-red-700 dark:text-red-400" :
              task.priority === "high" ? "bg-orange-500/20 text-orange-700 dark:text-orange-400" :
              "bg-blue-500/20 text-blue-700 dark:text-blue-400"
            }`}>
              {task.priority.toUpperCase()}
            </span>
          )}
          {task.status && task.status !== "todo" && (
            <span className={`text-[10px] rounded px-1.5 py-0.5 ${
              task.status === "done" ? "bg-green-500/20 text-green-700 dark:text-green-400" :
              task.status === "in_progress" ? "bg-blue-500/20 text-blue-700 dark:text-blue-400" :
              task.status === "blocked" ? "bg-red-500/20 text-red-700 dark:text-red-400" :
              "bg-gray-500/20 text-gray-700 dark:text-gray-400"
            }`}>
              {task.status.replace("_", " ")}
            </span>
          )}
        </div>
        {task.tags?.length ? (
          <div className="mt-1 flex gap-1 flex-wrap">
            {task.tags.slice(0, 4).map((t: string) => (
              <span key={t} className="text-[10px] rounded border px-1.5 py-0.5 opacity-80">#{t}</span>
            ))}
          </div>
        ) : null}
      </div>
      <button
        onClick={onEdit}
        className="rounded-md border px-2 py-1 text-xs hover:bg-accent/50"
        title="Edit task"
      >
        ✏️
      </button>
    </div>
  );
}
