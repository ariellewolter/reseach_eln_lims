import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { MetaBar } from './MetaBar';
import { useAutoSave } from '../hooks/useAutoSave';
import type { TaskCreationHook } from '../hooks/useTaskCreation';
import { EditorContextMenu } from './EditorContextMenu';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => Promise<void> | void;
  date?: string;
  onDateChange?: (date: string) => void;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  className?: string;
  sourceFileId?: string;
  sourceFileTitle?: string;
  onCreateTask?: TaskCreationHook;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  onSave,
  date,
  onDateChange,
  tags = [],
  onTagsChange,
  className = "",
  sourceFileId,
  sourceFileTitle,
  onCreateTask,
}: MarkdownEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  // Auto-save when value changes
  useAutoSave(
    { content: localValue },
    onSave ? (data) => onSave(data.content) : () => {},
    { delay: 1000 }
  );

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleCreateTask = () => {
    if (onCreateTask) {
      onCreateTask({ 
        pane: "active",
        sourceFileId,
        sourceFileTitle,
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localValue);
  };

  const handleSelectAll = () => {
    const textarea = document.querySelector('.note-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
    }
  };

  const handleSchedule = () => {
    // This will be handled by the ScheduleFromSelectionButton component
    // We just need to trigger the same action
    const button = document.querySelector('[title*="Schedule selection"]') as HTMLButtonElement;
    if (button) {
      button.click();
    }
  };

  return (
    <div className={`markdown-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b px-3 py-2 bg-neutral-50 dark:bg-neutral-900">
        {onCreateTask && (
          <button
            className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Create Task from Selection (Cmd/Ctrl+Shift+T)"
            onClick={handleCreateTask}
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MetaBar for date and tags */}
      {(onDateChange || onTagsChange) && (
        <MetaBar
          date={date}
          onDateChange={onDateChange}
          tags={tags}
          onTagsChange={onTagsChange}
        />
      )}
      
      {/* Editor */}
      <textarea
        className="note-textarea w-full h-full p-4 resize-none outline-none border-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onContextMenu={handleContextMenu}
        placeholder="Start writing your note..."
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          minHeight: '400px'
        }}
      />

      {/* Context Menu */}
      {showContextMenu && (
        <EditorContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setShowContextMenu(false)}
          onCreateTask={onCreateTask ? () => handleCreateTask() : undefined}
          onSchedule={handleSchedule}
          onCopy={handleCopy}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  );
}
