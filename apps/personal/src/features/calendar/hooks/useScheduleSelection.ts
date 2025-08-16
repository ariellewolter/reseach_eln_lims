import { useCallback, useState } from "react";
import { getActiveSelection } from "../../../utils/getActiveSelection";
import { useNotebookBridge } from "../../../integrations/useNotebookBridge";
import { useCalendarStore } from "../store/useCalendarStore";
import { normalizeTagsAndLinks } from "../../../utils/tagLinkUtils";

export default function useScheduleSelection() {
  const addEvent = useCalendarStore(s => s.addEvent);
  const { insertEventReference } = useNotebookBridge();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState<{ defaultTitle: string } | null>(null);

  const start = useCallback(() => {
    const sel = getActiveSelection();
    // For now, we'll use a default source file - in a real implementation this would come from context
    const sourceFile = { id: 'current-note', title: 'Current Note' };

    if (!sourceFile) return null;

    const title = (sel || sourceFile.title || "Scheduled block").slice(0, 140);
    setPending({ defaultTitle: title });
    setDialogOpen(true);
    return true;
  }, []);

  const finalize = useCallback((payload: { title: string; startISO: string; endISO: string }) => {
    // For now, we'll use a default source file - in a real implementation this would come from context
    const sourceFile = { id: 'current-note', title: 'Current Note' };

    if (!sourceFile) return;

    const parsed = normalizeTagsAndLinks(payload.title);
    const ev = addEvent({
      title: parsed.text || payload.title,
      description: `From [[${sourceFile.title || sourceFile.id}]]`,
      start: payload.startISO,
      end: payload.endISO,
      source: "from_selection",
      tags: parsed.tags,
      meta: { sourceFileId: sourceFile.id }
    });

    // insert inline reference into active editor
    const startDt = new Date(payload.startISO);
    const endDt   = new Date(payload.endISO);
    const label = `${startDt.toLocaleDateString()} ${startDt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${endDt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    const ref = `\n> 🗓️ Scheduled: ${ev.title} — ${label} [[Event:${ev.id}]]\n`;
    
    // Use the notebook bridge to insert text
    insertEventReference(ev.id, "right");
  }, [addEvent, insertEventReference]);

  return {
    dialogOpen,
    pending,
    openDialog: start,
    closeDialog: () => setDialogOpen(false),
    finalize,
  };
}
