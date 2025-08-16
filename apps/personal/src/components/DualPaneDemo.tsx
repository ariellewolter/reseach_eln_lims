import React, { useState } from 'react';
import { DualPaneLayout, DualPaneControls, MarkdownEditor, TableEditor, MetaBar } from '@research/ui';
import useCreateTaskFromSelection from '../features/tasks/hooks/useCreateTaskFromSelection';
import ScheduleFromSelectionButton from '../features/calendar/components/ScheduleFromSelectionButton';

export default function DualPaneDemo() {
  const [isSplit, setIsSplit] = useState(true);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [rightPaneVisible, setRightPaneVisible] = useState(true);
  const [noteContent, setNoteContent] = useState('# Welcome to the Dual Pane Demo\n\nThis demonstrates the new dual pane controls and features.');
  const [noteTags, setNoteTags] = useState(['demo', 'dual-pane']);
  const [noteDate, setNoteDate] = useState('2025-01-15');

  const createTaskFromSelection = useCreateTaskFromSelection();

  const handleToggleSplit = () => setIsSplit(v => !v);
  const handleToggleOrientation = () => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal');
  const handleToggleRightPane = () => setRightPaneVisible(v => !v);

  const leftPane = (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Left Pane - Note Editor</h2>
      <MarkdownEditor
        value={noteContent}
        onChange={setNoteContent}
        onSave={(content) => console.log('Note saved:', content)}
        date={noteDate}
        onDateChange={setNoteDate}
        tags={noteTags}
        onTagsChange={setNoteTags}
        onCreateTask={createTaskFromSelection}
        sourceFileId="demo-note"
        sourceFileTitle="Demo Note"
      />
    </div>
  );

  const rightPane = (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Right Pane - Table Editor</h2>
      <TableEditor
        tableId="demo-table"
        onSave={(table) => console.log('Table saved:', table)}
        onClose={() => console.log('Table closed')}
        onCreateTask={createTaskFromSelection}
        sourceFileId="demo-table"
        sourceFileTitle="Demo Table"
        scheduleButton={<ScheduleFromSelectionButton />}
      />
    </div>
  );

  return (
    <div className="h-screen bg-background">
      {/* Header with Controls */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Dual Pane Demo
          </h1>
          <DualPaneControls
            isSplit={isSplit}
            orientation={orientation}
            rightPaneVisible={rightPaneVisible}
            onToggleSplit={handleToggleSplit}
            onToggleOrientation={handleToggleOrientation}
            onToggleRightPane={handleToggleRightPane}
          />
        </div>
      </div>

      {/* Dual Pane Layout */}
      <DualPaneLayout
        leftPane={leftPane}
        rightPane={rightPane}
        showProperties={false}
        isDashboard={true}
      />
    </div>
  );
}
