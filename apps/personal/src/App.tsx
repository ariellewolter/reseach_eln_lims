import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DualPaneLayout } from '@research/ui';
import { Note, TableDoc, Project, Chemical, Task } from '@research/types';

function App() {
  // Mock data for development
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Daily Lab Notes - 2024-01-15',
      markdown: '# Daily Lab Notes\n\n## Experiments\n- PCR amplification of gene X\n- Results: Successful amplification\n\n## Notes\n- Need to order more primers\n- Check incubator temperature',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T17:30:00Z'
    },
    {
      id: '2',
      title: 'Protocol: DNA Extraction',
      markdown: '# DNA Extraction Protocol\n\n## Materials\n- Lysis buffer\n- Proteinase K\n- Phenol-chloroform\n\n## Steps\n1. Add 500μL lysis buffer\n2. Incubate at 56°C for 1 hour\n3. Extract with phenol-chloroform',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z'
    }
  ];

  const mockTables: TableDoc[] = [
    {
      id: '1',
      title: 'Chemical Inventory',
      data: [
        ['Chemical', 'CAS', 'Vendor', 'Quantity', 'Units'],
        ['Sodium Chloride', '7647-14-5', 'Sigma', '500', 'g'],
        ['Tris Buffer', '77-86-1', 'Fisher', '100', 'g'],
        ['EDTA', '60-00-4', 'Sigma', '50', 'g']
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ];

  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Gene Expression Study',
      description: 'Investigating expression patterns of stress response genes',
      ownerId: 'user1'
    },
    {
      id: '2',
      title: 'Protein Purification',
      description: 'Optimizing purification protocol for recombinant proteins',
      ownerId: 'user1'
    }
  ];

  const mockChemicals: Chemical[] = [
    {
      id: '1',
      name: 'Sodium Chloride',
      cas: '7647-14-5',
      vendor: 'Sigma',
      catalog: 'S7653',
      units: 'g'
    },
    {
      id: '2',
      name: 'Tris Buffer',
      cas: '77-86-1',
      vendor: 'Fisher',
      catalog: 'BP152-1',
      units: 'g'
    }
  ];

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Order new primers',
      status: 'todo',
      due: '2024-01-20'
    },
    {
      id: '2',
      title: 'Analyze PCR results',
      status: 'doing',
      due: '2024-01-16'
    },
    {
      id: '3',
      title: 'Update lab notebook',
      status: 'done',
      due: '2024-01-15'
    }
  ];

  return (
    <Router>
      <div className="h-screen bg-background">
        <DualPaneLayout
          notes={mockNotes}
          tables={mockTables}
          projects={mockProjects}
          chemicals={mockChemicals}
          tasks={mockTasks}
        />
      </div>
    </Router>
  );
}

export default App;
