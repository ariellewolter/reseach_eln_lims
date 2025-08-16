import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Star, Eye, FileText, Search, Bold, Italic, List, 
  Quote, Hash, Link, Code, User, Tag
} from 'lucide-react';

// Mock data - in real app this would come from your API
const mockNote = {
  id: '1',
  title: 'Meeting Notes - Project Alpha',
  markdown: `# Project Alpha Meeting Notes
*Date: January 10, 2025*
*Attendees: Sarah Chen, Dr. Rodriguez, Alex Kim*

## Key Discussion Points

### Synthesis Protocol Update
- **Current status**: Protocol v2.1 showing 78% yield
- **Target**: Achieve >85% yield by end of month
- Need to optimize temperature and reaction time
- Sarah will run additional trials this week

### Budget Review
The Q1 budget allocation needs adjustment:

| Category | Allocated | Spent | Remaining |
|----------|-----------|-------|-----------|
| Materials | $15,000 | $8,200 | $6,800 |
| Equipment | $25,000 | $22,100 | $2,900 |
| Personnel | $45,000 | $11,250 | $33,750 |

**Action Items:**
1. [ ] Sarah: Run 3 optimization trials by Friday
2. [ ] Dr. Rodriguez: Review literature for similar protocols
3. [ ] Alex: Order additional glassware (due to breakage)
4. [x] Schedule follow-up meeting for next week

### Literature Review Findings
Key papers identified:
- *Chen et al. (2024)*: Novel catalytic approach showing promise
- *Johnson & Smith (2023)*: Similar reaction conditions, different yields
- *Rodriguez et al. (2024)*: Temperature optimization strategies

> **Note**: The Rodriguez paper has excellent methodology we should consider adopting.

## Next Steps
1. **Immediate** (this week):
   - Complete optimization trials
   - Finalize equipment orders
   - Review and implement literature recommendations

2. **Short-term** (next 2 weeks):
   - Scale up successful protocols
   - Begin documentation for publication
   - Plan Phase 2 experiments

3. **Long-term** (next month):
   - Submit manuscript draft
   - Present findings at departmental seminar
   - Prepare for collaboration discussions

---
**Meeting Rating**: ⭐⭐⭐⭐⭐ Very productive!
**Next Meeting**: January 17, 2025 @ 2:00 PM`,
  projectId: 'p1',
  tags: ['meeting', 'planning', 'synthesis'],
  starred: true,
  createdAt: '2025-01-10T14:30:00Z',
  updatedAt: '2025-01-10T15:45:00Z',
  wordCount: 387,
  readingTime: 2,
  collaborators: ['sarah.chen@lab.edu', 'alex.kim@lab.edu'],
  version: 3,
  autoSaved: '2025-01-10T15:44:30Z'
};

const mockProjects = [
  { id: 'p1', name: 'Project Alpha', color: 'var(--blue)' },
  { id: 'p2', name: 'Literature Survey', color: 'var(--green)' },
  { id: 'p3', name: 'Method Development', color: 'var(--purple)' }
];

const mockTags = [
  'meeting', 'planning', 'synthesis', 'protocol', 'literature', 
  'data', 'analysis', 'optimization', 'results', 'ideas'
];

