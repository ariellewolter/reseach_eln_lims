import React from 'react';

interface DualPaneLayoutProps {
  sidebar: React.ReactNode;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  leftTitle: React.ReactNode;
  rightTitle: React.ReactNode;
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  activeSide: 'left' | 'right';
  onChangeActiveSide: (side: 'left' | 'right') => void;
  onCloseLeft?: () => void;
  onCloseRight?: () => void;
  onSwapSides?: () => void;
  isSplit: boolean;
  splitPct: number;
}

export function DualPaneLayout({
  sidebar,
  sidebarOpen,
  onToggleSidebar,
  leftTitle,
  rightTitle,
  leftPane,
  rightPane,
  activeSide,
  onChangeActiveSide,
  onCloseLeft,
  onCloseRight,
  onSwapSides,
  isSplit,
  splitPct
}: DualPaneLayoutProps) {
  return (
    <div className="app-shell">
      <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        {sidebar}
      </div>
      <div className="workspace">
        <div className="workspace-header">
          <div className="header-actions">
            <button className="icon-btn" onClick={onToggleSidebar}>
              ☰
            </button>
            {isSplit && (
              <>
                <button 
                  className={`icon-btn ${activeSide === 'left' ? 'active' : ''}`}
                  onClick={() => onChangeActiveSide('left')}
                >
                  L
                </button>
                <button 
                  className={`icon-btn ${activeSide === 'right' ? 'active' : ''}`}
                  onClick={() => onChangeActiveSide('right')}
                >
                  R
                </button>
                {onSwapSides && (
                  <button className="icon-btn" onClick={onSwapSides}>
                    ⇄
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="workspace-grid">
          {isSplit ? (
            <div className="dual-pane" style={{ '--left': `${splitPct}%`, '--right': `${100 - splitPct}%` } as any}>
              <div className="pane">
                <div className="pane-tab">
                  {leftTitle}
                  {onCloseLeft && (
                    <button onClick={onCloseLeft}>✕</button>
                  )}
                </div>
                <div className="pane-content">
                  {leftPane}
                </div>
              </div>
              <div className="divider"></div>
              <div className="pane">
                <div className="pane-tab">
                  {rightTitle}
                  {onCloseRight && (
                    <button onClick={onCloseRight}>✕</button>
                  )}
                </div>
                <div className="pane-content">
                                  {rightPane}
                </div>
              </div>
            </div>
          ) : (
            <div className="single-pane">
              <div className="pane">
                <div className="pane-tab">
                  {leftTitle}
                </div>
                <div className="pane-content">
                  {leftPane}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
