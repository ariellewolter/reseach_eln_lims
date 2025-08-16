import { PropertyDefinition, PropertyValue, DocumentProperties, PropertyValidationError, FormulaContext, FormulaExpression, PropertyValidation } from '@research/types';

export class PropertiesStore {
  private properties: Map<string, DocumentProperties> = new Map();
  private propertyDefinitions: Map<string, PropertyDefinition> = new Map();

  // Get properties for a document
  getDocumentProperties(documentId: string): DocumentProperties | undefined {
    return this.properties.get(documentId);
  }

  // Set properties for a document
  setDocumentProperties(properties: DocumentProperties): void {
    this.properties.set(properties.documentId, properties);
    this.saveToStorage();
  }

  // Add a property definition
  addPropertyDefinition(definition: PropertyDefinition): void {
    this.propertyDefinitions.set(definition.id, definition);
    this.saveToStorage();
  }

  // Get all property definitions
  getPropertyDefinitions(): PropertyDefinition[] {
    return Array.from(this.propertyDefinitions.values());
  }

  // Get property definitions for a specific document type
  getPropertyDefinitionsForType(documentType: string): PropertyDefinition[] {
    // For now, return all property definitions since PropertyDefinition doesn't have applicableTypes
    // This could be enhanced later with PropertyTemplate support
    return this.getPropertyDefinitions();
  }

  // Add backlink between documents
  addBacklink(fromDocumentId: string, toDocumentId: string): void {
    const properties = this.getDocumentProperties(toDocumentId);
    if (properties) {
      const backlinks = properties.backlinks || [];
      if (!backlinks.includes(fromDocumentId)) {
        properties.backlinks = [...backlinks, fromDocumentId];
        this.setDocumentProperties(properties);
      }
    }
  }

  // Remove backlink
  removeBacklink(fromDocumentId: string, toDocumentId: string): void {
    const properties = this.getDocumentProperties(toDocumentId);
    if (properties && properties.backlinks) {
      properties.backlinks = properties.backlinks.filter(id => id !== fromDocumentId);
      this.setDocumentProperties(properties);
    }
  }

  // Get documents by property value
  getDocumentsByProperty(propertyId: string, value: any): DocumentProperties[] {
    return Array.from(this.properties.values()).filter(doc => 
      doc.properties.some(prop => 
        prop.propertyId === propertyId && 
        this.comparePropertyValues(prop.value, value)
      )
    );
  }

  // Get documents by tag
  getDocumentsByTag(tag: string): DocumentProperties[] {
    return Array.from(this.properties.values()).filter(doc => 
      doc.tags?.includes(tag) ||
      doc.properties.some(prop => 
        prop.propertyId === 'tags' && 
        Array.isArray(prop.value) && 
        prop.value.includes(tag)
      )
    );
  }

  // Get documents by category
  getDocumentsByCategory(category: string): DocumentProperties[] {
    return Array.from(this.properties.values()).filter(doc => 
      doc.categories?.includes(category)
    );
  }

  private comparePropertyValues(value1: any, value2: any): boolean {
    if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.some(v1 => value2.includes(v1));
    }
    return value1 === value2;
  }

  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('document-properties', JSON.stringify({
        properties: Array.from(this.properties.entries()),
        definitions: Array.from(this.propertyDefinitions.entries())
      }));
    }
  }

  loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('document-properties');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.properties = new Map(data.properties || []);
          this.propertyDefinitions = new Map(data.definitions || []);
        } catch (error) {
          console.warn('Failed to load properties from storage:', error);
        }
      }
    }
  }
}

// Global properties store instance
export const propertiesStore = new PropertiesStore();

// Property validation utilities
export function validatePropertyValue(
  property: PropertyDefinition, 
  value: any
): PropertyValidationError | null {
  if (property.required && (value === null || value === undefined || value === '')) {
    return {
      propertyId: property.id,
      message: `${property.name} is required`,
      type: 'error'
    };
  }

  if (value === null || value === undefined || value === '') {
    return null; // Empty values are valid for non-required fields
  }

  const validation = property.validation;
  if (!validation) return null;

  // Text validation
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return {
        propertyId: property.id,
        message: `${property.name} must be at least ${validation.minLength} characters`,
        type: 'error'
      };
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      return {
        propertyId: property.id,
        message: `${property.name} must be no more than ${validation.maxLength} characters`,
        type: 'error'
      };
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return {
          propertyId: property.id,
          message: `${property.name} format is invalid`,
          type: 'error'
        };
      }
    }
  }

  // Number validation
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return {
        propertyId: property.id,
        message: `${property.name} must be at least ${validation.min}`,
        type: 'error'
      };
    }
    
    if (validation.max !== undefined && value > validation.max) {
      return {
        propertyId: property.id,
        message: `${property.name} must be no more than ${validation.max}`,
        type: 'error'
      };
    }
  }

  // Date validation
  if (property.type === 'date' && value) {
    const date = new Date(value);
    if (validation.min !== undefined) {
      const minDate = new Date(validation.min);
      if (date < minDate) {
        return {
          propertyId: property.id,
          message: `${property.name} must be after ${minDate.toLocaleDateString()}`,
          type: 'error'
        };
      }
    }
    
    if (validation.max !== undefined) {
      const maxDate = new Date(validation.max);
      if (date > maxDate) {
        return {
          propertyId: property.id,
          message: `${property.name} must be before ${maxDate.toLocaleDateString()}`,
          type: 'error'
        };
      }
    }
  }

  // Custom validation
  if (validation.custom) {
    const customError = validation.custom(value);
    if (customError) {
      return {
        propertyId: property.id,
        message: String(customError),
        type: 'error'
      };
    }
  }

  return null;
}

