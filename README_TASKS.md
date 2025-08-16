# 🧩 Tasks + Calendar System for Research Notebook

A comprehensive task management and calendar system integrated with the Research Notebook app, featuring natural language quick-add, time tracking, and deep linking with notes.

## ✨ Features

### 🚀 Quick Add (Natural Language)
- **Natural language parsing** for fast task creation
- **Smart extraction** of dates, times, tags, links, priorities, and estimates
- **Examples:**
  - `"Write methods section tomorrow 2-4pm #writing [[Paper1]] !high every week Mon 9am remind 30m"`
  - `"Review literature today #reading 2h estimate"`
  - `"Lab meeting next Monday 10am #lab every week`

### 📋 Task Management
- **Multiple views**: List, Kanban (coming soon), Calendar (coming soon)
- **Status tracking**: Todo, In Progress, Blocked, Done, Cancelled
- **Priority levels**: Low, Medium, High, Urgent
- **Context categories**: Lab, Writing, Reading, Analysis, Admin
- **Time tracking**: Start/stop timers with accumulated time
- **Batch operations**: Select multiple tasks for bulk updates

### 🗓️ Calendar Integration
- **Time blocking**: Schedule tasks into calendar slots
- **Event management**: Create and manage calendar events
- **ICS import/export**: Import external calendars, export your schedule
- **Linked tasks**: Calendar events can link to tasks for time tracking

### 🔗 Deep Linking
- **Smart links**: `[[Note Title]]` creates bidirectional links
- **Tag system**: `#tag` for categorization and filtering
- **Backlinks**: Automatic discovery of related content
- **Note integration**: Insert task references into notes

### 🎨 Modern UI
- **Clean design**: Tailwind CSS with dark/light theme support
- **Responsive**: Mobile-friendly interface
- **Keyboard shortcuts**: Fast navigation and editing
- **Animations**: Subtle motion for better UX

## 🏗️ Architecture

### Data Models
```typescript
// Core Task model
type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  estimateMin?: number;
  spentMin?: number;
  tags: string[];
  links: string[];
  context?: TaskContext;
  // ... more fields
};

// Calendar Event model
type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  source: "manual" | "task_block" | "imported_ics";
  linkedTaskId?: string;
  // ... more fields
};
```

### State Management
- **Zustand stores** with persistence (localStorage)
- **Tasks store**: Task CRUD, filtering, sorting, selection
- **Calendar store**: Event management, time blocking
- **Adapter pattern** for future database integration

### Component Structure
```
/src/features/tasks/
├── store/useTasksStore.ts          # Task state management
├── utils/quickAddParser.ts         # Natural language parsing
├── components/
│   ├── TaskQuickAdd.tsx           # Quick add interface
│   ├── TaskList.tsx               # List view with filters
│   ├── TaskItem.tsx               # Individual task display
│   └── TaskMiniTimer.tsx          # Active timer display
└── views/TasksView.tsx            # Main orchestrator

/src/features/calendar/
├── store/useCalendarStore.ts       # Calendar state management
└── components/                     # Calendar components (coming soon)

/src/integrations/
├── useLinking.ts                   # Tag/link utilities
└── useNotebookBridge.ts           # Notebook integration
```

## 🚀 Getting Started

### 1. Navigation
- Click the **Tasks** icon in the top-right navigation
- Or navigate to `/tasks` in your browser

### 2. Create Your First Task
- Click **"Quick Add Task"** button
- Type natural language: `"Review paper tomorrow #reading 2h estimate"`
- Press **Enter** to create

### 3. Manage Tasks
- **Click task title** to edit inline
- **Click status icon** to mark complete
- **Click timer button** to start/stop tracking
- **Use filters** to find specific tasks
- **Batch select** for bulk operations

### 4. Quick Filters
- **Overdue**: Tasks past due date
- **Today**: Tasks due today
- **Upcoming**: Tasks due this week
- **All**: Clear all filters

## ⌨️ Keyboard Shortcuts

### Global
- `T` - Open Quick Add
- `/` - Focus search
- `Cmd/Ctrl+K` - Command palette (coming soon)

### In Task Lists
- `Enter` - Edit selected task
- `Space` - Start/stop timer
- `Cmd/Ctrl+D` - Mark done
- `J/K` - Navigate tasks
- `X` - Multi-select mode
- `Esc` - Clear selection

