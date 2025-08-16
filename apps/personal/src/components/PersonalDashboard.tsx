import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Table, Bookmark, TrendingUp, Search, Filter, 
  RefreshCw, AlertCircle, Plus, Calendar, CheckCircle, Clock
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function PersonalDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { data, loading, error, refresh } = useDashboard();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--blue)';
      case 'review': return 'var(--orange)';
      case 'completed': return 'var(--green)';
      default: return 'var(--text-1)';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--orange)';
      case 'medium': return 'var(--blue)';
      case 'low': return 'var(--green)';
      default: return 'var(--text-1)';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-0)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-1)', marginTop: '16px' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-0)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: 'var(--orange)' }} />
          <p style={{ color: 'var(--text-1)', marginTop: '16px' }}>Error loading dashboard</p>
          <p style={{ color: 'var(--text-1)', marginTop: '8px', fontSize: '14px' }}>{error}</p>
          <button 
            onClick={refresh}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-0)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-1)' }}>No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100%', 
      overflow: 'auto', 
      padding: '40px 24px 24px 24px',
      background: 'var(--bg-0)'
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: '600',
              color: 'var(--text-0)' 
            }}>
              Personal Dashboard
            </h1>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: 'var(--text-1)',
              fontSize: '16px'
            }}>
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={refresh}
              style={{
                background: 'var(--bg-2)',
                color: 'var(--text-0)',
                border: '1px solid var(--border)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Refresh dashboard"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={() => navigate('/workspace')}
              style={{
                background: '#b18cff',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 14px 0 rgba(177, 140, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(177, 140, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(177, 140, 255, 0.3)';
              }}
            >
              <FileText size={16} />
              Workspace
            </button>
            <button 
              onClick={() => navigate('/notes')}
              style={{
                background: '#61a8ff',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 14px 0 rgba(97, 168, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(97, 168, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(97, 168, 255, 0.3)';
              }}
            >
              <FileText size={16} />
              Side by Side Notes
            </button>
            <button 
              onClick={() => navigate('/calendar')}
              style={{
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 14px 0 rgba(255, 107, 107, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(255, 107, 107, 0.3)';
              }}
            >
              <Calendar size={16} />
              Calendar
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px'
        }}>
          <button 
            onClick={() => navigate('/workspace')}
            style={{
              background: 'var(--bg-2)',
              color: 'var(--text-0)',
              border: '1px solid var(--border)',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
            <Plus size={16} />
            New Note
          </button>
          <button 
            onClick={() => navigate('/workspace')}
            style={{
              background: 'var(--bg-2)',
              color: 'var(--text-0)',
              border: '1px solid var(--border)',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
            <Table size={16} />
            New Table
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[
            { label: 'Total Notes', value: data.stats.totalNotes, icon: FileText, color: 'var(--blue)' },
            { label: 'Total Tables', value: data.stats.totalTables, icon: Table, color: 'var(--green)' },
            { label: 'Active Projects', value: data.stats.activeProjects, icon: Bookmark, color: 'var(--purple)' },
            { label: 'Weekly Activity', value: data.stats.weeklyActivity, icon: TrendingUp, color: 'var(--orange)' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                background: `${stat.color}20`,
                borderRadius: '10px',
                padding: '12px',
                display: 'flex'
              }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: 'var(--text-0)',
                  lineHeight: 1
                }}>
                  {stat.value}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-1)',
                  marginTop: '4px'
                }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-1)'
            }} />
            <input
              type="text"
              placeholder="Search notes, tables, and projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-0)',
                fontSize: '14px'
              }}
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{
              padding: '12px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-0)',
              fontSize: '14px'
            }}
          >
            <option value="all">All Items</option>
            <option value="notes">Notes Only</option>
            <option value="tables">Tables Only</option>
            <option value="recent">Recent</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        height: 'calc(100% - 280px)'
      }}>
        {/* Left Column - Recent Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent Notes */}
          <div style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            flex: 1
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600',
                color: 'var(--text-0)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FileText size={20} style={{ color: 'var(--blue)' }} />
                Recent Notes
              </h3>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.recentNotes.map(note => (
                <div key={note.id} style={{
                  padding: '12px',
                  background: 'var(--bg-2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-0)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: 'var(--text-0)',
                      marginBottom: '4px'
                    }}>
                      {note.title}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-1)'
                    }}>
                      {note.updatedAt ? formatDate(note.updatedAt) : 'No date'}
                    </div>
                  </div>
                  <FileText size={16} style={{ color: 'var(--text-1)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tables */}
          <div style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            flex: 1
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600',
                color: 'var(--text-0)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Table size={20} style={{ color: 'var(--green)' }} />
                Recent Tables
              </h3>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.recentTables.map(table => (
                <div key={table.id} style={{
                  padding: '12px',
                  background: 'var(--bg-2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-0)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: 'var(--text-0)',
                      marginBottom: '4px'
                    }}>
                      {table.title}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-1)'
                    }}>
                      {table.updatedAt ? formatDate(table.updatedAt) : 'No date'}
                    </div>
                  </div>
                  <Table size={16} style={{ color: 'var(--text-1)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Projects & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Projects */}
          <div style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: '600',
              color: 'var(--text-0)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Bookmark size={20} style={{ color: 'var(--purple)' }} />
              Active Projects
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.projects.map(project => (
                <div key={project.id} style={{
                  padding: '16px',
                  background: 'var(--bg-2)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: 'var(--text-0)'
                    }}>
                      {project.title}
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: 'var(--blue)20',
                      color: 'var(--blue)'
                    }}>
                      active
                    </span>
                  </div>
                  {project.description && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-1)',
                      marginBottom: '8px'
                    }}>
                      {project.description}
                    </div>
                  )}
                  <div style={{ 
                    background: 'var(--bg-0)',
                    borderRadius: '4px',
                    height: '6px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      background: 'var(--blue)',
                      height: '100%',
                      borderRadius: '4px',
                      width: '75%',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-1)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>75% complete</span>
                    <span>In progress</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Tasks */}
          <div style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: '600',
              color: 'var(--text-0)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Clock size={20} style={{ color: 'var(--orange)' }} />
              Today's Tasks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.todayTasks.map(task => (
                <div key={task.id} style={{
                  padding: '12px',
                  background: 'var(--bg-2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input type="checkbox" style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--accent)'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-0)',
                      marginBottom: '2px'
                    }}>
                      {task.title}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{task.dueDate}</span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: `${getPriorityColor(task.status)}20`,
                        color: getPriorityColor(task.status)
                      }}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
