import React from "react";
import { Columns, Split, PanelRight, PanelLeft } from "lucide-react";

export interface DualPaneControlsProps {
  isSplit: boolean;
  orientation: "horizontal" | "vertical";
  rightPaneVisible: boolean;
  onToggleSplit: () => void;
  onToggleOrientation: () => void;
  onToggleRightPane: () => void;
}

export function DualPaneControls({
  isSplit,
  orientation,
  rightPaneVisible,
  onToggleSplit,
  onToggleOrientation,
  onToggleRightPane
}: DualPaneControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Show/Hide Split */}
      <button
        onClick={onToggleSplit}
        className={`px-2 py-1 rounded-md hover:opacity-90 transition shadow-sm border 
          ${isSplit ? "bg-neutral-100 dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-900"}`}
        title={isSplit ? "Exit Dual Pane" : "Enter Dual Pane"}
      >
        <Columns className="w-4 h-4" />
      </button>

      {/* Orientation */}
      <button
        onClick={onToggleOrientation}
        disabled={!isSplit}
        className={`px-2 py-1 rounded-md hover:opacity-90 transition shadow-sm border disabled:opacity-50 
          ${orientation === "horizontal" ? "bg-neutral-100 dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-900"}`}
        title={`Switch to ${orientation === "horizontal" ? "vertical" : "horizontal"} split`}
      >
        <Split className="w-4 h-4" />
      </button>

      {/* Toggle Right Pane visibility */}
      <button
        onClick={onToggleRightPane}
        disabled={!isSplit}
        className={`px-2 py-1 rounded-md hover:opacity-90 transition shadow-sm border disabled:opacity-50 
          ${rightPaneVisible ? "bg-neutral-100 dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-900"}`}
        title={rightPaneVisible ? "Hide Right Pane" : "Show Right Pane"}
      >
        {rightPaneVisible ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>
    </div>
  );
}
