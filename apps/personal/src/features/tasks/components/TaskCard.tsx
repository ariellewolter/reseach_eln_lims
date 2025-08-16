import React from "react";
import { AlarmClock, Calendar, Flag, Play, Square, Edit } from "lucide-react";
import { useTasksStore } from "../store/useTasksStore";
import { Task } from "@research/types";

const statusStyles: Record<string, string> = {
  todo: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  blocked: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  done: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const prioDot: Record<string, string> = {
  low: "bg-neutral-400",
  med: "bg-blue-400",
  high: "bg-amber-400",
  urgent: "bg-red-400",
};

export default function TaskCard({ task, compact=false, onEdit }: { task: Task; compact?: boolean; onEdit?: (task: Task) => void }) {
  const update = useTasksStore(s => s.updateTask);
  const toggle = () => {
    const next = task.status === "done" ? "todo" : "done";
    update(task.id, { status: next, completedAt: next === "done" ? new Date().toISOString() : undefined });
  };

  const dueLabel = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;

  return (
    <div className={`rounded-xl border bg-card p-3 hover:shadow-sm transition ${compact ? "" : "h-full"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={toggle}
              className={`rounded-md border p-1 hover:bg-accent/50 ${task.status === "done" ? "opacity-70" : ""}`}
              title={task.status === "done" ? "Mark as To-Do" : "Mark Done"}
            >
              {task.status === "done" ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 rotate-90" />}
            </button>
            <div className="font-medium leading-tight flex-1">{task.title}</div>
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="rounded-md border p-1 hover:bg-accent/50 opacity-70 hover:opacity-100"
                title="Edit task"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>

          {task.description && (
            <p className="text-sm opacity-70 line-clamp-2">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip className={statusStyles[task.status || "todo"]}>{(task.status || "todo").replace("_"," ")}</Chip>
            {task.priority && (
              <Chip>
                <span className={`inline-block w-2 h-2 rounded-full ${prioDot[task.priority] || prioDot.med} mr-1`} />
                <Flag className="w-3 h-3 mr-1" /> {task.priority}
              </Chip>
            )}
            {dueLabel && (
              <Chip><Calendar className="w-3 h-3 mr-1" /> {dueLabel}</Chip>
            )}
            {typeof task.spentMin === "number" && task.spentMin > 0 && (
              <Chip><AlarmClock className="w-3 h-3 mr-1" /> {Math.round(task.spentMin)}m</Chip>
            )}
            {(task.tags || []).slice(0, 3).map((t: string) => (
              <Chip key={t} className="bg-neutral-500/10 text-neutral-300 border-neutral-500/20">#{t}</Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children, className=""
}: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center text-xs rounded-md border px-2 py-1 ${className}`}>
      {children}
    </span>
  );
}
