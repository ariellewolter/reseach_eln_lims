import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus, TaskPriority, TaskFilters, SavedView } from '@research/types';

interface TasksState {
  tasks: Task[];
  savedViews: SavedView[];
  activeFilters: TaskFilters;
  activeView: 'list' | 'kanban' | 'calendar';
  activeSort: { field: string; order: 'asc' | 'desc' };
  selectedTaskIds: string[];
  activeTimerId: string | null;
  
  // Actions
  addTask: (input: Partial<Task>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTimer: (id: string) => void;
  completeTask: (id: string) => void;
  batchUpdate: (ids: string[], patch: Partial<Task>) => void;
  archiveTasks: (ids: string[]) => void;
  
  // Filters and views
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setActiveView: (view: 'list' | 'kanban' | 'calendar') => void;
  setSort: (field: string, order: 'asc' | 'desc') => void;
  
  // Saved views
  saveView: (name: string) => void;
  loadView: (viewId: string) => void;
  deleteView: (viewId: string) => void;
  
  // Selection
  selectTask: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Computed getters
  getFilteredTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getBacklinks: (id: string) => string[];
  getTasksByTag: (tag: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
}

const defaultFilters: TaskFilters = {
  archived: false,
  search: '',
};

const defaultSort = { field: 'dueDate', order: 'asc' as const };

// Initialize with empty tasks array - data will be loaded from storage or API
const sampleTasks: Task[] = [];

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: sampleTasks,
      savedViews: [],
      activeFilters: defaultFilters,
      activeView: 'list',
      activeSort: defaultSort,
      selectedTaskIds: [],
      activeTimerId: null,

      addTask: (input) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: input.title || 'Untitled Task',
          description: input.description || '',
          status: input.status || 'todo',
          priority: input.priority || 'med',
          tags: input.tags || [],
          links: input.links || [],
          createdAt: now,
          updatedAt: now,
          ...input,
        };
        
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
        
