import React, { useState, useEffect, useRef } from 'react';
import { CheckSquare, Copy, Clipboard, Scissors, MousePointer, CalendarPlus } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCreateTask?: () => void;
  onSchedule?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onSelectAll?: () => void;
}

export function EditorContextMenu({
  x,
  y,
  onClose,
  onCreateTask,
  onSchedule,
  onCopy,
  onPaste,
  onCut,
  onSelectAll,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      label: 'Create Task from Selection',
      icon: <CheckSquare className="w-4 h-4" />,
      onClick: onCreateTask,
      shortcut: '⌘⇧T',
    },
    {
      label: 'Schedule as Calendar Block',
      icon: <CalendarPlus className="w-4 h-4" />,
      onClick: onSchedule,
      shortcut: '⌘⇧Y',
    },
    ...(onCopy ? [{
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: onCopy,
      shortcut: '⌘C',
    }] : []),
    ...(onPaste ? [{
      label: 'Paste',
      icon: <Clipboard className="w-4 h-4" />,
      onClick: onPaste,
      shortcut: '⌘V',
    }] : []),
    ...(onCut ? [{
      label: 'Cut',
      icon: <Scissors className="w-4 h-4" />,
      onClick: onCut,
      shortcut: '⌘X',
    }] : []),
    ...(onSelectAll ? [{
      label: 'Select All',
      icon: <MousePointer className="w-4 h-4" />,
      onClick: onSelectAll,
      shortcut: '⌘A',
    }] : []),
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
          onClick={() => {
            item.onClick?.();
            onClose();
          }}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {item.shortcut && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
