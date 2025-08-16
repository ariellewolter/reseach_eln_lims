import React, { useState } from 'react';
import NotePage from '../components/NotePage';

// Mock notes data - in a real app this would come from your API
const mockNotes = [
  { id: '1', title: 'New Note' },
  { id: '2', title: 'Welcome Note' },
  { id: '3', title: 'Lab Protocol' },
  { id: '4', title: 'Research Ideas' },
  { id: '5', title: 'Meeting Notes' },
  { id: '6', title: 'Literature Review' },
  { id: '7', title: 'Experiment Results' },
  { id: '8', title: 'Data Analysis' }
];

export default function NotesPage() {
  const [leftNoteId, setLeftNoteId] = useState('1');
  const [rightNoteId, setRightNoteId] = useState('2');
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      background: 'var(--bg-0)',
      padding: '16px',
      gap: '16px'
    }}>
      {/* Left Pane */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        background: 'var(--bg-1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-0)' }}>
              Left Note
            </h3>
            <select
              value={leftNoteId}
              onChange={(e) => setLeftNoteId(e.target.value)}
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                color: 'var(--text-0)',
                cursor: 'pointer'
              }}
            >
              {mockNotes.map(note => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setActiveSide('left')}
            style={{
              background: activeSide === 'left' ? 'var(--accent)' : 'transparent',
              color: activeSide === 'left' ? 'white' : 'var(--text-1)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Active
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <NotePage 
            noteId={leftNoteId}
            onSave={(note) => console.log('Left note saved:', note)}
            onDelete={() => console.log('Left note deleted')}
            onClose={() => console.log('Left note closed')}
          />
        </div>
      </div>

      {/* Right Pane */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        background: 'var(--bg-1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-0)' }}>
              Right Note
            </h3>
            <select
              value={rightNoteId}
              onChange={(e) => setRightNoteId(e.target.value)}
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                color: 'var(--text-0)',
                cursor: 'pointer'
              }}
            >
              {mockNotes.map(note => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setActiveSide('right')}
            style={{
              background: activeSide === 'right' ? 'var(--accent)' : 'var(--bg-1)',
              color: activeSide === 'right' ? 'white' : 'var(--text-1)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Active
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <NotePage 
            noteId={rightNoteId}
            onSave={(note) => console.log('Right note saved:', note)}
            onDelete={() => console.log('Right note deleted')}
            onClose={() => console.log('Right note closed')}
          />
        </div>
      </div>
    </div>
  );
}