### Quick Add
- `Enter` - Create task
- `Shift+Enter` - Multiline mode
- `Esc` - Cancel

## 🔧 Natural Language Parser

The quick-add parser understands:

### Dates & Times
- **Relative**: `today`, `tomorrow`, `next week`, `next month`
- **Days**: `Monday`, `Mon`, `Tuesday`, `Tue`, etc.
- **Times**: `2pm`, `2:30pm`, `2-4pm`, `2:30-4:15pm`

### Priorities
- `!urgent` or `!critical` - Urgent priority
- `!high` or `!important` - High priority
- `!medium` or `!med` - Medium priority
- `!low` or `!minor` - Low priority

### Recurrence
- `every day` or `daily` - Daily recurrence
- `every week` or `weekly` - Weekly recurrence
- `every month` or `monthly` - Monthly recurrence
- `every Monday` - Custom day recurrence

### Reminders
- `remind 15m` - 15 minutes before
- `remind 1h` - 1 hour before
- `remind 1d` - 1 day before

### Estimates
- `2h` or `2 hours` - 2 hour estimate
- `30m` or `30 minutes` - 30 minute estimate

### Context & Tags
- `#lab` - Lab work context
- `#writing` - Writing context
- `#reading` - Reading context
- `#analysis` - Analysis context
- `#admin` - Administrative context

## 🔗 Linking with Notes

### From Tasks to Notes
1. In task description, use `[[Note Title]]` syntax
2. Task automatically links to the note
3. Note appears in task's backlinks

### From Notes to Tasks
1. Select text in note editor
2. Right-click → "Create Task from Selection"
3. Task created with link back to note

### Task References in Notes
Insert formatted task references:
```markdown
- [ ] Write methods section (due Aug 20, #writing) [[Task:abc123]]
- 📅 Lab meeting (Aug 22) #lab [[Event:def456]]
```

## 📱 Mobile Experience

- **Responsive design** adapts to screen size
- **Touch-friendly** buttons and interactions
- **Optimized layouts** for mobile workflows
- **3-day calendar view** as mobile default

## 🎯 Future Enhancements

### Phase 2 (Coming Soon)
- **Kanban view** with drag-and-drop
- **Calendar view** with time blocking
- **Recurring tasks** with advanced rules
- **Team collaboration** features

### Phase 3 (Planned)
- **Time-boxed planning** - Auto-pack tasks into calendar
- **Focus mode** - Fullscreen task workspace
- **CSV import/export** - Data portability
- **Heatmap analytics** - Productivity insights

## 🛠️ Development

### Adding New Features
1. **Extend data models** in `packages/types/src/tasks.ts`
2. **Update stores** with new actions and state
3. **Create components** following existing patterns
4. **Add tests** for parsers and utilities

### Customization
- **Theme colors** via CSS variables
- **Keyboard shortcuts** in component event handlers
- **Parser patterns** in `quickAddParser.ts`
- **Filter options** in store and components

### Performance
- **Memoized selectors** for expensive computations
- **Virtualized lists** for large datasets
- **Debounced search** for responsive filtering
- **Efficient updates** with immutable patterns

## 📊 Data Persistence

### Current
- **localStorage** for immediate persistence
- **Zustand persist** middleware
- **Automatic saving** on all changes

### Future
- **Database adapter** pattern ready
- **Sync capabilities** for multi-device
- **Backup/restore** functionality
- **Export formats** (JSON, CSV, ICS)

## 🐛 Troubleshooting

### Common Issues

**Quick Add not parsing correctly**
- Check syntax against examples above
- Ensure proper spacing around patterns
- Verify date/time formats

**Tasks not saving**
- Check browser localStorage permissions
- Clear browser cache and reload
- Verify no JavaScript errors in console

**Timer not working**
- Ensure only one timer active at a time
- Check browser permissions for notifications
- Verify system time is correct

### Getting Help
1. Check browser console for errors
2. Verify localStorage is enabled
3. Test with simple task creation first
4. Check browser compatibility

## 🤝 Contributing

### Code Style
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Functional components** with hooks
- **Consistent naming** conventions

### Testing
- **Parser tests** for quick-add functionality
- **Store tests** for state management
- **Component tests** for UI behavior
- **Integration tests** for workflows

---

**Built with ❤️ for researchers who need to stay organized and productive.**
