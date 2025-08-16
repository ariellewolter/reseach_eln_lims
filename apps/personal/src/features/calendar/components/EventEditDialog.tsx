import React, { useState, useEffect } from "react";
import { CalendarEvent } from "@research/types";
import { X, Save, Trash2 } from "lucide-react";

interface EventEditDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export default function EventEditDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventEditDialogProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        tags: event.tags,
      });
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...event,
      ...formData,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      onDelete(event.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Event</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-accent/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input
                type="datetime-local"
                value={formData.start ? new Date(formData.start).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value).toISOString() })}
                className="w-full rounded-lg border bg-background px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <input
                type="datetime-local"
                value={formData.end ? new Date(formData.end).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value).toISOString() })}
                className="w-full rounded-lg border bg-background px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay || false}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="allDay" className="text-sm">All day event</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags?.join(", ") || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
              })}
              className="w-full rounded-lg border bg-background px-3 py-2"
              placeholder="lab, meeting, research"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 hover:bg-accent/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