        return newTask;
      },

      updateTask: (id, patch) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...patch, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          selectedTaskIds: state.selectedTaskIds.filter((taskId) => taskId !== id),
        }));
      },

      toggleTimer: (id) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return;

        if (state.activeTimerId === id) {
          // Stop timer
          const now = new Date();
          const startTime = new Date(task.timerStartTime || task.updatedAt);
          const minutesSpent = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
          
          set((state) => ({
            activeTimerId: null,
            tasks: state.tasks.map((t) =>
              t.id === id
                ? { 
                    ...t, 
                    spentMin: (t.spentMin || 0) + minutesSpent, 
                    updatedAt: now.toISOString(),
                    timerStartTime: undefined // Clear timer start time
                  }
                : t
            ),
          }));
        } else {
          // Start timer
          const now = new Date().toISOString();
          set((state) => ({
            activeTimerId: id,
            tasks: state.tasks.map((t) =>
              t.id === id ? { 
                ...t, 
                updatedAt: now,
                timerStartTime: now // Store actual timer start time
              } : t
            ),
          }));
        }
      },

      completeTask: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'done',
                  completedAt: now,
                  updatedAt: now,
                }
              : task
          ),
        }));
      },

      batchUpdate: (ids, patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            ids.includes(task.id)
              ? { ...task, ...patch, updatedAt: now }
              : task
          ),
        }));
      },

      archiveTasks: (ids) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            ids.includes(task.id)
              ? { ...task, archived: true, updatedAt: now }
              : task
          ),
          selectedTaskIds: [],
        }));
      },

      setFilters: (filters) => {
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ activeFilters: defaultFilters });
      },

      setActiveView: (view) => {
        set({ activeView: view });
      },

      setSort: (field, order) => {
        set({ activeSort: { field, order } });
      },

      saveView: (name) => {
        const state = get();
        const newView: SavedView = {
          id: crypto.randomUUID(),
          name,
          filters: state.activeFilters,
          sortBy: state.activeSort.field,
          sortOrder: state.activeSort.order,
          viewType: state.activeView,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          savedViews: [...state.savedViews, newView],
        }));
      },

      loadView: (viewId) => {
        const state = get();
        const view = state.savedViews.find((v) => v.id === viewId);
        if (view) {
          set({
            activeFilters: view.filters,
            activeSort: { field: view.sortBy, order: view.sortOrder },
            activeView: view.viewType,
          });
        }
      },

      deleteView: (viewId) => {
        set((state) => ({
          savedViews: state.savedViews.filter((v) => v.id !== viewId),
        }));
      },

      selectTask: (id) => {
        set((state) => ({
          selectedTaskIds: state.selectedTaskIds.includes(id)
            ? state.selectedTaskIds.filter((taskId) => taskId !== id)
            : [...state.selectedTaskIds, id],
        }));
      },

      selectMultiple: (ids) => {
        set({ selectedTaskIds: ids });
      },

      clearSelection: () => {
        set({ selectedTaskIds: [] });
      },

      getFilteredTasks: () => {
        const state = get();
        let filtered = state.tasks.filter((task) => !task.archived);

        // Apply filters
        if (state.activeFilters.status?.length) {
          filtered = filtered.filter((task) =>
            state.activeFilters.status!.includes(task.status)
          );
        }

        if (state.activeFilters.priority?.length) {
          filtered = filtered.filter((task) =>
            state.activeFilters.priority!.includes(task.priority)
          );
        }

        if (state.activeFilters.tags?.length) {
          filtered = filtered.filter((task) =>
            state.activeFilters.tags!.some((tag) => task.tags.includes(tag))
          );
        }

        if (state.activeFilters.projects?.length) {
          filtered = filtered.filter((task) =>
            task.projectId && state.activeFilters.projects!.includes(task.projectId)
          );
        }

        if (state.activeFilters.search) {
          const searchLower = state.activeFilters.search.toLowerCase();
          filtered = filtered.filter(
            (task) =>
              task.title.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower)
          );
        }

        if (state.activeFilters.dateRange?.start) {
          filtered = filtered.filter(
            (task) => task.dueDate && task.dueDate >= state.activeFilters.dateRange!.start!
          );
        }

        if (state.activeFilters.dateRange?.end) {
          filtered = filtered.filter(
            (task) => task.dueDate && task.dueDate <= state.activeFilters.dateRange!.end!
          );
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[state.activeSort.field as keyof Task];
          const bValue = b[state.activeSort.field as keyof Task];
          
          if (aValue === undefined && bValue === undefined) return 0;
          if (aValue === undefined) return 1;
          if (bValue === undefined) return -1;
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return state.activeSort.order === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return state.activeSort.order === 'asc' ? aValue - bValue : bValue - aValue;
          }
          
          return 0;
        });

        return filtered;
      },

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getBacklinks: (id) => {
        const state = get();
        return state.tasks
          .filter((task) => task.links.includes(id))
          .map((task) => task.id);
      },

      getTasksByTag: (tag) => {
        return get().tasks.filter((task) => task.tags.includes(tag));
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId);
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(
          (task) =>
            task.dueDate &&
            task.status !== 'done' &&
            task.status !== 'cancelled' &&
            new Date(task.dueDate) < now
        );
      },

      getTodayTasks: () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        return get().tasks.filter(
          (task) =>
            task.dueDate?.startsWith(todayStr) &&
            task.status !== 'done' &&
            task.status !== 'cancelled'
        );
      },

      getUpcomingTasks: () => {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return get().tasks.filter(
          (task) =>
            task.dueDate &&
            task.status !== 'done' &&
            task.status !== 'cancelled' &&
            new Date(task.dueDate) > now &&
            new Date(task.dueDate) <= nextWeek
        );
      },
    }),
    {
      name: 'tasks-store',
      partialize: (state) => ({
        tasks: state.tasks,
        savedViews: state.savedViews,
      }),
    }
  )
);
