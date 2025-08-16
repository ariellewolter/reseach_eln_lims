import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Calendar, Clock, Tag, Flag, List } from "lucide-react";
import { Task } from "@research/types";

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskEditDialog({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete
}: TaskEditDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("todo");
  const [priority, setPriority] = useState<string>("med");
  const [scheduled, setScheduled] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setScheduled(task.scheduled || "");
      setDueDate(task.dueDate || "");
      setTags(task.tags || []);
    }
  }, [task]);

  const handleSave = () => {
    if (!task || !title.trim()) return;
    
    onSave({
      id: task.id,
      title: title.trim(),
      description: description.trim() || undefined,
      status: status as any,
      priority: priority as any,
      scheduled: scheduled || undefined,
      dueDate: dueDate || undefined,
      tags
    });
    onClose();
  };

  const handleDelete = () => {
    if (!task || !onDelete) return;
    onDelete(task.id);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg border p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/20 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded bg-background"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded bg-background"
              placeholder="Task description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded bg-background"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border rounded bg-background"
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Scheduled
              </label>
              <input
                type="datetime-local"
                value={scheduled ? scheduled.slice(0, 16) : ""}
                onChange={(e) => setScheduled(e.target.value ? e.target.value + ":00" : "")}
                className="w-full p-2 border rounded bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate ? dueDate.slice(0, 16) : ""}
                onChange={(e) => setDueDate(e.target.value ? e.target.value + ":00" : "")}
                className="w-full p-2 border rounded bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="flex-1 p-2 border rounded bg-background"
                placeholder="Add tag"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 border rounded hover:bg-accent/20"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-accent/20 rounded text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:bg-accent/40 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500/10 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
