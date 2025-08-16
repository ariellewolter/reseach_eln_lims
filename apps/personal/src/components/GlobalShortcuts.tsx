import { useEffect } from 'react';
import useCreateTaskFromSelection from '../features/tasks/hooks/useCreateTaskFromSelection';
import useScheduleSelection from '../features/calendar/hooks/useScheduleSelection';

export function GlobalShortcuts() {
  const createTaskFromSelection = useCreateTaskFromSelection();
  const { openDialog: openScheduleDialog } = useScheduleSelection();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey) {
        if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          createTaskFromSelection({ pane: "active" });
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          openScheduleDialog();
        }
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [createTaskFromSelection, openScheduleDialog]);

  return null;
}
