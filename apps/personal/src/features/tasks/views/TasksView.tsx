import React, { useMemo, useState } from "react";
import { useTasksStore } from "../store/useTasksStore";
import { useCalendarStore } from "../../calendar/store/useCalendarStore";
import { Calendar, CalendarDays, KanbanSquare, List, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import ViewSwitch from "../components/ViewSwitch";
import TaskCard from "../components/TaskCard";
import TaskEditDialog from "../components/TaskEditDialog";
import CalendarView from "../../calendar/views/CalendarView";
import NowBar from "@/features/calendar/components/NowBar";
import quickWhen from "@/features/tasks/utils/quickWhen";


type ViewMode = "list" | "kanban" | "calendar";

const statusOrder = ["todo", "in_progress", "blocked", "done"] as const;
const statusLabels: Record<(typeof statusOrder)[number], string> = {
  todo: "To-Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

interface TasksViewProps {
  onTaskEdit?: (task: any) => void;
}

export default function TasksView({ onTaskEdit }: TasksViewProps) {
  const tasks = useTasksStore(s => s.tasks);
  const addTask = useTasksStore(s => s.addTask);
  const updateTask = useTasksStore(s => s.updateTask);
  const deleteTask = useTasksStore(s => s.deleteTask);

  const [view, setView] = useState<ViewMode>("list");
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
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

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tasks.length, overdue: 0, today: 0, upcoming: 0 };
    const now = new Date();
    tasks.forEach(t => {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        const isToday = d.toDateString() === now.toDateString();
        if (d < new Date(now.toDateString())) c.overdue += 1;
        else if (isToday) c.today += 1;
        else c.upcoming += 1;
      }
    });
    return c;
  }, [tasks]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return tasks;
    return tasks.filter(t =>
      (t.title || "").toLowerCase().includes(text) ||
      (t.description || "").toLowerCase().includes(text) ||
      (t.tags || []).some((tag: string) => tag.toLowerCase().includes(text))
    );
  }, [q, tasks]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    statusOrder.forEach(s => (g[s] = []));
    filtered.forEach(t => {
      const s = (t.status || "todo") as (typeof statusOrder)[number];
      (g[s] ||= []).push(t);
    });
    return g;
  }, [filtered]);

  // Quick add (title only for speed; you can wire parser later)
  const [quickTitle, setQuickTitle] = useState("");
  const handleQuickAdd = () => {
    const raw = quickTitle.trim();
    if (!raw) return;
    const { cleanTitle, when } = quickWhen(raw, 15);
    addTask({
      title: cleanTitle || "New Task",
      status: "todo",
      scheduled: when.scheduled,
      dueDate: when.dueDate,
      tags: [], 
      links: []
    });
    setQuickTitle("");
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-fuchsia-500/25 to-sky-500/25 blur-2xl -z-10" />
        <div className="px-6 lg:px-10 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Tasks & Calendar</h1>
              <p className="text-sm md:text-base opacity-80">
                Stay organized and move work forward. Linked, fast, and beautiful.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <ViewSwitch
                value={view}
                onChange={setView}
                options={[
                  { value: "list", icon: <List className="w-4 h-4" />, label: "List" },
                  { value: "kanban", icon: <KanbanSquare className="w-4 h-4" />, label: "Kanban" },
                  { value: "calendar", icon: <Calendar className="w-4 h-4" />, label: "Calendar" },
                ]}
              />
            </div>
          </div>

          {/* Stat pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill label="Overdue" count={counts.overdue} tone="danger" />
            <Pill label="Today" count={counts.today} tone="primary" />
            <Pill label="Upcoming" count={counts.upcoming} tone="muted" />
            <Pill label="All" count={counts.all} tone="neutral" />
          </div>

          {/* Quick add + search */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 flex items-center gap-2">
              <div className="flex items-center w-full rounded-xl border px-3 py-2 bg-input">
                <Plus className="w-4 h-4 opacity-70 mr-2" />
                <input
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                  placeholder="Quick add a task (e.g., 'meeting today 3pm for 1h')…"
                  className="flex-1 outline-none bg-transparent"
                />
                <button
                  onClick={handleQuickAdd}
                  className="px-3 py-1 text-sm rounded-lg border hover:bg-accent/50"
                >
                  Add
                </button>
              </div>
              <div className="text-xs opacity-60 ml-2">
                Try: <code>now</code>, <code>for 25m</code>, <code>today 3pm</code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center w-full rounded-xl border px-3 py-2 bg-input">
                <Search className="w-4 h-4 opacity-70 mr-2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tasks, tags, notes…"
                  className="flex-1 outline-none bg-transparent"
                />
              </div>
              <button
                onClick={() => setFiltersOpen(v => !v)}
                className={`shrink-0 rounded-xl border px-3 py-2 hover:bg-accent/50 transition-colors ${
                  filtersOpen ? 'bg-accent border-accent text-accent-foreground' : 'bg-background'
                }`}
                title={filtersOpen ? "Hide filters" : "Show filters"}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="ml-2 text-xs">{filtersOpen ? "Hide" : "Show"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NowBar */}
      <div className="px-6 lg:px-10 py-4">
        <NowBar stepMin={15} />
      </div>

      {/* Body */}
      <div className="px-6 lg:px-10 py-6">
        {/* Mobile view switch */}
        <div className="md:hidden mb-6">
          <ViewSwitch
            value={view}
            onChange={setView}
            options={[
              { value: "list", icon: <List className="w-4 h-4" />, label: "List" },
              { value: "kanban", icon: <KanbanSquare className="w-4 h-4" />, label: "Kanban" },
              { value: "calendar", icon: <Calendar className="w-4 h-4" />, label: "Calendar" },
            ]}
          />
        </div>

        {/* Filters - now inline and collapsible */}
        {filtersOpen && (
          <div className="mb-6 p-4 rounded-2xl border bg-card/60 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Filters</h4>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1 rounded-lg hover:bg-accent/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select label="Status" options={["Any","To-Do","In Progress","Blocked","Done"]} />
              <Select label="Priority" options={["Any","Low","Medium","High","Urgent"]} />
              <Select label="Due" options={["Any","Overdue","Today","This Week","This Month"]} />
              <Select label="Context" options={["Any","Lab","Writing","Reading","Analysis","Admin"]} />
            </div>
            <div className="flex gap-2 pt-4 mt-4 border-t">
              <button className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-accent/50">Apply</button>
              <button className="rounded-lg border px-3 py-2 text-sm hover:bg-accent/50">Reset</button>
            </div>
          </div>
        )}

        {/* Main content - now full width */}
        <main className="w-full">
          {view === "list" && (
            <div className="space-y-8">
              {statusOrder.map((s) => (
                <section key={s}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                      {statusLabels[s]}
                    </h3>
                    <span className="text-xs opacity-60">
                      {(grouped[s] || []).length} item{(grouped[s] || []).length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {(grouped[s] || []).length ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                      {grouped[s].map((t) => (
                        <TaskCard key={t.id} task={t} onEdit={handleEditTask} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState small text="Nothing here yet. Add a task above." />
                  )}
                </section>
              ))}
            </div>
          )}

          {view === "kanban" && (
            <KanbanLike grouped={grouped} onEdit={handleEditTask} />
          )}

          {view === "calendar" && (
            <CalendarView />
          )}
        </main>
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

/* --- small subcomponents (kept local to keep it drop-in) --- */

function Pill({
  label, count, tone
}: { label: string; count: number; tone: "danger"|"primary"|"muted"|"neutral" }) {
  const toneClass =
    tone === "danger"  ? "bg-red-500/15 text-red-400 border-red-500/30" :
    tone === "primary" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
    tone === "muted"   ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                         "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${toneClass}`}>
      <span>{label}</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}



function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="text-sm space-y-1">
      <div className="opacity-70">{label}</div>
      <select className="w-full rounded-lg border bg-input px-3 py-2">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function EmptyState({ text, small=false }: { text: string; small?: boolean }) {
  return (
    <div className={`rounded-xl border bg-card-muted p-6 text-center ${small ? "py-8" : "py-16"}`}>
      <CalendarDays className="w-6 h-6 mx-auto opacity-50 mb-2" />
      <p className="opacity-70">{text}</p>
    </div>
  );
}

function KanbanLike({ grouped, onEdit }: { grouped: Record<string, any[]>; onEdit: (task: any) => void }) {
  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(grouped).map(([status, items]) => (
        <div key={status} className="rounded-2xl border bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold uppercase opacity-70">{statusLabels[status as keyof typeof statusLabels] || status}</div>
            <div className="text-xs opacity-60">{items.length}</div>
          </div>
          <div className="space-y-2">
            {items.length ? items.map((t: any) => <TaskCard key={t.id} task={t} compact onEdit={onEdit} />) : (
              <EmptyState small text="No tasks" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarPlaceholder() {
  // Replace with your full CalendarView when you're ready; this is just a styled placeholder
  return (
    <div className="rounded-2xl border bg-card p-6 text-center">
      <Calendar className="w-6 h-6 mx-auto opacity-50 mb-2" />
      <p className="opacity-70">Calendar view goes here (Week/Month grid). Drag tasks to schedule.</p>
    </div>
  );
}
