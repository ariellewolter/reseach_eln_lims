import React, { useState } from 'react';
import { DocumentProperties, PropertyDefinition, PropertyType, PropertyValue, PropertyTemplate, MINIMAL_PROPERTIES, EXTENDED_PROPERTIES, FORMULA_PROPERTIES, PROPERTY_TEMPLATES } from '@research/types';
import { PropertyInput } from './PropertyInput';
import { CustomPropertyBuilder } from './CustomPropertyBuilder';
import { ChevronDown, ChevronRight, Plus, Settings, Calculator, Sparkles } from 'lucide-react';

interface PropertiesPanelProps {
  documentId: string;
  documentType: string;
  properties?: DocumentProperties;
  onPropertiesChange: (properties: DocumentProperties) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  documentId,
  documentType,
  properties,
  onPropertiesChange,
  collapsed = false,
  onToggleCollapsed
}) => {
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Start with minimal properties, merge with any existing properties
  const currentProperties: PropertyValue[] = properties?.properties || MINIMAL_PROPERTIES.map((p: PropertyDefinition) => ({
    propertyId: p.id,
    value: p.type === 'select' ? (p.options && p.options.length > 0 ? p.options[0] : '') : 
           p.type === 'number' ? 0 : 
           p.type === 'date' ? new Date().toISOString().split('T')[0] : 
           p.type === 'checkbox' ? false : 
           p.type === 'tags' ? [] : ''
  }));

  // Get all available properties including custom ones
  const allAvailableProperties = [
    ...MINIMAL_PROPERTIES,
    ...EXTENDED_PROPERTIES,
    ...FORMULA_PROPERTIES,
    // Add any custom properties from the current document
    ...(properties?.properties || [])
      .map((p: PropertyValue) => {
        const existing = currentProperties.find((cp: PropertyValue) => cp.propertyId === p.propertyId);
        if (existing && !MINIMAL_PROPERTIES.find((mp: PropertyDefinition) => mp.id === p.propertyId) && 
            !EXTENDED_PROPERTIES.find((ep: PropertyDefinition) => ep.id === p.propertyId) &&
            !FORMULA_PROPERTIES.find((fp: PropertyDefinition) => fp.id === p.propertyId)) {
          return {
            id: p.propertyId,
            name: p.propertyId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            type: 'text' as PropertyType,
            isCustom: true,
            category: 'Custom'
          };
        }
        return null;
      })
      .filter(Boolean) as PropertyDefinition[]
  ];

  const handlePropertyChange = (propertyId: string, value: any) => {
    // Update the property in place instead of removing and re-adding
    const updatedProperties = currentProperties.map((p: PropertyValue) => 
      p.propertyId === propertyId ? { ...p, value } : p
    );
    
    // Only add if it doesn't exist and has a value
    if (!currentProperties.find((p: PropertyValue) => p.propertyId === propertyId) && value !== null && value !== undefined && value !== '') {
      updatedProperties.push({ propertyId, value });
    }

    const newDocProperties: DocumentProperties = {
      documentId,
      documentType: documentType as 'note' | 'table' | 'project' | 'task' | 'inventory',
      properties: updatedProperties,
      categories: properties?.categories || [],
      backlinks: properties?.backlinks || [],
      tags: properties?.tags || []
    };

    onPropertiesChange(newDocProperties);
  };

  const addProperty = (propertyDef: PropertyDefinition) => {
    const defaultValue = propertyDef.type === 'select' ? (propertyDef.options && propertyDef.options.length > 0 ? propertyDef.options[0] : '') : 
                       propertyDef.type === 'number' ? 0 : 
                       propertyDef.type === 'date' ? new Date().toISOString().split('T')[0] : 
                       propertyDef.type === 'checkbox' ? false : 
                       propertyDef.type === 'tags' ? [] : '';

    const newProperty: PropertyValue = {
      propertyId: propertyDef.id,
      value: defaultValue
    };

    const updatedProperties = [...currentProperties, newProperty];
    
    const newDocProperties: DocumentProperties = {
      documentId,
      documentType: documentType as 'note' | 'table' | 'project' | 'task' | 'inventory',
      properties: updatedProperties,
      categories: properties?.categories || [],
      backlinks: properties?.backlinks || [],
      tags: properties?.tags || []
    };

    onPropertiesChange(newDocProperties);
    setShowAddProperty(false);
  };

  const addCustomProperty = (propertyDef: PropertyDefinition) => {
    addProperty(propertyDef);
    setShowCustomBuilder(false);
  };

  const addTemplate = (template: PropertyTemplate) => {
    // Add all properties from the template
    template.properties.forEach((propertyDef: PropertyDefinition) => {
      if (!currentProperties.find((p: PropertyValue) => p.propertyId === propertyDef.id)) {
        addProperty(propertyDef);
      }
    });
    setShowTemplates(false);
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'select': return '📋';
      case 'multiSelect': return '📋';
      case 'date': return '📅';
      case 'checkbox': return '☑️';
      case 'url': return '🔗';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'status': return '🏷️';
      case 'priority': return '⭐';
      case 'tags': return '🏷️';
      case 'formula': return '🧮';
      case 'relation': return '🔗';
      case 'rollup': return '📊';
      case 'createdTime': return '⏰';
      case 'lastEditedTime': return '✏️';
      case 'createdBy': return '👤';
      case 'lastEditedBy': return '👤';
      case 'files': return '📁';
      case 'custom': return '⚙️';
      default: return '📄';
    }
  };

  if (collapsed) {
    return (
      <div className="properties-panel collapsed">
        <button 
          onClick={onToggleCollapsed}
          className="properties-toggle"
        >
          <ChevronRight size={16} />
          <span>Properties ({currentProperties.length})</span>
        </button>
      </div>
    );
  }

  if (showCustomBuilder) {
    return (
      <CustomPropertyBuilder
        onPropertyCreated={addCustomProperty}
        onCancel={() => setShowCustomBuilder(false)}
        existingProperties={allAvailableProperties}
      />
    );
  }

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <button 
          onClick={onToggleCollapsed}
          className="properties-toggle"
        >
          <ChevronDown size={16} />
          <span>Properties</span>
        </button>
        <Settings size={16} className="properties-settings" />
      </div>

      <div className="properties-content">
        {/* Existing Properties */}
        {currentProperties.map((property) => {
          const propertyDef = allAvailableProperties.find(p => p.id === property.propertyId);
          if (!propertyDef) return null;

          return (
            <div key={property.propertyId} className="property-row">
              <div className="property-header">
                <span className="property-name">
                  {propertyDef.name}
                  {propertyDef.isFormula && <Calculator size={14} className="formula-icon" />}
                  {propertyDef.isCustom && <Sparkles size={14} className="custom-icon" />}
                </span>
                {propertyDef.unit && <span className="property-unit">({propertyDef.unit})</span>}
              </div>
              <PropertyInput
                property={propertyDef}
                value={property.value}
                onChange={(value) => handlePropertyChange(property.propertyId, value)}
                showValidation={true}
              />
              {propertyDef.isFormula && property.error && (
                <div className="formula-error">{property.error}</div>
              )}
              {propertyDef.isFormula && property.lastCalculated && (
                <div className="formula-info">
                  Last calculated: {new Date(property.lastCalculated).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Property Section - Enhanced */}
        <div className="add-property-section">
          <div className="add-property-buttons">
            <button
              onClick={() => setShowAddProperty(!showAddProperty)}
              className="add-property-button"
            >
              <Plus size={16} />
              <span>Add Property</span>
              {showAddProperty ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            <button
              onClick={() => setShowCustomBuilder(true)}
              className="add-custom-button"
            >
              <Sparkles size={16} />
              <span>Create Custom</span>
            </button>
            
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="add-template-button"
            >
              <Calculator size={16} />
              <span>Templates</span>
              {showTemplates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* Property Templates */}
          {showTemplates && (
            <div className="templates-dropdown">
              <div className="templates-header">
                <span>Choose a property template:</span>
              </div>
              {PROPERTY_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => addTemplate(template)}
                  className="template-option"
                >
                  <span className="template-name">{template.name}</span>
                  <span className="template-description">{template.description}</span>
                  <span className="template-category">{template.category}</span>
                  <span className="template-count">{template.properties.length} properties</span>
                </button>
              ))}
            </div>
          )}

          {/* Add Property Dropdown */}
          {showAddProperty && (
            <div className="add-property-dropdown">
              <div className="add-property-header">
                <span>Choose a property to add:</span>
              </div>
              {allAvailableProperties
                .filter(prop => !currentProperties.find(p => p.propertyId === prop.id))
                .map((property) => (
                  <button
                    key={property.id}
                    onClick={() => addProperty(property)}
                    className="add-property-option"
                  >
                    <span className="property-type-icon">{getPropertyTypeIcon(property.type)}</span>
                    <span className="property-name">{property.name}</span>
                    <span className="property-type">{property.type}</span>
                    {property.isCustom && <span className="custom-badge">Custom</span>}
                    {property.isFormula && <span className="formula-badge">Formula</span>}
                  </button>
                ))}
              {allAvailableProperties
                .filter(prop => !currentProperties.find(p => p.propertyId === prop.id))
                .length === 0 && (
                <div className="no-more-properties">
                  All available properties are already added!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="properties-section">
          <h4>Categories</h4>
          <div className="categories-list">
            {properties?.categories?.map((category, index) => (
              <span key={index} className="category-tag">{category}</span>
            )) || <span className="no-categories">No categories</span>}
          </div>
        </div>

        {/* Backlinks Section */}
        <div className="properties-section">
          <h4>Backlinks</h4>
          <div className="backlinks-list">
            {properties?.backlinks?.map((backlink, index) => (
              <div key={index} className="backlink-item">{backlink}</div>
            )) || <span className="no-backlinks">No backlinks</span>}
          </div>
        </div>

        {/* Tags Section */}
        <div className="properties-section">
          <h4>Tags</h4>
          <div className="tags-list">
            {properties?.tags?.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            )) || <span className="no-tags">No tags</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
