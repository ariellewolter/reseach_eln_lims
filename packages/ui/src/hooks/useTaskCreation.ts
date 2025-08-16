import { useCallback } from 'react';

export interface TaskCreationOptions {
  pane?: "left" | "right" | "active";
  priority?: "low" | "med" | "high" | "urgent";
  dueISO?: string;
  sourceFileId?: string;
  sourceFileTitle?: string;
}

export interface TaskCreationHook {
  (opts?: TaskCreationOptions): any; // Return type can be Task or null
}

export function useTaskCreation(createTaskFn: TaskCreationHook): TaskCreationHook {
  return useCallback((opts?: TaskCreationOptions) => {
    return createTaskFn(opts);
  }, [createTaskFn]);
}
