import React, { useState, useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { PropertiesPanel } from '../properties/PropertiesPanel';
import { TableEditor } from '../editors/TableEditor';
import { DualPaneControls } from './DualPaneControls';
import { Note, TableDoc, Project, Chemical, Task, Lab, User, DocumentProperties } from '@research/types';

interface DualPaneLayoutProps {
  leftPane?: React.ReactNode;
  rightPane?: React.ReactNode;
  notes?: Note[];
  tables?: TableDoc[];
  projects?: Project[];
  chemicals?: Chemical[];
  tasks?: Task[];
  labs?: Lab[];
  users?: User[];
  showProperties?: boolean;
  propertiesCollapsed?: boolean;
  onToggleProperties?: () => void;
  activeDocumentId?: string;
  activeDocumentType?: 'note' | 'table' | 'project' | 'task' | 'inventory';
  documentProperties?: DocumentProperties;
  onPropertiesChange?: (properties: DocumentProperties) => void;
  isDashboard?: boolean; // Hide properties on dashboard
  onCreateNote?: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string; // Changed return type to string
  onCreateTable?: (table: Omit<TableDoc, 'id' | 'createdAt' | 'updatedAt'>) => string; // Changed return type to string
  onUpdateNote?: (noteId: string, updates: Partial<Note>) => void;
}

export function DualPaneLayout({
  leftPane,
  rightPane,
  notes = [],
  tables = [],
  projects = [],
  chemicals = [],
  tasks = [],
  labs = [],
  users = [],
  showProperties = true,
  propertiesCollapsed = false,
  onToggleProperties,
  activeDocumentId,
  activeDocumentType,
  documentProperties,
  onPropertiesChange,
  isDashboard = false,
  onCreateNote,
  onCreateTable,
  onUpdateNote
}: DualPaneLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [splitPct, setSplitPct] = useState(50);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Dual pane controls state
  const [isSplit, setIsSplit] = useState(true);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [rightPaneVisible, setRightPaneVisible] = useState(true);

  // Dual pane control handlers
  const handleToggleSplit = () => setIsSplit(v => !v);
  const handleToggleOrientation = () => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal');
  const handleToggleRightPane = () => setRightPaneVisible(v => !v);

  // Auto-select first note and enter edit mode when component mounts
  useEffect(() => {
    if (notes.length > 0 && !selectedItem) {
      const firstNote = notes[0];
      setSelectedItem(firstNote.id);
      setIsEditing(true);
      setEditingNote(firstNote);
    }
  }, [notes, selectedItem]);

  // Auto-save functionality when editing note
  useEffect(() => {
    if (isEditing && editingNote && onUpdateNote) {
      const autoSaveTimer = setTimeout(() => {
        onUpdateNote(editingNote.id, editingNote);
        console.log('Auto-saved note:', editingNote.title);
      }, 2000); // Auto-save every 2 seconds
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [editingNote, isEditing, onUpdateNote]);

  // Determine layout mode based on pane props
  const isDualPane = leftPane && rightPane;

  // Properties panel should be shown when:
  // 1. Properties are enabled
  // 2. Not on dashboard
  // 3. Have an active document
  // 4. Have properties change handler
  const shouldShowProperties = showProperties && 
    !isDashboard && 
    activeDocumentId && 
    activeDocumentType && 
    onPropertiesChange;
    
  // Properties panel should always be visible (either expanded or collapsed) when:
  // 1. Properties are enabled
  // 2. Not on dashboard
  const shouldShowPropertiesPanel = showProperties && !isDashboard;

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
    if (onCreateNote) {
      const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'New Note',
        markdown: '# New Note\n\nStart writing your note here...',
        userId: 'user1', // TODO: Get from auth context
        projectId: undefined
      };
      const newNoteId = onCreateNote(newNote);
      
      // Auto-select the newly created note if we get an ID back
      if (newNoteId) {
        setSelectedItem(newNoteId);
        // Auto-enter edit mode for new notes
        const newNote = notes.find(n => n.id === newNoteId);
        if (newNote) {
          setIsEditing(true);
          setEditingNote(newNote);
        }
      } else if (notes.length > 0) {
        // Fallback: select the first note (newly created one)
        setSelectedItem(notes[0].id);
        // Auto-enter edit mode for the first note
        setIsEditing(true);
        setEditingNote(notes[0]);
      }
    } else {
      // Fallback for when no handler is provided
      console.log('Create note - no handler provided');
    }
  };

  const handleCreateTable = () => {
    if (onCreateTable) {
      const newTable: Omit<TableDoc, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'New Table',
        data: [['Column 1', 'Column 2', 'Column 3']],
        userId: 'user1',
        columns: [
          { id: 'col1', type: 'text', width: 120, align: 'left' },
          { id: 'col2', type: 'text', width: 120, align: 'left' },
          { id: 'col3', type: 'text', width: 120, align: 'left' }
        ]
      };
      const newTableId = onCreateTable(newTable);
      
      // Auto-select the newly created table if we get an ID back
      if (newTableId) {
        setSelectedItem(newTableId);
      } else if (tables.length > 0) {
        // Fallback: select the first table (newly created one)
        setSelectedItem(tables[0].id);
      }
    } else {
      // Fallback for when no handler is provided
      console.log('Create table - no handler provided');
    }
  };

  const handleSelect = (id: string) => {
    setSelectedItem(id);
    // Auto-enter edit mode when selecting a note
    const selectedNote = notes.find(n => n.id === id);
    if (selectedNote) {
      setIsEditing(true);
      setEditingNote(selectedNote);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
        <div className="pane">
          <div className="pane-tab">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Note Editor</span>
              <div style={{ display: 'flex', gap: '8px' }}>


              </div>
            </div>
          </div>
          <div className="pane-content">
            <div className="note-editor" style={{ padding: '24px' }}>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editingNote?.title || selectedNote.title}
                    onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                    style={{
                      width: '100%',
                      fontSize: '24px',
                      fontWeight: '600',
                      color: 'var(--text-0)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '2px solid var(--accent)',
                      padding: '8px 0',
                      marginBottom: '16px',
                      outline: 'none'
                    }}
                  />
                  <textarea
                    value={editingNote?.markdown || selectedNote.markdown}
                    onChange={(e) => setEditingNote(prev => prev ? { ...prev, markdown: e.target.value } : null)}
                    style={{
                      width: '100%',
                      minHeight: '400px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: 'var(--text-0)',
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '16px',
                      outline: 'none',
                      fontFamily: 'ui-monospace, monospace',
                      resize: 'vertical'
                    }}
                    placeholder="Start writing your note..."
                  />
                </div>
              ) : (
                <div>
                  <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'var(--text-0)' }}>
                    {selectedNote.title}
                  </h1>
                  <div className="note-meta" style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--text-1)' }}>
                    {selectedNote.createdAt && (
                      <span style={{ marginRight: '16px' }}>
                        Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {selectedNote.updatedAt && (
                      <span>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="note-content" style={{ lineHeight: '1.6', color: 'var(--text-0)' }}>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '14px',
                      margin: 0
                    }}>
                      {selectedNote.markdown}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selectedTable) {
      return (
        <TableEditor
          tableId={selectedTable.id}
          table={selectedTable}
          onSave={(updatedTable) => {
            console.log('Table saved:', updatedTable);
            // TODO: Update the table in the parent component
          }}
          onDelete={() => {
            console.log('Delete table:', selectedTable.id);
            // TODO: Handle table deletion
          }}
          onClose={() => {
            console.log('Close table editor');
            setSelectedItem(null);
          }}
        />
      );
    }

    if (selectedProject) {
      return (
        <div className="pane">
          <div className="pane-tab">
            <span>{selectedProject.title}</span>
          </div>
          <div className="pane-content">
            <div className="project-content" style={{ padding: '24px' }}>
              <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'var(--text-0)' }}>
                {selectedProject.title}
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text-1)', marginBottom: '24px' }}>
                {selectedProject.description}
              </p>
              <div className="project-meta" style={{ fontSize: '14px', color: 'var(--text-1)' }}>
                <span>Owner ID: {selectedProject.ownerId}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedChemical) {
      return (
        <div className="pane">
          <div className="pane-tab">
            <span>{selectedChemical.name}</span>
          </div>
          <div className="pane-content">
            <div className="chemical-content" style={{ padding: '24px' }}>
              <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'var(--text-0)' }}>
                {selectedChemical.name}
              </h1>
              <div className="chemical-details" style={{ fontSize: '16px', color: 'var(--text-1)' }}>
                <p style={{ marginBottom: '8px' }}><strong>CAS:</strong> {selectedChemical.cas || 'N/A'}</p>
                <p style={{ marginBottom: '8px' }}><strong>Vendor:</strong> {selectedChemical.vendor || 'N/A'}</p>
                <p style={{ marginBottom: '8px' }}><strong>Catalog:</strong> {selectedChemical.catalog || 'N/A'}</p>
                <p style={{ marginBottom: '8px' }}><strong>Units:</strong> {selectedChemical.units || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedTask) {
      return (
        <div className="pane">
          <div className="pane-tab">
            <span>{selectedTask.title}</span>
          </div>
          <div className="pane-content">
            <div className="task-content" style={{ padding: '24px' }}>
              <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'var(--text-0)' }}>
                {selectedTask.title}
              </h1>
              <div className="task-details" style={{ fontSize: '16px', color: 'var(--text-1)' }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Status:</strong> 
                  <span style={{ 
                    color: selectedTask.status === 'done' ? 'var(--green)' : 
                                                       selectedTask.status === 'in_progress' ? 'var(--orange)' : 'var(--blue)',
                    marginLeft: '8px'
                  }}>
                    {selectedTask.status}
                  </span>
                </p>
                {selectedTask.dueDate && (
                  <p style={{ marginBottom: '8px' }}><strong>Due:</strong> {selectedTask.dueDate}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default welcome content when nothing is selected
    return (
      <div className="pane">
        <div className="pane-tab">
          <span>Welcome</span>
        </div>
        <div className="pane-content">
          <div className="welcome-content" style={{ 
            padding: '48px 24px', 
            textAlign: 'center',
            color: 'var(--text-1)'
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              marginBottom: '16px', 
              color: 'var(--text-0)',
              fontWeight: '600'
            }}>
              Welcome to Your Research Workspace
            </h1>
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Select an item from the sidebar to start working, or create a new note or table to begin your research.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={handleCreateNote}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Create New Note
              </button>
              <button 
                onClick={handleCreateTable}
                style={{
                  background: 'var(--purple)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Create New Table
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine what to render in each pane
  const leftPaneContent = leftPane || renderContent();
  const rightPaneContent = rightPane || (
    <div className="welcome-content">
      <h2>Right Pane</h2>
      <p>This pane can be used for additional content, references, or side-by-side comparison.</p>
    </div>
  );

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
            </div>
            <div className="header-controls">
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
        
        {/* Properties Panel - shown above workspace */}
        {shouldShowPropertiesPanel && (
          <PropertiesPanel
            documentId={activeDocumentId || ''}
            documentType={activeDocumentType || 'note'}
            properties={documentProperties}
            onPropertiesChange={onPropertiesChange || (() => {})}
            collapsed={propertiesCollapsed}
            onToggleCollapsed={onToggleProperties}
          />
        )}
        
        <div className={`workspace-grid ${isSplit && isDualPane ? 'dual-pane' : 'single-pane'}`}>
          {isSplit && isDualPane ? (
            <>
              <div className={`pane ${orientation === 'horizontal' ? 'horizontal-split' : 'vertical-split'}`} 
                   style={orientation === 'horizontal' 
                     ? { '--left': `${splitPct}%` } as React.CSSProperties
                     : { '--top': `${splitPct}%` } as React.CSSProperties
                   }>
                <div className="pane-tab">
                  <span>Left Pane</span>
                </div>
                <div className="pane-content">
                  {leftPaneContent}
                </div>
              </div>
              <div className={`divider ${orientation === 'horizontal' ? 'horizontal' : 'vertical'}`}
                   onMouseDown={(e) => {
                     const startPos = orientation === 'horizontal' ? e.clientX : e.clientY;
                     const startSplit = splitPct;
                     
                     const handleMouseMove = (e: MouseEvent) => {
                       const currentPos = orientation === 'horizontal' ? e.clientX : e.clientY;
                       const delta = currentPos - startPos;
                       const containerSize = orientation === 'horizontal' 
                         ? window.innerWidth - 256 
                         : window.innerHeight - 200;
                       const deltaPercent = (delta / containerSize) * 100;
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
              {rightPaneVisible && (
                <div className={`pane ${orientation === 'horizontal' ? 'horizontal-split' : 'vertical-split'}`}
                     style={orientation === 'horizontal' 
                       ? { '--right': `${100 - splitPct}%` } as React.CSSProperties
                       : { '--bottom': `${100 - splitPct}%` } as React.CSSProperties
                     }>
                  <div className="pane-tab">
                    <span>Right Pane</span>
                  </div>
                  <div className="pane-content">
                    {rightPaneContent}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="pane">
              <div className="pane-content">
                {leftPaneContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
