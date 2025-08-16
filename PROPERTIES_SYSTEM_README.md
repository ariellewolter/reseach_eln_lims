# Universal Properties System

A comprehensive metadata and organization system for your research notebook that provides powerful document properties, backlinks, categories, and tags.

## 🎯 Overview

The Universal Properties System transforms your lab notebook into a connected knowledge base where every document can have rich metadata, automatic backlinks, and flexible organization through properties, categories, and tags.

## ✨ Key Features

### 📝 Property Types
- **Text**: Simple text input
- **Number**: Numeric values with validation
- **Select**: Single-choice dropdown with custom options
- **Multi-Select**: Multiple choice with tags
- **Date**: Date picker with validation
- **Checkbox**: Boolean true/false values
- **URL**: Web link validation
- **Email**: Email format validation
- **Phone**: Phone number validation
- **Status**: Predefined status options (Not Started, In Progress, Completed, etc.)
- **Priority**: Priority levels (Low, Medium, High, Urgent)
- **Tags**: Multi-select tags with suggestions
- **Formula**: Calculated properties (future enhancement)
- **Relation**: Links to other documents
- **Files**: File attachments (future enhancement)

### 🔗 Backlinks System
- Automatic linking between documents
- Expandable backlinks panel
- Shows document relationships
- Click to navigate between linked documents

### 🏷️ Categories & Tags
- Flexible categorization system
- Multi-tag support with suggestions
- Color-coded tag display
- Easy tag management (add/remove)

### 🎛️ Collapsible Interface
- Properties panel can be minimized or expanded
- Shows property count when collapsed
- Smooth animations and transitions
- Responsive design for all screen sizes

### 🚫 Dashboard Exception
- Properties panel is automatically hidden on dashboard pages
- Clean, focused interface for overview pages
- Configurable per page type

## 🏗️ Architecture

### Frontend Components
```
packages/ui/src/properties/
├── PropertiesPanel.tsx    # Main collapsible panel
├── PropertyInput.tsx      # Individual property inputs
└── index.ts              # Component exports
```

### Type System
```
packages/types/src/properties.ts
├── PropertyType          # Union type of all property types
├── PropertyDefinition    # Property schema definition
├── PropertyValue         # Individual property value
├── DocumentProperties    # Complete document metadata
└── PropertyTemplate      # Predefined property sets
```

### Utilities
```
packages/utils/src/properties.ts
├── PropertiesStore       # Local storage management
├── Validation functions  # Property value validation
└── Formatting utilities  # Property display formatting
```

### Backend Support
```
servers/personal-api/
├── src/properties.ts     # API routes for properties
└── prisma/schema.prisma  # Database schema with properties tables
```

## 🚀 Usage

### Basic Integration

```tsx
import { DualPaneLayout } from '@research/ui';
import { DocumentProperties } from '@research/types';

function MyComponent() {
  const [properties, setProperties] = useState<DocumentProperties>();
  
  return (
    <DualPaneLayout
      // ... other props
      showProperties={true}
      propertiesCollapsed={false}
      activeDocumentId="note-123"
      activeDocumentType="note"
      documentProperties={properties}
      onPropertiesChange={setProperties}
      isDashboard={false}
    />
  );
}
```

### Property Management

```tsx
import { propertiesStore } from '@research/utils';

// Get properties for a document
const props = propertiesStore.getDocumentProperties('note-123');

// Set properties for a document
propertiesStore.setDocumentProperties({
  documentId: 'note-123',
  documentType: 'note',
  properties: [
    { propertyId: 'status', value: 'completed' },
    { propertyId: 'priority', value: 'high' }
  ],
  tags: ['experiment', 'synthesis']
});
```

### Custom Property Definitions

```tsx
import { PropertyDefinition } from '@research/types';

const customProperty: PropertyDefinition = {
  id: 'reaction-yield',
  name: 'Reaction Yield',
  type: 'number',
  required: true,
  description: 'Expected yield percentage for this reaction'
};
```

## 🎨 Visual Features

### Collapsed State
- Small pill with property count
- Chevron icon to expand
- Hover effects and smooth transitions

