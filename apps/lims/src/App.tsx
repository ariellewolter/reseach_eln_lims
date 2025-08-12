import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DualPaneLayout } from '@research/ui';
import { Note, TableDoc, Project, Chemical, Task, Lab, User } from '@research/types';

function App() {
  // Mock data for LIMS development
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Lab Meeting Notes - 2024-01-15',
      markdown: '# Lab Meeting Notes\n\n## Agenda\n- Review of ongoing projects\n- Equipment maintenance schedule\n- Safety protocols update\n\n## Action Items\n- Schedule equipment calibration\n- Update chemical inventory\n- Review safety procedures',
      createdAt: '2024-01-15T14:00:00Z',
      updatedAt: '2024-01-15T15:30:00Z'
    },
    {
      id: '2',
      title: 'Equipment Maintenance Log',
      markdown: '# Equipment Maintenance Log\n\n## Centrifuge\n- Last service: 2024-01-01\n- Next service: 2024-04-01\n- Status: Operational\n\n## Incubator\n- Last service: 2024-01-10\n- Next service: 2024-04-10\n- Status: Operational',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ];

  const mockTables: TableDoc[] = [
    {
      id: '1',
      title: 'Equipment Inventory',
      data: [
        ['Equipment', 'Model', 'Serial #', 'Location', 'Status', 'Last Service'],
        ['Centrifuge', 'Eppendorf 5810R', 'CP001', 'Lab A', 'Operational', '2024-01-01'],
        ['Incubator', 'Thermo Scientific', 'INC001', 'Lab B', 'Operational', '2024-01-10'],
        ['Microscope', 'Olympus BX53', 'MIC001', 'Lab C', 'Maintenance', '2023-12-15']
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Chemical Safety Data',
      data: [
        ['Chemical', 'CAS', 'Hazard Class', 'Storage Location', 'Expiry Date'],
        ['Sodium Azide', '26628-22-8', 'Toxic', 'Fridge A', '2024-06-01'],
        ['Formaldehyde', '50-00-0', 'Carcinogen', 'Fume Hood', '2024-08-01'],
        ['Ethidium Bromide', '1239-45-8', 'Mutagen', 'Waste Container', 'N/A']
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ];

  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Lab Safety Audit',
      description: 'Annual safety audit and protocol review',
      ownerId: 'admin1'
    },
    {
      id: '2',
      title: 'Equipment Calibration',
      description: 'Quarterly equipment calibration and maintenance',
      ownerId: 'tech1'
    }
  ];

  const mockChemicals: Chemical[] = [
    {
      id: '1',
      name: 'Sodium Azide',
      cas: '26628-22-8',
      vendor: 'Sigma',
      catalog: 'S2002',
      units: 'g'
    },
    {
      id: '2',
      name: 'Formaldehyde',
      cas: '50-00-0',
      vendor: 'Fisher',
      catalog: 'F79-500',
      units: 'mL'
    }
  ];

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Schedule equipment calibration',
      status: 'todo',
      assigneeId: 'tech1',
      due: '2024-01-25'
    },
    {
      id: '2',
      title: 'Update safety protocols',
      status: 'doing',
      assigneeId: 'admin1',
      due: '2024-01-20'
    },
    {
      id: '3',
      title: 'Chemical inventory audit',
      status: 'done',
      assigneeId: 'tech2',
      due: '2024-01-15'
    }
  ];

  const mockLabs: Lab[] = [
    {
      id: '1',
      name: 'Molecular Biology Lab'
    },
    {
      id: '2',
      name: 'Cell Culture Lab'
    },
    {
      id: '3',
      name: 'Analytical Chemistry Lab'
    }
  ];

  const mockUsers: User[] = [
    {
      id: 'admin1',
      name: 'Dr. Smith',
      email: 'smith@university.edu',
      role: 'pi',
      labId: '1'
    },
    {
      id: 'tech1',
      name: 'Jane Doe',
      email: 'jane.doe@university.edu',
      role: 'tech',
      labId: '1'
    },
    {
      id: 'student1',
      name: 'John Student',
      email: 'john.student@university.edu',
      role: 'student',
      labId: '1'
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
          labs={mockLabs}
          users={mockUsers}
        />
      </div>
    </Router>
  );
}

export default App;
