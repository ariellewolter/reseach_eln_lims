import { useCallback } from 'react';
import { getActiveSelection } from '../../../utils/getActiveSelection';
import { buildTaskFromSelection } from '../utils/fromSelection';
import { useNotebookBridge } from '../../../integrations/useNotebookBridge';
import { useTasksStore } from '../store/useTasksStore';

export default function useCreateTaskFromSelection() {
  const { insertTaskReference } = useNotebookBridge();
  const addTask = useTasksStore(s => s.addTask);

  return useCallback((opts?: { 
    pane?: "left" | "right" | "active"; 
    priority?: "low"|"med"|"high"|"urgent"; 
    dueISO?: string;
    sourceFileId?: string;
    sourceFileTitle?: string;
  }) => {
    const selection = getActiveSelection();
    
    // For now, we'll use a default source file ID if none provided
    // In a real implementation, this would come from the notebook context
    const sourceFileId = opts?.sourceFileId || 'current-note';
    const sourceFileTitle = opts?.sourceFileTitle || 'Current Note';

    if (!sourceFileId) {
      console.warn("No source file ID provided for task creation");
      return null;
    }

    const taskInput = buildTaskFromSelection({
      selectionText: selection || sourceFileTitle || "New Task",
      sourceFileId,
      sourceFileTitle,
      defaultPriority: opts?.priority || "med",
    });

    if (opts?.dueISO) {
      (taskInput as any).dueDate = opts.dueISO;
    }

    const created = addTask(taskInput);

    // Insert a reference into the editor at cursor
    const ref = `\n- [ ] ${created.title} ${(created as any).dueDate ? `(due ${new Date((created as any).dueDate).toLocaleDateString()})` : ""} [[Task:${created.id}]]\n`;
    
    // Use the notebook bridge to insert text
    const targetPane = opts?.pane || "active";
    if (targetPane === "active") {
      // For active pane, we'll use the default behavior
      insertTaskReference(created.id, "right");
    } else {
      insertTaskReference(created.id, targetPane);
    }

    console.log("Task created from selection:", created);
    // In a real app, you'd use a toast notification here
    // toast?.success?.("Task created from selection");

    return created;
  }, [addTask, insertTaskReference]);
}
