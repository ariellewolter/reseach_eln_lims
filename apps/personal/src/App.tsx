import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DualPaneLayout } from '@research/ui';
import { Note, TableDoc, Project, Task, Chemical, MINIMAL_PROPERTIES } from '@research/types';
import PersonalDashboard from './components/PersonalDashboard';
import Navigation from './components/Navigation';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import CalendarView from './features/calendar/views/CalendarView';
import DayFocusView from './features/calendar/views/DayFocusView';
import { GlobalShortcuts } from './components/GlobalShortcuts';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';

// Initialize with empty arrays - data will be loaded from storage or API
const mockNotes: Note[] = [];
const mockTables: TableDoc[] = [];
const mockProjects: Project[] = [];
const mockTasks: Task[] = [];
const mockChemicals: Chemical[] = [];

function App() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [tables, setTables] = useState<TableDoc[]>(mockTables);
  const [showProperties, setShowProperties] = useState(true);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(true);
  const [activeDocumentId, setActiveDocumentId] = useState('1');
  const [activeDocumentType, setActiveDocumentType] = useState<'note' | 'table' | 'project' | 'task' | 'inventory'>('note');
  
  // Start with minimal properties for the active document
  const [documentProperties, setDocumentProperties] = useState({
    documentId: '1',
    documentType: 'note' as const,
    properties: MINIMAL_PROPERTIES.map(p => ({
      propertyId: p.id,
      value: p.type === 'select' ? (p.options && p.options.length > 0 ? p.options[0] : '') : 
             p.type === 'number' ? 0 : 
             p.type === 'date' ? new Date().toISOString().split('T')[0] : 
             p.type === 'checkbox' ? false : 
             p.type === 'tags' ? [] : ''
    })),
    categories: [],
    backlinks: [],
    tags: []
  });

  // Note creation and update handlers
  const handleCreateNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote.id;
  };

  const handleCreateTable = (tableData: Omit<TableDoc, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTable: TableDoc = {
      ...tableData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTables(prev => [newTable, ...prev]);
    return newTable.id;
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const handlePropertiesChange = (properties: any) => {
    setDocumentProperties(properties);
  };

  const handleToggleProperties = () => {
    setShowProperties(!showProperties);
  };

  const handlePropertiesCollapsed = () => {
    setPropertiesCollapsed(!propertiesCollapsed);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <div className="h-screen bg-background">
            <GlobalShortcuts />
            <Navigation />
            <Routes>
              <Route path="/" element={<PersonalDashboard />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/day-focus" element={<DayFocusView />} />
              <Route 
                path="/workspace" 
                element={
                  <DualPaneLayout
                    notes={notes}
                    tables={tables}
                    projects={mockProjects}
                    tasks={mockTasks}
                    chemicals={mockChemicals}
                    showProperties={showProperties}
                    propertiesCollapsed={propertiesCollapsed}
                    onToggleProperties={handlePropertiesCollapsed}
                    activeDocumentId={activeDocumentId}
                    activeDocumentType={activeDocumentType}
                    documentProperties={documentProperties}
                    onPropertiesChange={handlePropertiesChange}
                    onCreateNote={handleCreateNote}
                    onCreateTable={handleCreateTable}
                    onUpdateNote={handleUpdateNote}
                    isDashboard={false}
                  />
                } 
              />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

