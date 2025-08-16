import React from "react";
import { CalendarPlus } from "lucide-react";
import useScheduleSelection from "../hooks/useScheduleSelection";
import QuickScheduleDialog from "./QuickScheduleDialog";

export default function ScheduleFromSelectionButton() {
  const { dialogOpen, pending, openDialog, closeDialog, finalize } = useScheduleSelection();

  return (
    <>
      <button
        onClick={openDialog}
        title="Schedule selection as calendar block (Cmd/Ctrl+Shift+Y)"
        className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <CalendarPlus className="w-4 h-4"/>
      </button>

      <QuickScheduleDialog
        open={!!dialogOpen}
        onClose={closeDialog}
        defaultTitle={pending?.defaultTitle || ""}
        onCreate={({ title, startISO, endISO }) => finalize({ title, startISO, endISO })}
      />
    </>
  );
}
