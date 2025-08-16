import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Save, Star, Download, Upload, Filter, Search, SortAsc, SortDesc,
  Plus, Minus, MoreHorizontal, Copy, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Hash,
  FileText, BarChart3, PieChart, TrendingUp, Calculator, CheckSquare
} from 'lucide-react';
import { MetaBar } from './MetaBar';
import type { TaskCreationHook } from '../hooks/useTaskCreation';

// Mock data - in real app this would come from your API
const mockTable = {
  id: '3',
  title: 'Compound Activity Data',
  data: [
    ['Compound ID', 'IC50 (nM)', 'Selectivity', 'Solubility (μM)', 'Status', 'Notes'],
    ['CMP-001', '12.5', '85%', '450', 'Active', 'Promising lead'],
    ['CMP-002', '8.2', '72%', '320', 'Active', 'Good selectivity'],
    ['CMP-003', '45.1', '91%', '780', 'Active', 'High solubility'],
    ['CMP-004', '156.0', '45%', '120', 'Inactive', 'Poor selectivity'],
    ['CMP-005', '3.4', '88%', '890', 'Active', 'Best candidate'],
    ['CMP-006', '89.7', '78%', '650', 'Moderate', 'Needs optimization'],
    ['CMP-007', '22.1', '82%', '340', 'Active', 'Backup compound'],
    ['CMP-008', '234.5', '38%', '90', 'Inactive', 'Poor profile'],
    ['CMP-009', '15.8', '76%', '520', 'Active', 'Moderate activity'],
    ['CMP-010', '6.7', '94%', '410', 'Active', 'Excellent profile']
  ],
  columns: [
    { id: 'compound', type: 'text', width: 120, align: 'left' },
    { id: 'ic50', type: 'number', width: 100, align: 'right', format: '0.0' },
    { id: 'selectivity', type: 'percentage', width: 100, align: 'center' },
    { id: 'solubility', type: 'number', width: 120, align: 'right', format: '0' },
    { id: 'status', type: 'select', width: 100, align: 'center', options: ['Active', 'Inactive', 'Moderate'] },
    { id: 'notes', type: 'text', width: 150, align: 'left' }
  ],
  projectId: 'p1',
  tags: ['data', 'analysis', 'compounds'],
  starred: true,
  createdAt: '2025-01-09T16:45:00Z',
  updatedAt: '2025-01-10T11:30:00Z',
  version: 2,
  autoSaved: '2025-01-10T11:28:45Z'
};

const mockProjects = [
  { id: 'p1', name: 'Project Alpha', color: 'var(--blue)' },
  { id: 'p2', name: 'Literature Survey', color: 'var(--green)' },
  { id: 'p3', name: 'Method Development', color: 'var(--purple)' }
];

const mockTags = [
  'data', 'analysis', 'compounds', 'results', 'screening', 
  'assay', 'kinetics', 'binding', 'selectivity', 'activity'
];

interface TableEditorProps {
  tableId?: string;
  table?: any; // The actual table data to edit
  onSave?: (table: any) => void;
  onDelete?: () => void;
  onClose?: () => void;
  sourceFileId?: string;
  sourceFileTitle?: string;
  onCreateTask?: TaskCreationHook;
  scheduleButton?: React.ReactNode;
}

