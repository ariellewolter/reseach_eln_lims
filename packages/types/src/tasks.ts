export type TaskStatus = "todo" | "in_progress" | "blocked" | "done" | "cancelled";
export type TaskPriority = "low" | "med" | "high" | "urgent";
export type TaskContext = "lab" | "writing" | "reading" | "analysis" | "admin" | string;

export type TaskRecurrence = {
  rule: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  rrule?: string;
  endDate?: string;
};

export type TaskReminder = {
  at: string;
  method: "inapp" | "email" | "system";
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startDate?: string;
  scheduled?: string;
  estimateMin?: number;
  spentMin?: number;
  recurrence?: TaskRecurrence;
  reminders?: TaskReminder[];
  tags: string[];
  links: string[];
  backlinks?: string[];
  projectId?: string;
  experimentId?: string;
  context?: TaskContext;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archived?: boolean;
  timerStartTime?: string;
};

export type CalendarEventSource = "manual" | "task_block" | "imported_ics" | "from_selection";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  source: CalendarEventSource;
  linkedTaskId?: string;
  tags: string[];
  recurrence?: TaskRecurrence;
  reminders?: TaskReminder[];
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type SavedView = {
  id: string;
  name: string;
  filters: TaskFilters;
  sortBy: string;
  sortOrder: "asc" | "desc";
  viewType: "list" | "kanban" | "calendar";
  createdAt: string;
};

export type TaskFilters = {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  tags?: string[];
  projects?: string[];
  experiments?: string[];
  context?: TaskContext[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
  archived?: boolean;
};

export type CalendarViewType = "day" | "3day" | "week" | "month";

export type TimeBlock = {
  start: string;
  end: string;
  duration: number; // in minutes
};

export type QuickAddParseResult = {
  title: string;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  tags: string[];
  links: string[];
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
  reminderLeadTime?: number; // in minutes
  estimateMin?: number;
  context?: TaskContext;
};
