import React from "react";

interface CalendarEventChipProps {
  title: string;
  timeLabel: string;
  tags: string[];
  resizable?: boolean;
  draggable?: boolean;
  onResizeStart?: (dir: "start" | "end") => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export default function CalendarEventChip({ 
  title, 
  timeLabel, 
  tags, 
  resizable, 
  draggable, 
  onResizeStart, 
  onDragStart,
  onClick,
  onDoubleClick
}: CalendarEventChipProps) {
  return (
    <div 
      className="h-full rounded-md bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/20 dark:border-blue-400/25 p-2 overflow-hidden relative cursor-pointer hover:bg-blue-500/20 dark:hover:bg-blue-400/25 transition-colors"
      onMouseDown={draggable ? onDragStart : undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate">{title}</div>
      <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-1">{timeLabel}</div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 dark:bg-blue-400/25 text-blue-700 dark:text-blue-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Resize handles */}
      {resizable && (
        <>
          <div 
            className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/30 transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart?.("start");
            }}
            title="Resize start time"
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/30 transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart?.("end");
            }}
            title="Resize end time"
          />
        </>
      )}
    </div>
  );
}