interface NotePageProps {
  noteId?: string;
  onSave?: (note: any) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export default function NotePage({ 
  noteId = '1',
  onSave = () => {},
  onDelete = () => {},
  onClose = () => {}
}: NotePageProps) {
  // Initialize with empty note if no noteId provided (for new notes)
  const [note, setNote] = useState(() => {
    if (noteId === 'new' || noteId === '1') {
      return {
        ...mockNote,
        markdown: '', // Start with empty content for new notes
        title: 'Untitled Note',
        autoSaved: null
      };
    }
    return mockNote;
  });
  const [showPreview, setShowPreview] = useState(false); // Force edit mode
  
  // Debug log to see what's happening
  console.log('NotePage render - showPreview:', showPreview, 'noteId:', noteId);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState(new Set(note.tags));
  const [selectedProject, setSelectedProject] = useState<string | null>(note.projectId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      // Auto-save whenever content changes (including empty notes)
      handleAutoSave();
    }, 2000); // Reduced from 3 seconds to 2 seconds for faster auto-save
    return () => clearTimeout(autoSaveTimer);
  }, [note.markdown]);

  // Calculate reading stats
  const stats = useMemo(() => {
    const words = note.markdown.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const lines = note.markdown.split('\n').length;
    const characters = note.markdown.length;
    return { words, readingTime, lines, characters };
  }, [note.markdown]);

  const handleAutoSave = async () => {
    try {
      // Simulate auto-save delay
      await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay
      
      // Update the note with auto-save timestamp
      setNote(prev => ({ 
        ...prev, 
        autoSaved: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(note);
      }
      
      console.log('Auto-saved at:', new Date().toISOString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };



  const handleTitleChange = (newTitle: string) => {
    setNote(prev => ({ ...prev, title: newTitle }));
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setNote(prev => ({ ...prev, markdown: newMarkdown }));
  };

  const handleToggleStar = () => {
    setNote(prev => ({ ...prev, starred: !prev.starred }));
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = note.markdown.substring(start, end);
    const replacement = selectedText || placeholder;
    const newText = note.markdown.substring(0, start) + 
                   before + replacement + after + 
                   note.markdown.substring(end);
    
    handleMarkdownChange(newText);
    
    setTimeout(() => {
      const newCursorPos = start + before.length + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
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

  // Simple markdown to HTML conversion for preview
  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 24px; margin: 20px 0 12px 0; color: var(--text-0); font-weight: 600;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 20px; margin: 16px 0 10px 0; color: var(--text-0); font-weight: 600;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 16px; margin: 14px 0 8px 0; color: var(--text-0); font-weight: 600;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-0); font-weight: 600;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: var(--text-1);">$1</em>')
      .replace(/^\- (.*$)/gm, '<li style="margin: 4px 0; color: var(--text-0);">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul style="margin: 12px 0; padding-left: 24px;">$1</ul>')
      .replace(/^\> (.*$)/gm, '<blockquote style="border-left: 3px solid var(--accent); padding-left: 16px; margin: 12px 0; color: var(--text-1); font-style: italic;">$1</blockquote>')
      .replace(/`(.*?)`/g, '<code style="background: var(--bg-2); padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; color: var(--text-0);">$1</code>')
      .replace(/\n\n/g, '<p style="margin: 16px 0 0 0;"></p>')
      .replace(/\n/g, '<br>');
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**', 'bold text'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*', 'italic text'), tooltip: 'Italic' },
    { icon: List, action: () => insertMarkdown('- ', '', 'list item'), tooltip: 'List' },
    { icon: Quote, action: () => insertMarkdown('> ', '', 'quote'), tooltip: 'Quote' },
    { icon: Hash, action: () => insertMarkdown('## ', '', 'heading'), tooltip: 'Heading' },
    { icon: Link, action: () => insertMarkdown('[', '](url)', 'link text'), tooltip: 'Link' },
    { icon: Code, action: () => insertMarkdown('`', '`', 'code'), tooltip: 'Code' }
  ];

  return (
    <div className="pane">
      {/* Pane Tab - integrates with your dual-pane system */}
      <div className="pane-tab">
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            type="text"
            value={note.title}
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
            placeholder="Note title..."
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
              fill={note.starred ? 'var(--orange)' : 'none'}
              style={{ color: note.starred ? 'var(--orange)' : 'currentColor' }} 
            />
          </button>



          <button
            className={`icon-btn ${showMetadata ? 'active' : ''}`}
            onClick={() => setShowMetadata(!showMetadata)}
            title="Document info"
          >
            <FileText size={14} />
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
        {/* Note Info */}
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>Updated {formatDate(note.updatedAt)}</span>
            <span>•</span>
            <span>{stats.words} words</span>
            <span>•</span>
            <span>{stats.readingTime} min read</span>
            {note.autoSaved && (
              <>
                <span>•</span>
                <span style={{ color: 'var(--green)' }}>
                  Auto-saved {formatDate(note.autoSaved)}
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

            <span>v{note.version}</span>
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
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              className="icon-btn"
              onClick={button.action}
              title={button.tooltip}
              style={{ padding: '6px' }}
            >
              <button.icon size={14} />
            </button>
          ))}

          <div style={{ 
            width: '1px', 
            height: '20px', 
            background: 'var(--border)', 
            margin: '0 8px' 
          }} />

          <button
            className={`icon-btn ${showFindReplace ? 'active' : ''}`}
            onClick={() => setShowFindReplace(!showFindReplace)}
            title="Find & Replace"
            style={{ padding: '6px 8px' }}
          >
            <Search size={14} />
          </button>

          <button
            className={`icon-btn ${showMetadata ? 'active' : ''}`}
            onClick={() => setShowMetadata(!showMetadata)}
            title="Toggle metadata"
            style={{ padding: '6px 8px' }}
          >
            <Tag size={14} />
          </button>
        </div>

        {/* Find & Replace */}
        {showFindReplace && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-1)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Find..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '6px 8px',
                color: 'var(--text-0)',
                fontSize: '12px',
                width: '120px'
              }}
            />
            <input
              type="text"
              placeholder="Replace..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '6px 8px',
                color: 'var(--text-0)',
                fontSize: '12px',
                width: '120px'
              }}
            />
            <button 
              className="icon-btn"
              style={{ 
                background: 'var(--accent)',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              Replace
            </button>
          </div>
        )}

        {/* Main Editor/Preview Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Editor/Preview */}
          <div style={{ 
            flex: showMetadata ? 2 : 1, 
            display: 'flex', 
            flexDirection: 'column'
          }}>
            <textarea
              ref={textareaRef}
              className="note-textarea"
              value={note.markdown}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setCursorPosition(target.selectionStart);
              }}
              placeholder="Start writing your note..."
              style={{ 
                flex: 1, 
                background: 'var(--bg-0)', 
                border: 'none', 
                outline: 'none',
                padding: '24px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--text-0)',
                fontFamily: 'inherit',
                resize: 'none'
              }}
            />
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
                Document Info
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
                    <span style={{ color: 'var(--text-1)' }}>Words:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.words.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-1)' }}>Characters:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.characters.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-1)' }}>Lines:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.lines}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-1)' }}>Reading time:</span>
                    <span style={{ color: 'var(--text-0)', fontWeight: '500' }}>
                      {stats.readingTime} min
                    </span>
                  </div>
                </div>
              </div>

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
                  {Array.from(selectedTags).map(tag => (
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

              {/* Collaborators */}
              {note.collaborators && note.collaborators.length > 0 && (
                <div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '11px', 
                    color: 'var(--text-1)',
                    fontWeight: '500',
                    textTransform: 'uppercase'
                  }}>
                    Collaborators
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {note.collaborators.map(email => (
                      <div 
                        key={email}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'var(--bg-2)',
                          borderRadius: '4px'
                        }}
                      >
                        <User size={12} style={{ color: 'var(--text-1)' }} />
                        <span style={{ 
                          color: 'var(--text-0)', 
                          fontSize: '11px',
                          flex: 1
                        }}>
                          {email}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