export function TableEditor({ 
  tableId = '3',
  table: initialTable,
  onSave = () => {},
  onDelete = () => {},
  onClose = () => {},
  sourceFileId,
  sourceFileTitle,
  onCreateTask,
  scheduleButton,
}: TableEditorProps) {
  const [table, setTable] = useState(initialTable || mockTable);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ column: number; direction: 'asc' | 'desc' } | null>(null);
  const [filterConfig, setFilterConfig] = useState<Record<number, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState(new Set<string>(table.tags || []));
  const [selectedProject, setSelectedProject] = useState<string | null>(table.projectId);
  const [showFormulas, setShowFormulas] = useState(false);
  const [clipboard, setClipboard] = useState(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLInputElement>>({});
  
  // Initialize columns if they don't exist or if they're shorter than the data
  useEffect(() => {
    if (table.data && table.data.length > 0 && table.data[0]) {
      const dataColumnCount = table.data[0].length;
      const currentColumnCount = table.columns?.length || 0;
      
      if (!table.columns || currentColumnCount < dataColumnCount) {
        const defaultColumns = table.data[0].map((_: any, index: number) => {
          // Use existing column if available, otherwise create default
          if (table.columns && table.columns[index]) {
            return table.columns[index];
          }
          return {
            id: `col_${index}`,
            type: 'text',
            width: 120,
            align: 'left'
          };
        });
        setTable((prev: any) => ({ ...prev, columns: defaultColumns }));
      }
    }
  }, [table.columns, table.data]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (table.data !== mockTable.data) {
        handleAutoSave();
      }
    }, 3000);
    return () => clearTimeout(autoSaveTimer);
  }, [table.data]);

  // Calculate table stats
  const stats = useMemo(() => {
    if (!table.data || table.data.length === 0) {
      return { rows: 0, cols: 0, cells: 0, nonEmptyCells: 0 };
    }
    
    const rows = table.data.length - 1; // Exclude header
    const cols = table.data[0]?.length || 0;
    const cells = rows * cols;
    const nonEmptyCells = table.data.slice(1).reduce((count: number, row: any[]) => 
      count + row.filter((cell: any) => cell && cell.toString().trim()).length, 0
    );
    
    return { rows, cols, cells, nonEmptyCells };
  }, [table.data]);

  const handleAutoSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ensure columns array matches the data before saving
    if (table.data && table.data.length > 0 && table.data[0]) {
      const dataColumnCount = table.data[0].length;
      if (!table.columns || table.columns.length !== dataColumnCount) {
        const adjustedColumns = Array.from({ length: dataColumnCount }, (_, index) => {
          if (table.columns && table.columns[index]) {
            return table.columns[index];
          }
          return {
            id: `col_${index}`,
            type: 'text',
            width: 120,
            align: 'left'
          };
        });
        setTable((prev: any) => ({ ...prev, columns: adjustedColumns, autoSaved: new Date().toISOString() }));
      } else {
        setTable((prev: any) => ({ ...prev, autoSaved: new Date().toISOString() }));
      }
    } else {
      setTable((prev: any) => ({ ...prev, autoSaved: new Date().toISOString() }));
    }
    
    setIsSaving(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ensure columns array matches the data before saving
    if (table.data && table.data.length > 0 && table.data[0]) {
      const dataColumnCount = table.data[0].length;
      if (!table.columns || table.columns.length !== dataColumnCount) {
        const adjustedColumns = Array.from({ length: dataColumnCount }, (_, index) => {
          if (table.columns && table.columns[index]) {
            return table.columns[index];
          }
          return {
            id: `col_${index}`,
            type: 'text',
            width: 120,
            align: 'left'
          };
        });
        setTable((prev: any) => ({ 
          ...prev, 
          columns: adjustedColumns,
          updatedAt: new Date().toISOString(),
          version: prev.version + 1
        }));
      } else {
        setTable((prev: any) => ({ 
          ...prev, 
          updatedAt: new Date().toISOString(),
          version: prev.version + 1
        }));
      }
    } else {
      setTable((prev: any) => ({ 
        ...prev, 
        updatedAt: new Date().toISOString(),
        version: prev.version + 1
      }));
    }
    
    setIsSaving(false);
    onSave(table);
  };

  const handleTitleChange = (newTitle: string) => {
    setTable((prev: any) => ({ ...prev, title: newTitle }));
  };

  const handleToggleStar = () => {
    setTable((prev: any) => ({ ...prev, starred: !prev.starred }));
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (!table.data) return;
    
    const newData = [...table.data];
    if (!newData[rowIndex]) {
      newData[rowIndex] = [];
    }
    
    // Ensure the row has enough columns
    while (newData[rowIndex].length <= colIndex) {
      newData[rowIndex].push('');
    }
    
    newData[rowIndex][colIndex] = value;
    
    // Ensure columns array matches the data
    if (table.columns && table.columns.length !== newData[0]?.length) {
      const adjustedColumns = Array.from({ length: newData[0]?.length || 0 }, (_, index) => {
        if (table.columns && table.columns[index]) {
          return table.columns[index];
        }
        return {
          id: `col_${index}`,
          type: 'text',
          width: 120,
          align: 'left'
        };
      });
      setTable((prev: any) => ({ ...prev, data: newData, columns: adjustedColumns }));
    } else {
      setTable((prev: any) => ({ ...prev, data: newData }));
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!table.data || rowIndex < 0 || colIndex < 0) return;
    
    // Ensure the cell coordinates are within bounds
    if (rowIndex >= table.data.length || 
        (table.data[rowIndex] && colIndex >= table.data[rowIndex].length)) {
      return;
    }
    
    setSelectedCell({ row: rowIndex, col: colIndex });
    setSelectedRange(null);
  };

  const addRow = () => {
    if (!table.data || table.data.length === 0) {
      // If no data exists, create a new table with one row and one column
      const newData = [['Column 1'], ['']];
      const newColumns = [{
        id: 'col_0',
        type: 'text',
        width: 120,
        align: 'left'
      }];
      setTable((prev: any) => ({ ...prev, data: newData, columns: newColumns }));
      return;
    }
    
    const columnCount = table.data[0]?.length || 1;
    const newRow = new Array(columnCount).fill('');
    const newData = [...table.data, newRow];
    
    // Ensure columns exist and match the data
    if (!table.columns || table.columns.length < columnCount) {
      const newColumns = Array.from({ length: columnCount }, (_, index) => {
        if (table.columns && table.columns[index]) {
          return table.columns[index];
        }
        return {
          id: `col_${index}`,
          type: 'text',
          width: 120,
          align: 'left'
        };
      });
      setTable((prev: any) => ({ ...prev, data: newData, columns: newColumns }));
    } else {
      setTable((prev: any) => ({ ...prev, data: newData }));
    }
  };

  const addColumn = () => {
    if (!table.data || table.data.length === 0) {
      // If no data exists, create a new table with one column
      const newData = [['Column 1']];
      const newColumns = [{
        id: 'col_0',
        type: 'text',
        width: 120,
        align: 'left'
      }];
      setTable((prev: any) => ({ ...prev, data: newData, columns: newColumns }));
      return;
    }
    
    const newData = table.data.map((row: any[]) => [...row, '']);
    const currentColumns = table.columns || [];
    const newColumns = [...currentColumns, {
      id: `col_${currentColumns.length}`,
      type: 'text',
      width: 120,
      align: 'left'
    }];
    
    // Ensure all rows have the same number of columns
    const maxColumns = Math.max(...newData.map((row: any[]) => row.length));
    const paddedData = newData.map((row: any[]) => {
      while (row.length < maxColumns) {
        row.push('');
      }
      return row;
    });
    
    setTable((prev: any) => ({ ...prev, data: paddedData, columns: newColumns }));
  };

  const deleteRow = (rowIndex: number) => {
    if (rowIndex === 0) return; // Don't delete header
    if (!table.data || table.data.length === 0 || rowIndex < 0) return;
    
    // Ensure the row index is within bounds
    if (rowIndex >= table.data.length) return;
    
    const newData = table.data.filter((_: any, index: number) => index !== rowIndex);
    
    // Ensure columns array matches the data
    if (table.columns && table.columns.length !== newData[0]?.length) {
      const adjustedColumns = Array.from({ length: newData[0]?.length || 0 }, (_, index) => {
        if (table.columns && table.columns[index]) {
          return table.columns[index];
        }
        return {
          id: `col_${index}`,
          type: 'text',
          width: 120,
          align: 'left'
        };
      });
      setTable((prev: any) => ({ ...prev, data: newData, columns: adjustedColumns }));
    } else {
      setTable((prev: any) => ({ ...prev, data: newData }));
    }
  };

  const deleteColumn = (colIndex: number) => {
    if (!table.data || table.data.length === 0 || colIndex < 0) return;
    
    // Ensure the column index is within bounds
    if (table.data[0] && colIndex >= table.data[0].length) return;
    
    const newData = table.data.map((row: any[]) => row.filter((_: any, index: number) => index !== colIndex));
    const currentColumns = table.columns || [];
    const newColumns = currentColumns.filter((_: any, index: number) => index !== colIndex);
    
    // Ensure columns array matches the data
    if (newColumns.length !== newData[0]?.length) {
      const adjustedColumns = Array.from({ length: newData[0]?.length || 0 }, (_, index) => {
        if (newColumns[index]) {
          return newColumns[index];
        }
        return {
          id: `col_${index}`,
          type: 'text',
          width: 120,
          align: 'left'
        };
      });
      setTable((prev: any) => ({ ...prev, data: newData, columns: adjustedColumns }));
    } else {
      setTable((prev: any) => ({ ...prev, data: newData, columns: newColumns }));
    }
  };

  const handleSort = (colIndex: number) => {
    const currentSort = sortConfig?.column === colIndex ? sortConfig.direction : null;
    const newDirection = currentSort === 'asc' ? 'desc' : 'asc';
    
    if (!table.data || table.data.length === 0 || colIndex < 0) return;
    
    // Ensure the column index is within bounds
    if (table.data[0] && colIndex >= table.data[0].length) return;
    
    const headerRow = table.data[0];
    const dataRows = table.data.slice(1);
    
    const sortedRows = [...dataRows].sort((a, b) => {
      const aVal = a[colIndex] || '';
      const bVal = b[colIndex] || '';
      
      // Try to parse as numbers
      const aNum = parseFloat(aVal.toString().replace(/[^0-9.-]/g, ''));
      const bNum = parseFloat(bVal.toString().replace(/[^0-9.-]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      const aStr = aVal.toString().toLowerCase();
      const bStr = bVal.toString().toLowerCase();
      if (newDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
    
    const newData = [headerRow, ...sortedRows];
    
    // Ensure columns array matches the data
    if (table.columns && table.columns.length !== newData[0]?.length) {
      const adjustedColumns = Array.from({ length: newData[0]?.length || 0 }, (_, index) => {
        if (table.columns && table.columns[index]) {
          return table.columns[index];
        }
        return {
          id: `col_${index}`,
          type: 'text',
          width: 120,
          align: 'left'
        };
      });
      setTable((prev: any) => ({ ...prev, data: newData, columns: adjustedColumns }));
    } else {
      setTable((prev: any) => ({ ...prev, data: newData }));
    }
    
    setSortConfig({ column: colIndex, direction: newDirection });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCellValue = (value: string, column: any) => {
    if (!value) return '';
    
    // If no column info is available, return the value as-is
    if (!column) return value;
    
    switch (column.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return column.format === '0' ? num.toFixed(0) : num.toFixed(1);
      case 'percentage':
        return value.toString().includes('%') ? value : `${value}%`;
      default:
        return value;
    }
  };

  const getCellStyle = (rowIndex: number, colIndex: number): React.CSSProperties => {
    if (!table.data || !table.data[rowIndex]) {
      return {
        padding: '8px 12px',
        border: '1px solid var(--border)',
        background: 'var(--bg-0)',
        color: 'var(--text-0)',
        fontWeight: 'normal',
        textAlign: 'left',
        width: 120,
        minWidth: 120,
        fontSize: '13px',
        outline: 'none',
        cursor: 'cell'
      };
    }
    
    // Safely access column data, ensuring colIndex is within bounds
    const column = table.columns && colIndex < table.columns.length ? table.columns[colIndex] : null;
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
    const isHeader = rowIndex === 0;
    
    return {
      padding: '8px 12px',
      border: '1px solid var(--border)',
      background: isSelected ? 'var(--accent)20' : 
                  isHeader ? 'var(--bg-1)' : 'var(--bg-0)',
      color: isHeader ? 'var(--text-0)' : 'var(--text-0)',
      fontWeight: isHeader ? '500' : 'normal',
      textAlign: (column && column.align ? column.align as 'left' | 'center' | 'right' : 'left'),
      width: column && column.width ? column.width : 120,
      minWidth: column && column.width ? column.width : 120,
      fontSize: '13px',
      outline: isSelected ? '2px solid var(--accent)' : 'none',
      cursor: isHeader ? 'pointer' : 'cell'
    };
  };

  return (
    <div className="pane">
      {/* Pane Tab */}
      <div className="pane-tab">
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            type="text"
            value={table.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-0)',
              width: '100%',
              outline: 'none'
            }}
            placeholder="Table title..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="icon-btn"
            onClick={handleToggleStar}
            title="Toggle star"
          >
            <Star 
              size={14} 
              fill={table.starred ? 'var(--orange)' : 'none'}
              style={{ color: table.starred ? 'var(--orange)' : 'currentColor' }} 
            />
          </button>

          <button
            className={`icon-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          >
            <Filter size={14} />
          </button>

          <button
            className={`icon-btn ${showMetadata ? 'active' : ''}`}
            onClick={() => setShowMetadata(!showMetadata)}
            title="Table info"
          >
            <FileText size={14} />
          </button>

          <button
            className="icon-btn"
            onClick={handleSave}
            disabled={isSaving}
            title="Save table"
            style={{ opacity: isSaving ? 0.7 : 1 }}
          >
            <Save size={14} />
          </button>

          {onClose && (
            <button className="icon-btn" onClick={onClose} title="Close">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pane-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* MetaBar for date and tags */}
        <MetaBar
          date={table.createdAt}
          onDateChange={(date) => {
            // Handle date change if needed
            console.log('Date changed:', date);
          }}
          tags={table.tags || []}
          onTagsChange={(tags) => {
            // Handle tags change if needed
            console.log('Tags changed:', tags);
          }}
        />
        
        {/* Table Info */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-1)',
          borderBottom: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Updated {formatDate(table.updatedAt)}</span>
            <span>•</span>
            <span>{stats.rows} rows × {stats.cols} columns</span>
            <span>•</span>
            <span>{stats.nonEmptyCells} filled cells</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isSaving && <span style={{ color: 'var(--accent)' }}>Saving...</span>}
            <span>v{table.version}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-1)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          <button
            className="icon-btn"
            onClick={addRow}
            title="Add row"
            style={{ padding: '6px 8px' }}
          >
            <Plus size={14} />
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>Row</span>
          </button>

          <button
            className="icon-btn"
            onClick={addColumn}
            title="Add column"
            style={{ padding: '6px 8px' }}
          >
            <Plus size={14} />
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>Column</span>
          </button>

          <div style={{ 
            width: '1px', 
            height: '20px', 
            background: 'var(--border)', 
            margin: '0 8px' 
          }} />

          <button
            className="icon-btn"
            onClick={() => {/* Copy handler */}}
            title="Copy"
            style={{ padding: '6px' }}
          >
            <Copy size={14} />
          </button>

          <button
            className="icon-btn"
            onClick={() => {/* Paste handler */}}
            title="Paste"
            style={{ padding: '6px' }}
          >
            📋
          </button>

          <div style={{ 
            width: '1px', 
            height: '20px', 
            background: 'var(--border)', 
            margin: '0 8px' 
          }} />

          <button
            className="icon-btn"
            onClick={() => {/* Export handler */}}
            title="Export"
            style={{ padding: '6px 8px' }}
          >
            <Download size={14} />
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>Export</span>
          </button>

          <button
            className={`icon-btn ${showMetadata ? 'active' : ''}`}
            onClick={() => setShowMetadata(!showMetadata)}
            title="Toggle info panel"
            style={{ padding: '6px 8px' }}
          >
            <BarChart3 size={14} />
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>Info</span>
          </button>

          <div style={{ 
            width: '1px', 
            height: '20px', 
            background: 'var(--border)', 
            margin: '0 8px' 
          }} />

          {onCreateTask && (
            <button
              className="icon-btn"
              onClick={() => onCreateTask({ 
                pane: "active",
                sourceFileId,
                sourceFileTitle,
              })}
              title="Create Task from Selection (Cmd/Ctrl+Shift+T)"
              style={{ padding: '6px 8px' }}
            >
              <CheckSquare size={14} />
              <span style={{ marginLeft: '4px', fontSize: '12px' }}>Task</span>
            </button>
          )}

          <div style={{ 
            width: '1px', 
            height: '20px', 
            background: 'var(--border)', 
            margin: '0 8px' 
          }} />

          {scheduleButton}
        </div>

        {/* Search & Filters */}
        {showFilters && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-1)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Search size={14} style={{ color: 'var(--text-1)' }} />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '6px 8px',
                color: 'var(--text-0)',
                fontSize: '12px',
                width: '200px'
              }}
            />
            
            <div style={{ 
              width: '1px', 
              height: '20px', 
              background: 'var(--border)', 
              margin: '0 8px' 
            }} />

            <select
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '6px 8px',
                color: 'var(--text-0)',
                fontSize: '12px'
              }}
            >
              <option value="">Filter by status...</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="moderate">Moderate</option>
            </select>

            <button 
              className="icon-btn"
              style={{ 
                background: 'var(--accent)',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              Apply Filters
            </button>

            <button 
              className="icon-btn"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Main Table Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Table Container */}
          <div style={{ 
            flex: showMetadata ? 2 : 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div 
              ref={tableRef}
              style={{ 
                flex: 1, 
                overflow: 'auto',
                background: 'var(--bg-0)'
              }}
            >
              <table style={{ 
                borderCollapse: 'separate',
                borderSpacing: 0,
                width: 'fit-content',
                minWidth: '100%'
              }}>
                <tbody>
                  {table.data && table.data.length > 0 ? table.data.map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {/* Row number */}
                      <td style={{
                        background: 'var(--bg-1)',
                        border: '1px solid var(--border)',
                        padding: '8px 6px',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: 'var(--text-1)',
                        fontWeight: '500',
                        width: '40px',
                        minWidth: '40px',
                        position: 'sticky',
                        left: 0,
                        zIndex: rowIndex === 0 ? 3 : 2
                      }}>
                        {rowIndex === 0 ? '#' : rowIndex}
                      </td>
                      
                      {row.map((cell: any, colIndex: number) => {
                        const isHeader = rowIndex === 0;
                        return (
                          <td
                            key={colIndex}
                            style={getCellStyle(rowIndex, colIndex)}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setSelectedCell({ row: rowIndex, col: colIndex });
                              }
                            }}
                            tabIndex={0}
                            role="gridcell"
                                                         aria-selected={selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'true' : 'false'}
                            aria-label={`Cell at row ${rowIndex + 1}, column ${colIndex + 1}`}
                            data-row={rowIndex}
                            data-col={colIndex}
                            data-value={cell || ''}
                            data-type={isHeader ? 'header' : 'data'}
                            data-column-type={table.columns && colIndex < table.columns.length ? table.columns[colIndex]?.type : 'text'}
                            data-column-align={table.columns && colIndex < table.columns.length ? table.columns[colIndex]?.align : 'left'}
                            data-column-width={table.columns && colIndex < table.columns.length ? table.columns[colIndex]?.width : 120}
                            data-sortable={isHeader ? 'true' : 'false'}
                            data-editable={isHeader ? 'false' : 'true'}
                            data-sort-direction={sortConfig?.column === colIndex ? sortConfig.direction : 'none'}
                            data-filtered={filterConfig[colIndex] ? 'true' : 'false'}
                            data-search-match={searchTerm && cell && cell.toString().toLowerCase().includes(searchTerm.toLowerCase()) ? 'true' : 'false'}
                            data-empty={!cell || cell.toString().trim() === '' ? 'true' : 'false'}
                          >
                            {isHeader ? (
                              selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  gap: '4px'
                                }}>
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                    onBlur={() => setSelectedCell(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setSelectedCell(null);
                                      }
                                    }}
                                    autoFocus
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      outline: 'none',
                                      width: '100%',
                                      fontSize: '13px',
                                      color: 'var(--text-0)',
                                      fontWeight: '500'
                                    }}
                                  />
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSort(colIndex);
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'var(--text-1)',
                                        padding: '2px'
                                      }}
                                    >
                                      {sortConfig?.column === colIndex ? (
                                        sortConfig?.direction === 'asc' ? 
                                          <SortAsc size={12} /> : 
                                          <SortDesc size={12} />
                                      ) : (
                                        <SortAsc size={12} style={{ opacity: 0.3 }} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  gap: '4px'
                                }}>
                                  <span>{cell}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSort(colIndex);
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'var(--text-1)',
                                        padding: '2px'
                                      }}
                                    >
                                      {sortConfig?.column === colIndex ? (
                                        sortConfig?.direction === 'asc' ? 
                                          <SortAsc size={12} /> : 
                                          <SortDesc size={12} />
                                      ) : (
                                        <SortAsc size={12} style={{ opacity: 0.3 }} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )
                            ) : (
                              selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? (
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                  onBlur={() => setSelectedCell(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setSelectedCell(null);
                                    }
                                  }}
                                  autoFocus
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '13px',
                                    color: 'var(--text-0)'
                                  }}
                                />
                              ) : (
                                <span>
                                  {formatCellValue(cell, table.columns && colIndex < table.columns.length ? table.columns[colIndex] : null)}
                                </span>
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={1} style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: 'var(--text-1)',
                        fontSize: '14px'
                      }}>
                        No data available. Add columns to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Metadata Sidebar */}
          {showMetadata && (
            <div style={{
              width: '280px',
              background: 'var(--bg-1)',
              borderLeft: '1px solid var(--border)',
              padding: '16px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '14px', 
                color: 'var(--text-0)',
                fontWeight: '500'
              }}>
                Table Info
              </h3>

              {/* Stats */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '11px', 
                  color: 'var(--text-1)',
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}>
                  Statistics
                </h4>
                <div style={{ 
                  background: 'var(--bg-2)', 
                  borderRadius: '6px', 
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-1)' }}>Rows:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.rows}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-1)' }}>Columns:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.cols}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-1)' }}>Total cells:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.cells}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-1)' }}>Filled cells:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.nonEmptyCells} ({Math.round((stats.nonEmptyCells / stats.cells) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Cell Info */}
              {selectedCell && selectedCell.row >= 0 && selectedCell.col >= 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '11px', 
                    color: 'var(--text-1)',
                    fontWeight: '500',
                    textTransform: 'uppercase'
                  }}>
                    Selected Cell
                  </h4>
                  <div style={{ 
                    background: 'var(--bg-2)', 
                    borderRadius: '6px', 
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-1)' }}>Position:</span>
                      <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                        R{selectedCell ? selectedCell.row + 1 : 0}, C{selectedCell ? selectedCell.col + 1 : 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-1)' }}>Value:</span>
                      <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                        {selectedCell && table.data && table.data[selectedCell.row] ? table.data[selectedCell.row][selectedCell.col] || '' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-1)' }}>Type:</span>
                      <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                        {selectedCell && table.columns && selectedCell.col < table.columns.length ? table.columns[selectedCell.col]?.type : 'text'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Project */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '11px', 
                  color: 'var(--text-1)',
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}>
                  Project
                </h4>
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value || null)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '8px',
                    color: 'var(--text-0)',
                    fontSize: '12px'
                  }}
                >
                  <option value="">No project</option>
                  {mockProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '11px', 
                  color: 'var(--text-1)',
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}>
                  Tags
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {Array.from(selectedTags).map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => {
                          const newTags = new Set(selectedTags);
                          newTags.delete(tag);
                          setSelectedTags(newTags);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '14px',
                          height: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '10px'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedTags(prev => new Set([...prev, e.target.value]));
                      e.target.value = '';
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '6px',
                    color: 'var(--text-0)',
                    fontSize: '11px'
                  }}
                >
                  <option value="">Add tag...</option>
                  {mockTags.filter(tag => !selectedTags.has(tag)).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '11px', 
                  color: 'var(--text-1)',
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}>
                  Quick Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    className="icon-btn"
                    style={{ 
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <Download size={14} />
                    <span style={{ marginLeft: '8px' }}>Export CSV</span>
                  </button>
                  <button
                    className="icon-btn"
                    style={{ 
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <BarChart3 size={14} />
                    <span style={{ marginLeft: '8px' }}>Create Chart</span>
                  </button>
                  <button
                    className="icon-btn"
                    style={{ 
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <Calculator size={14} />
                    <span style={{ marginLeft: '8px' }}>Add Formula</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
