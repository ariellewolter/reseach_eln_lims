import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, FileText, CheckSquare, Calendar, Target } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 1000,
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      padding: '2px',
      display: 'flex',
      gap: '1px',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <Link
        to="/"
        style={{
          padding: '6px',
          borderRadius: '4px',
          textDecoration: 'none',
          color: location.pathname === '/' ? 'white' : 'var(--text-1)',
          background: location.pathname === '/' ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title="Dashboard"
      >
        <Home size={16} />
      </Link>
      <Link
        to="/workspace"
        style={{
          padding: '6px',
          borderRadius: '4px',
          textDecoration: 'none',
          color: location.pathname === '/workspace' ? 'white' : 'var(--text-1)',
          background: location.pathname === '/workspace' ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title="Workspace"
      >
        <Grid3X3 size={16} />
      </Link>
      <Link
        to="/notes"
        style={{
          padding: '6px',
          borderRadius: '4px',
          textDecoration: 'none',
          color: location.pathname === '/notes' ? 'white' : 'var(--text-1)',
          background: location.pathname === '/notes' ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title="Notes"
      >
        <FileText size={16} />
      </Link>
      <Link
        to="/tasks"
        style={{
          padding: '6px',
          borderRadius: '4px',
          textDecoration: 'none',
          color: location.pathname === '/tasks' ? 'white' : 'var(--text-1)',
          background: location.pathname === '/tasks' ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title="Tasks"
      >
        <CheckSquare size={16} />
      </Link>
      <Link
        to="/calendar"
        style={{
          padding: '6px',
          borderRadius: '4px',
          textDecoration: 'none',
          color: location.pathname === '/calendar' ? 'white' : 'var(--text-1)',
          background: location.pathname === '/calendar' ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title="Calendar"
      >
        <Calendar size={16} />
      </Link>
      <Link
        to="/day-focus"
        style={{
          padding: '6px',
          borderRadius: '4px',
          textDecoration: 'none',
          color: location.pathname === '/day-focus' ? 'white' : 'var(--text-1)',
          background: location.pathname === '/day-focus' ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title="Day Focus"
      >
        <Target size={16} />
      </Link>
    </div>
  );
}
