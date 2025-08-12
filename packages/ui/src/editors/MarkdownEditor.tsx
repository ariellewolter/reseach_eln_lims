import React from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <textarea
      className="note-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing your note..."
    />
  );
}
