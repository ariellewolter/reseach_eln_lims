# Personal Dashboard - ELN App

## Overview

The Personal Dashboard serves as the central hub for your personal Electronic Lab Notebook (ELN) application. It provides a comprehensive overview of your research activities, recent documents, active projects, and daily tasks.

## Features

### 🎯 Dashboard Structure

#### Header Section
- **Welcome Message**: Personalized greeting with user context
- **Quick Action Buttons**: Create new notes and tables
- **Statistics Cards**: Key metrics (notes, tables, projects, activity)
- **Search & Filters**: Global search with filtering capabilities

#### Main Content Areas
- **Left Column (2/3 width)**:
  - Recent Notes section with hover effects
  - Recent Tables section with similar interaction patterns
  - Both sections show last modified dates and "View All" links

- **Right Column (1/3 width)**:
  - Active Projects with progress bars and status indicators
  - Today's Tasks with checkboxes and priority indicators

### 🎨 Design Features

#### Visual Hierarchy
- Uses existing CSS custom properties for consistent theming
- Color-coded sections:
  - 🔵 Blue for notes
  - 🟢 Green for tables
  - 🟣 Purple for projects
  - 🟠 Orange for tasks

#### Interactive Elements
- Hover effects on clickable items
- Priority and status badges with semantic colors
- Progress bars for projects
- Functional checkboxes for tasks

#### Responsive Design
- Grid layouts that adapt to content
- Flexible card layouts for different screen sizes
- Proper overflow handling for scrollable content

## Implementation Details

### File Structure
```
apps/personal/src/
├── components/
│   ├── PersonalDashboard.tsx    # Main dashboard component
│   ├── Navigation.tsx           # Navigation between views
│   └── index.ts                 # Component exports
├── hooks/
│   └── useDashboard.ts          # Data fetching hooks
└── App.tsx                      # Main app with routing
```

### Data Hooks

#### `useDashboard()`
Main hook that fetches all dashboard data:
```typescript
const { data, loading, error, refresh } = useDashboard();
```

#### Individual Hooks
For more granular control:
- `useNotes(limit)` - Fetch recent notes
- `useTables(limit)` - Fetch recent tables
- `useProjects()` - Fetch active projects
- `useTasks()` - Fetch today's tasks

### Mock Data Structure
The dashboard currently uses mock data that matches your API patterns:

```typescript
interface DashboardData {
  recentNotes: Note[];
  recentTables: TableDoc[];
  projects: Project[];
  todayTasks: Task[];
  stats: {
    totalNotes: number;
    totalTables: number;
    activeProjects: number;
    weeklyActivity: number;
  };
}
```

## Usage

### Navigation
- **Dashboard** (`/`): Main dashboard view
- **Workspace** (`/workspace`): Dual-pane workspace for detailed work

### Quick Actions
- **New Note**: Create a new note document
- **New Table**: Create a new table document
- **Refresh**: Reload dashboard data
- **Search**: Filter across all content types

## Integration Points

### Theme Integration
- Uses your existing CSS custom properties from `packages/theme/src/index.css`
- Leverages Lucide React icons already in dependencies
- Follows component patterns from existing UI package

### API Integration
- Mock data structure matches your API patterns
- Ready for real API endpoint integration
- Includes error handling and loading states

## Next Steps for Production

### 1. Real API Integration
Replace mock API calls in `useDashboard.ts`:
```typescript
// Replace mockApi.getNotes with real API call
const notes = await api.getNotes({ limit: 4, orderBy: 'updatedAt' });
```

### 2. Navigation Handlers
Add click handlers for:
- Note/table items → Navigate to editor
- Project items → Navigate to project view
- Task checkboxes → Update task status

### 3. Real-time Updates
Implement:
- WebSocket connections for live data
- Periodic refresh for critical metrics
- Push notifications for urgent tasks

### 4. User Authentication
Add:
- User context and personalization
- Role-based access control
- User preferences and settings

### 5. Advanced Features
Consider adding:
- Drag and drop for task reordering
- Calendar integration for deadlines
- Export functionality for reports
- Mobile-responsive optimizations

## Development

### Running the Dashboard
```bash
cd apps/personal
npm run dev
```

### Building for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

## Customization

### Styling
- Modify CSS custom properties in `packages/theme/src/index.css`
- Update color schemes and spacing
- Adjust responsive breakpoints

### Layout
- Modify grid layouts in `PersonalDashboard.tsx`
- Adjust column widths and spacing
- Customize card layouts and interactions

### Data Sources
- Extend `useDashboard.ts` with additional data types
- Add new statistics and metrics
- Implement custom filtering and search logic

## Troubleshooting

### Common Issues

1. **Dashboard not loading**: Check console for API errors
2. **Styling issues**: Verify CSS custom properties are loaded
3. **Navigation problems**: Check React Router configuration
4. **Type errors**: Run `npm run type-check` for detailed errors

### Performance
- Dashboard loads data in parallel for optimal performance
- Implement virtual scrolling for large datasets
- Add data caching for frequently accessed information

## Contributing

When extending the dashboard:
1. Follow existing component patterns
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add loading states for async operations
5. Test responsive behavior across screen sizes
