export type PropertyType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiSelect' 
  | 'date' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'phone' 
  | 'status' 
  | 'priority' 
  | 'tags' 
  | 'formula' 
  | 'relation' 
  | 'rollup' 
  | 'createdTime' 
  | 'lastEditedTime' 
  | 'createdBy' 
  | 'lastEditedBy' 
  | 'files'
  | 'custom'; // New: User-defined custom properties

export interface PropertyOption {
  id: string;
  name: string;
  color: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  description?: string;
  required?: boolean;
  options?: string[] | { id: string; name: string; color?: string }[];
  defaultValue?: any;
  validation?: PropertyValidation;
  isCustom?: boolean; // New: Marks user-created properties
  isFormula?: boolean; // New: Marks formula-based properties
  formula?: string; // New: The formula expression
  dependsOn?: string[]; // New: Properties this formula depends on
  unit?: string; // New: Unit of measurement (e.g., "mg", "°C", "%")
  category?: string; // New: Grouping for custom properties
}

export interface PropertyValidationError {
  propertyId: string;
  message: string;
  type: 'error' | 'warning';
}

export interface PropertyValue {
  propertyId: string;
  value: any;
  lastCalculated?: string; // New: When formula was last calculated
  error?: string; // New: Formula calculation errors
}

// New: Formula expression types
export type FormulaOperator = '+' | '-' | '*' | '/' | '=' | '>' | '<' | '>=' | '<=';
export type FormulaFunction = 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN' | 'IF' | 'CONCAT';

export interface FormulaExpression {
  type: 'property' | 'operator' | 'function' | 'value' | 'constant';
  value: string | number;
  propertyId?: string;
  operator?: FormulaOperator;
  function?: FormulaFunction;
  parameters?: FormulaExpression[];
}

// New: Custom property templates
export interface PropertyTemplate {
  id: string;
  name: string;
  description?: string;
  properties: PropertyDefinition[];
  category: string;
  isDefault?: boolean;
}

// New: Formula validation and calculation
export interface FormulaContext {
  properties: Record<string, any>;
  functions: Record<string, (...args: any[]) => any>;
}

export interface PropertyValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => boolean;
}

export interface DocumentProperties {
  documentId: string;
  documentType: 'note' | 'table' | 'project' | 'task' | 'inventory';
  properties: PropertyValue[];
  categories?: string[]; // For grouping/filtering
  backlinks?: string[]; // Related document IDs
  tags?: string[];
}

// Predefined property colors for select options
export const PROPERTY_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
] as const;

// Minimal properties that every document starts with
export const MINIMAL_PROPERTIES: PropertyDefinition[] = [
  {
    id: 'status',
    name: 'Status',
    type: 'select',
    options: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    required: true
  }
];

// Extended properties that users can add as needed
export const EXTENDED_PROPERTIES: PropertyDefinition[] = [
  {
    id: 'priority',
    name: 'Priority',
    type: 'select',
    options: ['Low', 'Medium', 'High', 'Urgent'],
    required: false
  },
  {
    id: 'tags',
    name: 'Tags',
    type: 'tags',
    required: false
  },
  {
    id: 'due-date',
    name: 'Due Date',
    type: 'date',
    required: false
  },
  {
    id: 'assigned-to',
    name: 'Assigned To',
    type: 'text',
    required: false
  },
  {
    id: 'project-name',
    name: 'Project Name',
    type: 'text',
    required: false,
    validation: {
      minLength: 2,
      maxLength: 100
    }
  },
  {
    id: 'budget',
    name: 'Budget',
    type: 'number',
    required: false,
    validation: {
      min: 0
    }
  },
  {
    id: 'email',
    name: 'Email',
    type: 'email',
    required: false,
    validation: {
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    }
  },
  {
    id: 'safety-level',
    name: 'Safety Level',
    type: 'select',
    options: ['Low', 'Medium', 'High', 'Critical'],
    required: false
  }
];

// New: Example formula properties
export const FORMULA_PROPERTIES: PropertyDefinition[] = [
  {
    id: 'days-remaining',
    name: 'Days Remaining',
    type: 'formula',
    description: 'Calculates days until due date',
    isFormula: true,
    formula: 'DATEDIFF(due-date, TODAY())',
    dependsOn: ['due-date'],
    unit: 'days',
    isCustom: true,
    category: 'Calculated'
  },
  {
    id: 'budget-remaining',
    name: 'Budget Remaining',
    type: 'formula',
    description: 'Calculates remaining budget',
    isFormula: true,
    formula: 'budget - SUM(expenses)',
    dependsOn: ['budget'],
    unit: '$',
    isCustom: true,
    category: 'Calculated'
  },
  {
    id: 'progress-percentage',
    name: 'Progress %',
    type: 'formula',
    description: 'Calculates completion percentage',
    isFormula: true,
    formula: 'IF(status = "Completed", 100, IF(status = "In Progress", 50, 0))',
    dependsOn: ['status'],
    unit: '%',
    isCustom: true,
    category: 'Calculated'
  }
];

// New: Property templates for different document types
export const PROPERTY_TEMPLATES: PropertyTemplate[] = [
  {
    id: 'lab-experiment',
    name: 'Lab Experiment',
    description: 'Properties for laboratory experiments',
    category: 'Laboratory',
    properties: [
      ...MINIMAL_PROPERTIES,
      {
        id: 'experiment-type',
        name: 'Experiment Type',
        type: 'select',
        options: ['PCR', 'Western Blot', 'Cell Culture', 'Protein Assay', 'Other'],
        required: false,
        isCustom: true,
        category: 'Experiment'
      },
      {
        id: 'sample-count',
        name: 'Sample Count',
        type: 'number',
        required: false,
        validation: { min: 1 },
        unit: 'samples',
        isCustom: true,
        category: 'Experiment'
      },
      {
        id: 'completion-time',
        name: 'Completion Time',
        type: 'formula',
        description: 'Time from start to completion',
        isFormula: true,
        formula: 'DATEDIFF(completion-date, start-date)',
        dependsOn: ['start-date', 'completion-date'],
        unit: 'hours',
        isCustom: true,
        category: 'Calculated'
      }
    ]
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Properties for project tracking',
    category: 'Management',
    properties: [
      ...MINIMAL_PROPERTIES,
      {
        id: 'team-size',
        name: 'Team Size',
        type: 'number',
        required: false,
        validation: { min: 1 },
        unit: 'people',
        isCustom: true,
        category: 'Team'
      },
      {
        id: 'milestone-count',
        name: 'Milestone Count',
        type: 'number',
        required: false,
        validation: { min: 0 },
        unit: 'milestones',
        isCustom: true,
        category: 'Project'
      }
    ]
  }
];

// Legacy export for backward compatibility
export const COMMON_PROPERTIES: PropertyDefinition[] = [
  ...MINIMAL_PROPERTIES,
  ...EXTENDED_PROPERTIES,
  ...FORMULA_PROPERTIES
];
