import { useCallback } from 'react';
import { useTasksStore } from '../features/tasks/store/useTasksStore';
import { useCalendarStore } from '../features/calendar/store/useCalendarStore';
import { Task, CalendarEvent } from '@research/types';

export interface NotebookBridgeActions {
  // Open tasks/events in notebook panes
  openTaskInPane: (taskId: string, pane: 'left' | 'right') => void;
  openEventInPane: (eventId: string, pane: 'left' | 'right') => void;
  
  // Insert task/event references into active editor
  insertTaskReference: (taskId: string, pane: 'left' | 'right') => void;
  insertEventReference: (eventId: string, pane: 'left' | 'right') => void;
  
  // Create tasks from notebook content
  createTaskFromSelection: (selection: string, pane: 'left' | 'right', noteId?: string) => void;
  
  // Get formatted references for insertion
  getTaskReference: (task: Task) => string;
  getEventReference: (event: CalendarEvent) => string;
}

export const useNotebookBridge = (): NotebookBridgeActions => {
  const getTaskById = useTasksStore((state) => state.getTaskById);
  const addTask = useTasksStore((state) => state.addTask);
  const getEventById = useCalendarStore((state) => state.getEventById);

  const openTaskInPane = useCallback((taskId: string, pane: 'left' | 'right') => {
    const task = getTaskById(taskId);
    if (!task) return;

    // This would integrate with the notebook system to open the task
    // For now, we'll dispatch a custom event that the notebook can listen to
    const event = new CustomEvent('openTaskInPane', {
      detail: { taskId, pane, task }
    });
    window.dispatchEvent(event);
  }, [getTaskById]);

  const openEventInPane = useCallback((eventId: string, pane: 'left' | 'right') => {
    const event = getEventById(eventId);
    if (!event) return;

    // This would integrate with the notebook system to open the event
    const customEvent = new CustomEvent('openEventInPane', {
      detail: { eventId, pane, event }
    });
    window.dispatchEvent(customEvent);
  }, [getEventById]);

  const insertTaskReference = useCallback((taskId: string, pane: 'left' | 'right') => {
    const task = getTaskById(taskId);
    if (!task) return;

    const reference = getTaskReference(task);
    
    // This would integrate with the notebook system to insert text
    const event = new CustomEvent('insertIntoPane', {
      detail: { text: reference, pane }
    });
    window.dispatchEvent(event);
  }, [getTaskById]);

  const insertEventReference = useCallback((eventId: string, pane: 'left' | 'right') => {
    const event = getEventById(eventId);
    if (!event) return;

    const reference = getEventReference(event);
    
    // This would integrate with the notebook system to insert text
    const customEvent = new CustomEvent('insertIntoPane', {
      detail: { text: reference, pane }
    });
    window.dispatchEvent(customEvent);
  }, [getEventById]);

  const createTaskFromSelection = useCallback((selection: string, pane: 'left' | 'right', noteId?: string) => {
    // Create a new task with the selection as title/description
    const task = addTask({
      title: selection.length > 50 ? selection.substring(0, 50) + '...' : selection,
      description: selection.length > 50 ? selection : undefined,
      status: 'todo',
      priority: 'med',
      tags: [],
      links: noteId ? [noteId] : [],
    });

    // Open the task in the specified pane
    openTaskInPane(task.id, pane);
  }, [addTask, openTaskInPane]);

  const getTaskReference = useCallback((task: Task): string => {
    const parts = [`- [ ] ${task.title}`];
    
    if (task.dueDate) {
      parts.push(`(due ${new Date(task.dueDate).toLocaleDateString()})`);
    }
    
    if (task.tags.length > 0) {
      parts.push(`#${task.tags.join(' #')}`);
    }
    
    parts.push(`[[Task:${task.id}]]`);
    
    return parts.join(' ');
  }, []);

  const getEventReference = useCallback((event: CalendarEvent): string => {
    const parts = [`- 📅 ${event.title}`];
    
    if (event.start) {
      parts.push(`(${new Date(event.start).toLocaleDateString()})`);
    }
    
    if (event.tags.length > 0) {
      parts.push(`#${event.tags.join(' #')}`);
    }
    
    parts.push(`[[Event:${event.id}]]`);
    
    return parts.join(' ');
  }, []);

  return {
    openTaskInPane,
    openEventInPane,
    insertTaskReference,
    insertEventReference,
    createTaskFromSelection,
    getTaskReference,
    getEventReference,
  };
};