export function validateDocumentProperties(
  properties: DocumentProperties,
  propertyDefinitions: PropertyDefinition[]
): PropertyValidationError[] {
  const errors: PropertyValidationError[] = [];
  
  for (const propValue of properties.properties) {
    const propertyDef = propertyDefinitions.find(p => p.id === propValue.propertyId);
    if (propertyDef) {
      const error = validatePropertyValue(propertyDef, propValue.value);
      if (error) {
        errors.push(error);
      }
    }
  }
  
  return errors;
}

// Property formatting utilities
export function formatPropertyValue(definition: PropertyDefinition, value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  switch (definition.type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'checkbox':
      return value ? '✓' : '✗';
    case 'select':
    case 'status':
    case 'priority':
      if (Array.isArray(definition.options)) {
        if (definition.options.length > 0 && typeof definition.options[0] === 'string') {
          // Handle string array options
          return definition.options.includes(value) ? value : String(value);
        } else {
          // Handle PropertyOption array options
          const option = definition.options.find(opt => typeof opt === 'object' && opt.id === value);
          return option && typeof option === 'object' ? option.name : String(value);
        }
      }
      return String(value);
    case 'multiSelect':
    case 'tags':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    case 'url':
      return value;
    case 'email':
      return value;
    case 'number':
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Calculate formula-based property values
 */
export function calculateFormulaProperty(
  formula: string, 
  context: FormulaContext
): { value: any; error?: string } {
  try {
    // Simple formula parser for common operations
    if (formula.includes('DATEDIFF')) {
      return calculateDateDifference(formula, context);
    } else if (formula.includes('SUM')) {
      return calculateSum(formula, context);
    } else if (formula.includes('IF')) {
      return calculateIfStatement(formula, context);
    } else if (formula.includes('+') || formula.includes('-') || formula.includes('*') || formula.includes('/')) {
      return calculateArithmetic(formula, context);
    } else {
      // Simple property reference
      const propertyId = formula.trim();
      const value = context.properties[propertyId];
      return { value: value !== undefined ? value : 0 };
    }
  } catch (error) {
    return { value: null, error: `Formula error: ${error}` };
  }
}

function calculateDateDifference(formula: string, context: FormulaContext): { value: any; error?: string } {
  // Parse DATEDIFF(date1, date2) format
  const match = formula.match(/DATEDIFF\(([^,]+),\s*([^)]+)\)/);
  if (!match) {
    return { value: null, error: 'Invalid DATEDIFF format' };
  }

  const [, date1, date2] = match;
  const date1Value = context.properties[date1.trim()];
  const date2Value = context.properties[date2.trim()];

  if (!date1Value || !date2Value) {
    return { value: null, error: 'Missing date values' };
  }

  try {
    const date1Date = new Date(date1Value);
    const date2Date = new Date(date2Value);
    const diffTime = Math.abs(date2Date.getTime() - date1Date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { value: diffDays };
  } catch (error) {
    return { value: null, error: 'Invalid date format' };
  }
}

function calculateSum(formula: string, context: FormulaContext): { value: any; error?: string } {
  // Parse SUM(property1, property2, ...) format
  const match = formula.match(/SUM\(([^)]+)\)/);
  if (!match) {
    return { value: null, error: 'Invalid SUM format' };
  }

  const properties = match[1].split(',').map(p => p.trim());
  let sum = 0;

  for (const prop of properties) {
    const value = context.properties[prop];
    if (typeof value === 'number') {
      sum += value;
    }
  }

  return { value: sum };
}

function calculateIfStatement(formula: string, context: FormulaContext): { value: any; error?: string } {
  // Parse IF(condition, trueValue, falseValue) format
  const match = formula.match(/IF\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
  if (!match) {
    return { value: null, error: 'Invalid IF format' };
  }

  const [, condition, trueValue, falseValue] = match;
  
  // Evaluate condition
  const conditionResult = evaluateCondition(condition, context);
  
  if (conditionResult) {
    return { value: parseValue(trueValue, context) };
  } else {
    return { value: parseValue(falseValue, context) };
  }
}

function evaluateCondition(condition: string, context: FormulaContext): boolean {
  if (condition.includes('=')) {
    const [left, right] = condition.split('=').map(p => p.trim());
    const leftValue = parseValue(left, context);
    const rightValue = parseValue(right, context);
    return leftValue === rightValue;
  } else if (condition.includes('>')) {
    const [left, right] = condition.split('>').map(p => p.trim());
    const leftValue = parseValue(left, context);
    const rightValue = parseValue(right, context);
    return leftValue > rightValue;
  } else if (condition.includes('<')) {
    const [left, right] = condition.split('<').map(p => p.trim());
    const leftValue = parseValue(left, context);
    const rightValue = parseValue(right, context);
    return leftValue < rightValue;
  }
  
  return false;
}

function parseValue(value: string, context: FormulaContext): any {
  const trimmed = value.trim();
  
  // Check if it's a property reference
  if (context.properties[trimmed] !== undefined) {
    return context.properties[trimmed];
  }
  
  // Check if it's a string literal
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  
  // Check if it's a number
  if (!isNaN(Number(trimmed))) {
    return Number(trimmed);
  }
  
  // Check if it's a boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  
  return trimmed;
}

function calculateArithmetic(formula: string, context: FormulaContext): { value: any; error?: string } {
  try {
    // Replace property references with their values
    let processedFormula = formula;
    for (const [propertyId, value] of Object.entries(context.properties)) {
      if (typeof value === 'number') {
        processedFormula = processedFormula.replace(new RegExp(`\\b${propertyId}\\b`, 'g'), value.toString());
      }
    }
    
    // Evaluate the arithmetic expression
    const result = eval(processedFormula);
    return { value: result };
  } catch (error) {
    return { value: null, error: `Arithmetic error: ${error}` };
  }
}

/**
 * Create a custom property definition
 */
export function createCustomProperty(
  name: string,
  type: string,
  options?: {
    description?: string;
    required?: boolean;
    options?: string[];
    validation?: PropertyValidation;
    unit?: string;
    category?: string;
    formula?: string;
    dependsOn?: string[];
  }
): PropertyDefinition {
  const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    type: type as any,
    description: options?.description,
    required: options?.required || false,
    options: options?.options,
    validation: options?.validation,
    unit: options?.unit,
    category: options?.category || 'Custom',
    isCustom: true,
    isFormula: type === 'formula',
    formula: options?.formula,
    dependsOn: options?.dependsOn || []
  };
}

/**
 * Update formula properties when dependencies change
 */
export function updateFormulaProperties(
  documentProperties: DocumentProperties,
  availableProperties: PropertyDefinition[]
): DocumentProperties {
  const formulaProperties = availableProperties.filter(p => p.isFormula);
  const updatedProperties = [...documentProperties.properties];
  
  for (const formulaProp of formulaProperties) {
    if (!formulaProp.formula || !formulaProp.dependsOn) continue;
    
    // Check if all dependencies are present
    const hasAllDependencies = formulaProp.dependsOn.every(dep => 
      documentProperties.properties.some(p => p.propertyId === dep)
    );
    
    if (hasAllDependencies) {
      const context: FormulaContext = {
        properties: Object.fromEntries(
          documentProperties.properties.map(p => [p.propertyId, p.value])
        ),
        functions: {}
      };
      
      const result = calculateFormulaProperty(formulaProp.formula, context);
      
      // Update or add the formula property
      const existingIndex = updatedProperties.findIndex(p => p.propertyId === formulaProp.id);
      if (existingIndex >= 0) {
        updatedProperties[existingIndex] = {
          ...updatedProperties[existingIndex],
          value: result.value,
          error: result.error,
          lastCalculated: new Date().toISOString()
        };
      } else {
        updatedProperties.push({
          propertyId: formulaProp.id,
          value: result.value,
          error: result.error,
          lastCalculated: new Date().toISOString()
        });
      }
    }
  }
  
  return {
    ...documentProperties,
    properties: updatedProperties
  };
}

/**
 * Validate custom property definition
 */
export function validateCustomProperty(property: PropertyDefinition): PropertyValidationError[] {
  const errors: PropertyValidationError[] = [];
  
  if (!property.name || property.name.trim().length === 0) {
    errors.push({
      propertyId: property.id,
      message: 'Property name is required',
      type: 'error'
    });
  }
  
  if (property.name && property.name.length > 50) {
    errors.push({
      propertyId: property.id,
      message: 'Property name must be less than 50 characters',
      type: 'error'
    });
  }
  
  if (property.type === 'select' && (!property.options || property.options.length === 0)) {
    errors.push({
      propertyId: property.id,
      message: 'Select properties must have at least one option',
      type: 'error'
    });
  }
  
  if (property.type === 'formula' && (!property.formula || property.formula.trim().length === 0)) {
    errors.push({
      propertyId: property.id,
      message: 'Formula properties must have a formula expression',
      type: 'error'
    });
  }
  
  return errors;
}
