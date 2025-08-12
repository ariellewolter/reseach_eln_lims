import React, { useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { Note, TableDoc, Project, Chemical, Task, Lab, User } from '@research/types';

interface DualPaneLayoutProps {
  notes?: Note[];
  tables?: TableDoc[];
  projects?: Project[];
  chemicals?: Chemical[];
  tasks?: Task[];
  labs?: Lab[];
  users?: User[];
}

export function DualPaneLayout({
  notes = [],
  tables = [],
  projects = [],
  chemicals = [],
  tasks = [],
  labs = [],
  users = []
}: DualPaneLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isSplit, setIsSplit] = useState(false);
  const [splitPct, setSplitPct] = useState(50);

  // Combine all items for sidebar
  const sidebarItems = [
    ...notes.map(note => ({ id: note.id, name: note.title, type: 'note' as const })),
    ...tables.map(table => ({ id: table.id, name: table.title, type: 'table' as const })),
    ...projects.map(project => ({ id: project.id, name: project.title, type: 'project' as const })),
    ...chemicals.map(chemical => ({ id: chemical.id, name: chemical.name, type: 'chemical' as const })),
    ...tasks.map(task => ({ id: task.id, name: task.title, type: 'task' as const })),
    ...labs.map(lab => ({ id: lab.id, name: lab.name, type: 'lab' as const })),
    ...users.map(user => ({ id: user.id, name: user.name, type: 'user' as const }))
  ];

  const handleCreateNote = () => {
    // TODO: Implement note creation
    console.log('Create note');
  };

  const handleCreateTable = () => {
    // TODO: Implement table creation
    console.log('Create table');
  };

  const handleSelect = (id: string) => {
    setSelectedItem(id);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSplit = () => setIsSplit(!isSplit);

  // Find selected item
  const selectedNote = notes.find(n => n.id === selectedItem);
  const selectedTable = tables.find(t => t.id === selectedItem);
  const selectedProject = projects.find(p => p.id === selectedItem);
  const selectedChemical = chemicals.find(c => c.id === selectedItem);
  const selectedTask = tasks.find(t => t.id === selectedItem);
  const selectedLab = labs.find(l => l.id === selectedItem);
  const selectedUser = users.find(u => u.id === selectedItem);

  const renderContent = () => {
    if (selectedNote) {
      return (
        <div className="note-content">
          <h1>{selectedNote.title}</h1>
          <div className="note-meta">
            {selectedNote.createdAt && (
              <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
            )}
            {selectedNote.updatedAt && (
              <span>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="markdown-content">
            <pre>{selectedNote.markdown}</pre>
          </div>
        </div>
      );
    }

    if (selectedTable) {
      return (
        <div className="table-content">
          <h1>{selectedTable.title}</h1>
          <div className="table-meta">
            {selectedTable.createdAt && (
              <span>Created: {new Date(selectedTable.createdAt).toLocaleDateString()}</span>
            )}
            {selectedTable.updatedAt && (
              <span>Updated: {new Date(selectedTable.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="table-data">
            <table>
              <tbody>
                {selectedTable.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (selectedProject) {
      return (
        <div className="project-content">
          <h1>{selectedProject.title}</h1>
          <p>{selectedProject.description}</p>
          <div className="project-meta">
            <span>Owner ID: {selectedProject.ownerId}</span>
          </div>
        </div>
      );
    }

    if (selectedChemical) {
      return (
        <div className="chemical-content">
          <h1>{selectedChemical.name}</h1>
          <div className="chemical-details">
            <p><strong>CAS:</strong> {selectedChemical.cas || 'N/A'}</p>
            <p><strong>Vendor:</strong> {selectedChemical.vendor || 'N/A'}</p>
            <p><strong>Catalog:</strong> {selectedChemical.catalog || 'N/A'}</p>
            <p><strong>Units:</strong> {selectedChemical.units || 'N/A'}</p>
          </div>
        </div>
      );
    }

    if (selectedTask) {
      return (
        <div className="task-content">
          <h1>{selectedTask.title}</h1>
          <div className="task-details">
            <p><strong>Status:</strong> <span className={`status-${selectedTask.status}`}>{selectedTask.status}</span></p>
            {selectedTask.assigneeId && <p><strong>Assignee:</strong> {selectedTask.assigneeId}</p>}
            {selectedTask.due && <p><strong>Due:</strong> {selectedTask.due}</p>}
          </div>
        </div>
      );
    }

    if (selectedLab) {
      return (
        <div className="lab-content">
          <h1>{selectedLab.name}</h1>
        </div>
      );
    }

    if (selectedUser) {
      return (
        <div className="user-content">
          <h1>{selectedUser.name}</h1>
          <div className="user-details">
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            {selectedUser.labId && <p><strong>Lab:</strong> {selectedUser.labId}</p>}
          </div>
        </div>
      );
    }

    return (
      <div className="welcome-content">
        <h1>Welcome to Research Notebook</h1>
        <p>Select an item from the sidebar to get started.</p>
        <div className="quick-stats">
          <div className="stat">
            <h3>{notes.length}</h3>
            <p>Notes</p>
          </div>
          <div className="stat">
            <h3>{tables.length}</h3>
            <p>Tables</p>
          </div>
          <div className="stat">
            <h3>{projects.length}</h3>
            <p>Projects</p>
          </div>
          <div className="stat">
            <h3>{chemicals.length}</h3>
            <p>Chemicals</p>
          </div>
          <div className="stat">
            <h3>{tasks.length}</h3>
            <p>Tasks</p>
          </div>
          {labs.length > 0 && (
            <div className="stat">
              <h3>{labs.length}</h3>
              <p>Labs</p>
            </div>
          )}
          {users.length > 0 && (
            <div className="stat">
              <h3>{users.length}</h3>
              <p>Users</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <Sidebar
          items={sidebarItems}
          onCreateNote={handleCreateNote}
          onCreateTable={handleCreateTable}
          onSelect={handleSelect}
        />
      </div>
      <div className="workspace">
        <div className="workspace-header">
          <div className="header-actions">
            <button className="icon-btn" onClick={toggleSidebar}>
              ☰
            </button>
            <button className={`icon-btn ${isSplit ? 'split-toggle active' : ''}`} onClick={toggleSplit}>
              {isSplit ? '⊞' : '⊟'}
            </button>
          </div>
        </div>
        <div className={`workspace-grid ${isSplit ? 'dual-pane' : 'single-pane'}`}>
          {isSplit ? (
            <>
              <div className="pane" style={{ '--left': `${splitPct}%` } as React.CSSProperties}>
                <div className="pane-tab">
                  <span>Left Pane</span>
                </div>
                <div className="pane-content">
                  {renderContent()}
                </div>
              </div>
              <div className="divider" 
                   onMouseDown={(e) => {
                     const startX = e.clientX;
                     const startSplit = splitPct;
                     
                     const handleMouseMove = (e: MouseEvent) => {
                       const deltaX = e.clientX - startX;
                       const containerWidth = window.innerWidth - 256; // Approximate container width
                       const deltaPercent = (deltaX / containerWidth) * 100;
                       const newSplit = Math.max(20, Math.min(80, startSplit + deltaPercent));
                       setSplitPct(newSplit);
                     };
                     
                     const handleMouseUp = () => {
                       document.removeEventListener('mousemove', handleMouseMove);
                       document.removeEventListener('mouseup', handleMouseUp);
                       document.body.classList.remove('is-resizing');
                     };
                     
                     document.addEventListener('mousemove', handleMouseMove);
                     document.addEventListener('mouseup', handleMouseUp);
                     document.body.classList.add('is-resizing');
                   }}
              />
              <div className="pane" style={{ '--right': `${100 - splitPct}%` } as React.CSSProperties}>
                <div className="pane-tab">
                  <span>Right Pane</span>
                </div>
                <div className="pane-content">
                  <div className="welcome-content">
                    <h2>Right Pane</h2>
                    <p>This pane can be used for additional content, references, or side-by-side comparison.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="pane">
              <div className="pane-content">
                {renderContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
