import React, { useState } from 'react';
import { DualPaneLayout } from '@research/ui';
import { DocumentProperties } from '@research/types';

// Sample data for demonstration
const sampleNotes = [
  {
    id: 'note-1',
    title: 'Experiment Protocol - Synthesis of Compound A',
    markdown: '# Experiment Protocol\n\n## Materials\n- Compound B (2.5g)\n- Solvent X (50mL)\n- Catalyst Y (0.1g)\n\n## Procedure\n1. Dissolve Compound B in Solvent X\n2. Add Catalyst Y\n3. Heat to 80°C for 2 hours\n4. Cool and filter\n\n## Expected Results\n- Yield: 75-85%\n- Purity: >95%',
    updatedAt: '2025-01-15T10:30:00Z',
    createdAt: '2025-01-10T14:00:00Z'
  },
  {
    id: 'note-2',
    title: 'Literature Review - Novel Catalysts',
    markdown: '# Literature Review\n\n## Key Papers\n1. **Smith et al. (2024)** - Novel approach using metal-organic frameworks\n2. **Johnson & Lee (2023)** - Computational screening methods\n3. **Chen et al. (2024)** - Green chemistry applications\n\n## Findings\n- MOF catalysts show promise for green synthesis\n- Computational methods can predict activity\n- Need for more experimental validation',
    updatedAt: '2025-01-14T16:45:00Z',
    createdAt: '2025-01-12T09:15:00Z'
  }
];

const sampleProperties: DocumentProperties = {
  documentId: 'note-1',
  documentType: 'note',
  properties: [
    { propertyId: 'status', value: 'in-progress' },
    { propertyId: 'priority', value: 'high' },
    { propertyId: 'tags', value: ['synthesis', 'protocol', 'catalyst'] },
    { propertyId: 'project', value: 'Compound A Synthesis' },
    { propertyId: 'assigned-to', value: 'Dr. Rodriguez' },
    { propertyId: 'due-date', value: '2025-02-01' },
    { propertyId: 'budget', value: 2500 },
    { propertyId: 'safety-level', value: 'B' }
  ],
  categories: ['experiment', 'protocol'],
  backlinks: ['note-2', 'project-alpha'],
  tags: ['synthesis', 'protocol', 'catalyst', 'organic']
};

export function PropertiesDemo() {
  const [activeNote, setActiveNote] = useState(sampleNotes[0]);
  const [documentProperties, setDocumentProperties] = useState(sampleProperties);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);

  const handleNoteSelect = (noteId: string) => {
    const note = sampleNotes.find(n => n.id === noteId);
    if (note) {
      setActiveNote(note);
      // For demo purposes, use the same properties for all notes
      setDocumentProperties({
        ...sampleProperties,
        documentId: note.id
      });
    }
  };

  const handlePropertiesChange = (properties: DocumentProperties) => {
    setDocumentProperties(properties);
    console.log('Properties updated:', properties);
  };

  const noteEditor = (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <h1 style={{ color: 'var(--text-0)', marginBottom: '16px' }}>
        {activeNote.title}
      </h1>
      <div style={{ 
        background: 'var(--bg-1)', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid var(--border)',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-1)', marginBottom: '8px' }}>
          Updated: {new Date(activeNote.updatedAt).toLocaleDateString()}
        </div>
        <div style={{ 
          fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
          lineHeight: '1.6',
          color: 'var(--text-0)',
          whiteSpace: 'pre-wrap'
        }}>
          {activeNote.markdown}
        </div>
      </div>
    </div>
  );

  const previewPane = (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <h2 style={{ color: 'var(--text-0)', marginBottom: '16px' }}>
        Properties System Demo
      </h2>
      <div style={{ 
        background: 'var(--bg-1)', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <h3 style={{ color: 'var(--text-0)', marginBottom: '12px' }}>
          Features Demonstrated
        </h3>
        <ul style={{ color: 'var(--text-1)', lineHeight: '1.6' }}>
          <li>📝 <strong>Property Types:</strong> Text, number, select, multi-select, date, checkbox, URL, email, status, priority, tags</li>
          <li>🔗 <strong>Backlinks:</strong> Automatic linking between documents</li>
          <li>🏷️ <strong>Categories & Tags:</strong> Flexible organization system</li>
          <li>🎛️ <strong>Collapsible Panel:</strong> Can be minimized or expanded</li>
          <li>⚙️ <strong>Configurable:</strong> Add/remove properties per document</li>
        </ul>
        
        <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-2)', borderRadius: '6px' }}>
          <h4 style={{ color: 'var(--text-0)', marginBottom: '8px' }}>
            Current Document Properties
          </h4>
          <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>
            <div>Status: <span style={{ color: 'var(--accent)' }}>In Progress</span></div>
            <div>Priority: <span style={{ color: 'var(--orange)' }}>High</span></div>
            <div>Tags: {documentProperties.tags?.join(', ')}</div>
            <div>Categories: {documentProperties.categories?.join(', ')}</div>
            <div>Backlinks: {documentProperties.backlinks?.length || 0} documents</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DualPaneLayout
      leftPane={noteEditor}
      rightPane={previewPane}
      notes={sampleNotes}
      
      // Properties Panel Integration
      showProperties={true}
      propertiesCollapsed={propertiesCollapsed}
      onToggleProperties={() => setPropertiesCollapsed(!propertiesCollapsed)}
      activeDocumentId={activeNote?.id}
      activeDocumentType="note"
      documentProperties={documentProperties}
      onPropertiesChange={handlePropertiesChange}
      isDashboard={false}
    />
  );
}