### Expanded State
- Full panel with all properties
- Property type icons
- Add property dropdown
- Categories and backlinks sections

### Property Inputs
- Type-appropriate controls
- Validation feedback
- Auto-save functionality
- Responsive layout

### Tags System
- Multi-select with suggestions
- Color-coded display
- Easy removal with × buttons
- Dropdown suggestions from existing tags

## 🔧 Configuration

### Property Templates
Predefined sets of properties for different document types:

```tsx
// Common properties included by default
const COMMON_PROPERTIES = [
  { id: 'status', name: 'Status', type: 'status' },
  { id: 'priority', name: 'Priority', type: 'priority' },
  { id: 'tags', name: 'Tags', type: 'tags' },
  { id: 'created-date', name: 'Created', type: 'createdTime' }
];
```

### Dashboard Hiding
Set `isDashboard={true}` to hide the properties panel:

```tsx
<DualPaneLayout
  // ... other props
  isDashboard={true}  // Properties panel will be hidden
/>
```

### Custom Property Types
Extend the system with new property types:

```tsx
// Add to PropertyType union
export type PropertyType = 
  | 'text' 
  | 'number'
  | 'custom-type'  // Your new type
  // ... existing types
```

## 📱 Responsive Design

- Mobile-optimized property inputs
- Collapsible sections on small screens
- Touch-friendly controls
- Adaptive layout for different screen sizes

## 🔒 Data Persistence

### Local Storage
- Properties are automatically saved to localStorage
- Survives browser sessions
- Fast access for offline use

### API Integration
- Properties are synced to backend
- Real-time updates across devices
- Backup and recovery support

## 🚧 Future Enhancements

### Planned Features
- **Formula Properties**: Calculated values based on other properties
- **Relation Properties**: Rich document linking with previews
- **File Properties**: Document attachments and media
- **Property Validation**: Custom validation rules
- **Bulk Operations**: Apply properties to multiple documents
- **Property History**: Track changes over time
- **Advanced Search**: Search by property values and combinations

### Extensibility
- Plugin system for custom property types
- Custom property renderers
- Property-specific validation rules
- Integration with external data sources

## 🧪 Testing

### Demo Component
Use the `PropertiesDemo` component to test the system:

```tsx
import { PropertiesDemo } from './PropertiesDemo';

// In your app
<PropertiesDemo />
```

### Sample Data
The demo includes sample notes with realistic properties:
- Experiment protocols
- Literature reviews
- Project metadata
- Sample tags and categories

## 📚 API Reference

### PropertiesPanel Props

```tsx
interface PropertiesPanelProps {
  documentId: string;
  documentType: 'note' | 'table' | 'project' | 'task' | 'inventory';
  properties?: DocumentProperties;
  onPropertiesChange: (properties: DocumentProperties) => void;
  availableProperties?: PropertyDefinition[];
  isCollapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
  showBacklinks?: boolean;
}
```

### DualPaneLayout Properties Props

```tsx
// Properties Panel Props
showProperties?: boolean;
propertiesCollapsed?: boolean;
onToggleProperties?: (collapsed: boolean) => void;
activeDocumentId?: string;
activeDocumentType?: 'note' | 'table' | 'project' | 'task' | 'inventory';
documentProperties?: DocumentProperties;
onPropertiesChange?: (properties: DocumentProperties) => void;
isDashboard?: boolean;
```

## 🤝 Contributing

### Development Setup
1. Install dependencies: `pnpm install`
2. Start development servers: `pnpm dev`
3. Open the demo component to test properties

### Adding New Property Types
1. Extend `PropertyType` union in `packages/types/src/properties.ts`
2. Add input rendering in `PropertyInput.tsx`
3. Update validation in `packages/utils/src/properties.ts`
4. Add styling in `packages/theme/src/index.css`

### Testing
- Test on different screen sizes
- Verify property validation
- Check data persistence
- Test with different document types

## 📄 License

This system is part of the Research Notebook project and follows the same licensing terms.

---

**The Universal Properties System transforms your research notebook into a connected, organized, and powerful knowledge base! 🎉**
