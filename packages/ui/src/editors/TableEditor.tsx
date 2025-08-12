import React from 'react';

interface TableEditorProps {
  data: string[][];
  onChange: (data: string[][]) => void;
}

export function TableEditor({ data, onChange }: TableEditorProps) {
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    onChange(newData);
  };

  const addRow = () => {
    const newRow = new Array(data[0]?.length || 1).fill('');
    onChange([...data, newRow]);
  };

  const addColumn = () => {
    const newData = data.map(row => [...row, '']);
    onChange(newData);
  };

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={addRow}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px',
            fontSize: '12px'
          }}
        >
          + Row
        </button>
        <button 
          onClick={addColumn}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          + Column
        </button>
      </div>
      <div style={{ overflow: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-0)',
                        color: 'var(--text-0)',
                        fontSize: '14px'
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
