import React from 'react';

interface SidebarItem {
  id: string;
  name: string;
  type: 'note' | 'table' | 'project' | 'chemical' | 'task' | 'lab' | 'user';
}

interface SidebarProps {
  items: SidebarItem[];
  onCreateNote?: () => void;
  onCreateTable?: () => void;
  onSelect: (id: string) => void;
}

export function Sidebar({ items, onCreateNote, onCreateTable, onSelect }: SidebarProps) {
  // Group items by type
  const notes = items.filter(item => item.type === 'note');
  const tables = items.filter(item => item.type === 'table');
  const projects = items.filter(item => item.type === 'project');
  const chemicals = items.filter(item => item.type === 'chemical');
  const tasks = items.filter(item => item.type === 'task');
  const labs = items.filter(item => item.type === 'lab');
  const users = items.filter(item => item.type === 'user');

  const renderSection = (title: string, items: SidebarItem[], icon: string) => {
    if (items.length === 0) return null;
    
    return (
      <div className="sidebar-section" key={title}>
        <h4 className="section-title">
          <span className="section-icon">{icon}</span>
          {title} ({items.length})
        </h4>
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="sidebar-item"
          >
            {item.name}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Research Notebook</h3>
        <div className="sidebar-actions">
          {onCreateNote && (
            <button 
              onClick={onCreateNote}
              className="create-btn create-note"
              title="Create Note"
            >
              + Note
            </button>
          )}
          {onCreateTable && (
            <button 
              onClick={onCreateTable}
              className="create-btn create-table"
              title="Create Table"
            >
              + Table
            </button>
          )}
        </div>
      </div>
      
      <div className="sidebar-content">
        {renderSection('Notes', notes, '📝')}
        {renderSection('Tables', tables, '📊')}
        {renderSection('Projects', projects, '📁')}
        {renderSection('Chemicals', chemicals, '🧪')}
        {renderSection('Tasks', tasks, '✅')}
        {renderSection('Labs', labs, '🏢')}
        {renderSection('Users', users, '👥')}
      </div>
    </div>
  );
}
