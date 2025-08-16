# NotePage Component

A comprehensive, flexible note-taking component designed to integrate seamlessly with your dual-pane system architecture.

## 🎯 Features

### Core Functionality
- **Rich Markdown Editor** with live preview toggle
- **Auto-save** every 3 seconds with visual feedback
- **Document Statistics** (word count, reading time, lines, characters)
- **Project & Tag Management** with visual tag editing
- **Collaborator Support** for team notes
- **Find & Replace** functionality
- **Star/Favorite** notes for quick access
- **Version Control** with automatic versioning

### Dual-Pane Integration
- **Universal Compatibility** - works in any pane configuration
- **Responsive Layout** - adapts to available space
- **Consistent Styling** - uses your global theme variables
- **Flexible Positioning** - left, right, or full-width layouts

## 🚀 Usage Examples

### Basic Usage
```tsx
import { NotePage } from './components';

// Simple single pane
<NotePage />

// With callbacks
<NotePage 
  noteId="123"
  onSave={(note) => console.log('Saved:', note)}
  onDelete={() => console.log('Deleted')}
  onClose={() => console.log('Closed')}
/>
```

### Dual-Pane Configurations

#### Single Pane (Full Workspace)
```tsx
<DualPaneLayout 
  leftPane={null} 
  rightPane={<NotePage />} 
  isSplit={false} 
/>
```

#### Left Pane with Sidebar
```tsx
<DualPaneLayout 
  leftPane={<NotePage />} 
  rightPane={<EnhancedSidebar />} 
/>
```

#### Right Pane with Sidebar
```tsx
<DualPaneLayout 
  leftPane={<EnhancedSidebar />} 
  rightPane={<NotePage />} 
/>
```

#### Side-by-Side Notes
```tsx
<DualPaneLayout 
  leftPane={<NotePage noteId="1" />} 
  rightPane={<NotePage noteId="2" />} 
/>
```

## 🎨 Styling & Theme

The component automatically uses your global CSS variables:
- `--bg-0`, `--bg-1`, `--bg-2` for backgrounds
- `--text-0`, `--text-1` for text colors
- `--border` for borders
- `--accent`, `--blue`, `--green`, `--purple`, `--orange` for accents

### CSS Classes Used
- `.pane` - Main container
- `.pane-tab` - Header tab with controls
- `.pane-content` - Content area
- `.icon-btn` - Button styling
- `.note-textarea` - Editor textarea

## 🔧 Props Interface

```tsx
interface NotePageProps {
  noteId?: string;           // Note identifier
  onSave?: (note: Note) => void;    // Save callback
  onDelete?: () => void;     // Delete callback
  onClose?: () => void;      // Close callback
}
```

## 📱 Responsive Behavior

- **Metadata Sidebar** automatically adjusts width based on available space
- **Toolbar** wraps buttons on narrow screens
- **Preview Mode** adapts to container dimensions
- **Find & Replace** panel stacks vertically on small screens

## 🎭 State Management

The component manages its own internal state:
- Note content and metadata
- UI state (preview, metadata sidebar, find/replace)
- Auto-save timers
- Cursor position and selection

## 🔄 Auto-Save

- **Triggered** every 3 seconds when content changes
- **Visual Feedback** shows "Saving..." status
- **Version Increment** on manual save
- **Timestamp Updates** for both auto-save and manual save

## 📊 Document Statistics

Real-time calculation of:
- **Word Count** - filtered for meaningful words
- **Reading Time** - estimated at 200 words/minute
- **Line Count** - total lines in document
- **Character Count** - including whitespace

## 🏷️ Tag Management

- **Visual Tag Display** with remove buttons
- **Add New Tags** via dropdown
- **Tag Filtering** - prevents duplicate tags
- **Color Coding** using accent colors

## 👥 Collaboration Features

- **Collaborator List** with email addresses
- **User Icons** for visual identification
- **Expandable Sections** for team information
- **Project Association** for organization

## 🎯 Integration Benefits

### For Your Dual-Pane System
- **Any content anywhere** - NotePage, TableEditor, Dashboard, etc.
- **Consistent UX** - all components follow same patterns
- **Flexible workspace** - users arrange content as needed
- **Future-proof** - new components automatically work

### For User Experience
- **Familiar interactions** - tab headers, icon buttons work everywhere
- **Contextual actions** - each pane has relevant controls
- **Smooth transitions** - switching between layouts feels natural
- **Consistent styling** - everything uses your global theme

### For Development
- **Modular components** - each piece developed/tested independently
- **Reusable patterns** - same approach works for all content types
- **Easy maintenance** - global CSS changes affect all components
- **Simple state** - each component manages its own concerns

## 🚀 Demo

Visit `/notes-demo` in your app to see the component in action with different dual-pane configurations.

## 🔮 Future Enhancements

- **Real-time Collaboration** with WebSocket support
- **Advanced Markdown** with math equations and diagrams
- **File Attachments** for images and documents
- **Search & Filtering** across all notes
- **Export Options** (PDF, Word, HTML)
- **Template System** for common note types

## 📝 Notes

- Currently uses mock data - integrate with your API for production
- Markdown rendering is basic - consider a library like `react-markdown` for advanced features
- Auto-save timing can be adjusted based on user preferences
- Consider adding keyboard shortcuts for common actions
