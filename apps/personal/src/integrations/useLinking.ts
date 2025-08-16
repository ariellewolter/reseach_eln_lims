import { useMemo } from 'react';
import { useTasksStore } from '../features/tasks/store/useTasksStore';
import { useCalendarStore } from '../features/calendar/store/useCalendarStore';
import { Task, CalendarEvent } from '@research/types';

export const useLinking = () => {
  const tasks = useTasksStore((state) => state.tasks);
  const events = useCalendarStore((state) => state.events);

  // Extract tags from text content
  const extractTags = (text: string): string[] => {
    const tagMatches = text.match(/#[\w-]+/g) || [];
    return tagMatches.map(tag => tag.substring(1));
  };

  // Extract links from text content
  const extractLinks = (text: string): string[] => {
    const linkMatches = text.match(/\[\[([^\]]+)\]\]/g) || [];
    return linkMatches.map(link => link.substring(2, link.length - 2));
  };

  // Get backlinks for a given ID (from tasks and events)
  const getBacklinks = (id: string): Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> => {
    const backlinks: Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> = [];

    // Check tasks
    tasks.forEach(task => {
      if (task.links.includes(id)) {
        backlinks.push({ type: 'task', item: task });
      }
    });

    // Check events
    events.forEach(event => {
      if (event.tags.includes(id)) {
        backlinks.push({ type: 'event', item: event });
      }
    });

    return backlinks;
  };

  // Get related items by tags
  const getRelatedByTags = (tags: string[]): Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> => {
    const related: Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> = [];

    if (tags.length === 0) return related;

    // Check tasks
    tasks.forEach(task => {
      if (task.tags.some(tag => tags.includes(tag))) {
        related.push({ type: 'task', item: task });
      }
    });

    // Check events
    events.forEach(event => {
      if (event.tags.some(tag => tags.includes(tag))) {
        related.push({ type: 'event', item: event });
      }
    });

    return related;
  };

  // Get related items by context
  const getRelatedByContext = (context: string): Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> => {
    const related: Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> = [];

    // Check tasks
    tasks.forEach(task => {
      if (task.context === context) {
        related.push({ type: 'task', item: task });
      }
    });

    return related;
  };

  // Get related items by project
  const getRelatedByProject = (projectId: string): Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> => {
    const related: Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> = [];

    // Check tasks
    tasks.forEach(task => {
      if (task.projectId === projectId) {
        related.push({ type: 'task', item: task });
      }
    });

    return related;
  };

  // Get related items by experiment
  const getRelatedByExperiment = (experimentId: string): Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> => {
    const related: Array<{ type: 'task' | 'event'; item: Task | CalendarEvent }> = [];

    // Check tasks
    tasks.forEach(task => {
      if (task.experimentId === experimentId) {
        related.push({ type: 'task', item: task });
      }
    });

    return related;
  };

  // Get all unique tags across tasks and events
  const getAllTags = useMemo(() => {
    const tagSet = new Set<string>();
    
    tasks.forEach(task => {
      task.tags.forEach(tag => tagSet.add(tag));
    });
    
    events.forEach(event => {
      event.tags.forEach(tag => tagSet.add(tag));
    });
    
    return Array.from(tagSet).sort();
  }, [tasks, events]);

  // Get all unique contexts across tasks
  const getAllContexts = useMemo(() => {
    const contextSet = new Set<string>();
    
    tasks.forEach(task => {
      if (task.context) {
        contextSet.add(task.context);
      }
    });
    
    return Array.from(contextSet).sort();
  }, [tasks]);

  // Get all unique projects across tasks
  const getAllProjects = useMemo(() => {
    const projectSet = new Set<string>();
    
    tasks.forEach(task => {
      if (task.projectId) {
        projectSet.add(task.projectId);
      }
    });
    
    return Array.from(projectSet).sort();
  }, [tasks]);

  // Get all unique experiments across tasks
  const getAllExperiments = useMemo(() => {
    const experimentSet = new Set<string>();
    
    tasks.forEach(task => {
      if (task.experimentId) {
        experimentSet.add(task.experimentId);
      }
    });
    
    return Array.from(experimentSet).sort();
  }, [tasks]);

  return {
    extractTags,
    extractLinks,
    getBacklinks,
    getRelatedByTags,
    getRelatedByContext,
    getRelatedByProject,
    getRelatedByExperiment,
    getAllTags,
    getAllContexts,
    getAllProjects,
    getAllExperiments,
  };
};
