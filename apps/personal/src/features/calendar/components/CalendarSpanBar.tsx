import React from "react";

interface CalendarSpanBarProps {
  id: string;
  title: string;
  startCol: number;
  endCol: number;
  tags?: string[];
}

export default function CalendarSpanBar({ id, title, startCol, endCol, tags }: CalendarSpanBarProps) {
  const width = endCol - startCol;
  
  return (
    <div
      className="absolute top-0 h-6 bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/20 dark:border-blue-400/25 rounded px-2 py-1 overflow-hidden"
      style={{
        left: `${(startCol / 7) * 100}%`,
        width: `${(width / 7) * 100}%`,
      }}
    >
      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate">{title}</div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 dark:bg-blue-400/25 text-blue-700 dark:text-blue-300">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
