import { useState, useEffect } from 'react';
import { Note, TableDoc, Project, Task } from '@research/types';

// Dashboard data structure
export interface DashboardData {
  recentNotes: Note[];
  recentTables: TableDoc[];
  projects: Project[];
  todayTasks: Task[];
  stats: {
    totalNotes: number;
    totalTables: number;
    activeProjects: number;
    weeklyActivity: number;
  };
}

// Mock API functions - replace with real API calls
const mockApi = {
  getNotes: async (limit: number = 4): Promise<Note[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: '1', title: 'Meeting Notes - Project Alpha', markdown: '', userId: 'user1', projectId: undefined, updatedAt: '2025-01-10T14:30:00Z', createdAt: '2025-01-10T14:30:00Z' },
      { id: '2', title: 'Literature Review - Synthesis Methods', markdown: '', userId: 'user1', projectId: undefined, updatedAt: '2025-01-09T16:45:00Z', createdAt: '2025-01-09T16:45:00Z' },
      { id: '3', title: 'Experiment Log - Day 1', markdown: '', userId: 'user1', projectId: undefined, updatedAt: '2025-01-09T11:20:00Z', createdAt: '2025-01-09T11:20:00Z' },
      { id: '4', title: 'Protocol Optimization Ideas', markdown: '', userId: 'user1', projectId: undefined, updatedAt: '2025-01-08T09:15:00Z', createdAt: '2025-01-08T09:15:00Z' }
    ].slice(0, limit);
  },

  getTables: async (limit: number = 3): Promise<TableDoc[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: '5', title: 'Compound Activity Data', data: [['Sample', 'Result']], userId: 'user1', updatedAt: '2025-01-10T13:00:00Z', createdAt: '2025-01-10T13:00:00Z', columns: [{ id: 'col1', type: 'text', width: 120, align: 'left' }, { id: 'col2', type: 'text', width: 120, align: 'left' }] },
      { id: '6', title: 'Equipment Schedule', data: [['Equipment', 'Time']], userId: 'user1', updatedAt: '2025-01-09T17:30:00Z', createdAt: '2025-01-09T17:30:00Z', columns: [{ id: 'col1', type: 'text', width: 120, align: 'left' }, { id: 'col2', type: 'text', width: 120, align: 'left' }] },
      { id: '7', title: 'Budget Tracking Q1', data: [['Category', 'Amount']], userId: 'user1', updatedAt: '2025-01-08T10:45:00Z', createdAt: '2025-01-08T10:45:00Z', columns: [{ id: 'col1', type: 'text', width: 120, align: 'left' }, { id: 'col2', type: 'text', width: 120, align: 'left' }] }
    ].slice(0, limit);
  },

  getProjects: async (): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 'p1', title: 'Project Alpha', description: 'Investigating expression patterns of stress response genes', ownerId: 'user1' },
      { id: 'p2', title: 'Literature Survey', description: 'Comprehensive review of recent publications', ownerId: 'user1' },
      { id: 'p3', title: 'Method Development', description: 'Optimizing purification protocol for recombinant proteins', ownerId: 'user1' }
    ];
  },

  getTasks: async (): Promise<Task[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 't1', title: 'Review synthesis protocol', status: 'todo', priority: 'med', tags: [], links: [], createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z' },
      { id: 't2', title: 'Update experiment log', status: 'in_progress', priority: 'med', tags: [], links: [], createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z' },
      { id: 't3', title: 'Prepare presentation slides', status: 'done', priority: 'med', tags: [], links: [], createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z' }
    ];
  },

  getStats: async (): Promise<DashboardData['stats']> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      totalNotes: 34,
      totalTables: 12,
      activeProjects: 3,
      weeklyActivity: 18
    };
  }
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [notes, tables, projects, tasks, stats] = await Promise.all([
          mockApi.getNotes(4),
          mockApi.getTables(3),
          mockApi.getProjects(),
          mockApi.getTasks(),
          mockApi.getStats()
        ]);

        setData({
          recentNotes: notes,
          recentTables: tables,
          projects,
          todayTasks: tasks,
          stats
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Refresh function for manual updates
  const refresh = async () => {
    setLoading(true);
    try {
      const [notes, tables, projects, tasks, stats] = await Promise.all([
        mockApi.getNotes(4),
        mockApi.getTables(3),
        mockApi.getProjects(),
        mockApi.getTasks(),
        mockApi.getStats()
      ]);

      setData({
        recentNotes: notes,
        recentTables: tables,
        projects,
        todayTasks: tasks,
        stats
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refresh
  };
}

// Individual data hooks for more granular control
export function useNotes(limit: number = 4) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getNotes(limit);
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [limit]);

  return { data: notes, loading, error };
}

export function useTables(limit: number = 3) {
  const [tables, setTables] = useState<TableDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getTables(limit);
        setTables(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tables');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [limit]);

  return { data: tables, loading, error };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getProjects();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { data: projects, loading, error };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { data: tasks, loading, error };
}
