import React from 'react';

interface SidebarItem {
  id: string;
  name: string;
  type: 'note' | 'table';
}

interface SidebarProps {
  items: SidebarItem[];
  onCreateNote?: () => void;
  onCreateTable?: () => void;
  onSelect: (id: string) => void;
}

export function Sidebar({ items, onCreateNote, onCreateTable, onSelect }: SidebarProps) {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-0)' }}>Documents</h3>
        {onCreateNote && (
          <button 
            onClick={onCreateNote}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '8px',
              fontSize: '14px'
            }}
          >
            + Note
          </button>
        )}
        {onCreateTable && (
          <button 
            onClick={onCreateTable}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Table
          </button>
        )}
      </div>
      <div>
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              padding: '8px 12px',
              margin: '4px 0',
              borderRadius: '6px',
              cursor: 'pointer',
              background: 'var(--bg-2)',
              color: 'var(--text-0)',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-2)';
              e.currentTarget.style.color = 'var(--text-0)';
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
