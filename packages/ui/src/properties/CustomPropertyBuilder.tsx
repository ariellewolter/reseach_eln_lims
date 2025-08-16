import React, { useState } from 'react';
import { PropertyDefinition, PropertyType, PropertyValidation } from '@research/types';
import { createCustomProperty, validateCustomProperty } from '@research/utils';
import { X, Plus, Calculator, Settings } from 'lucide-react';

interface CustomPropertyBuilderProps {
  onPropertyCreated: (property: PropertyDefinition) => void;
  onCancel: () => void;
  existingProperties: PropertyDefinition[];
}

export const CustomPropertyBuilder: React.FC<CustomPropertyBuilderProps> = ({
  onPropertyCreated,
  onCancel,
  existingProperties
}) => {
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('text');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(false);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('Custom');
  const [options, setOptions] = useState<string[]>(['']);
  const [formula, setFormula] = useState('');
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [validation, setValidation] = useState<PropertyValidation>({});
  const [errors, setErrors] = useState<string[]>([]);

  const propertyTypes: { value: PropertyType; label: string; icon: string }[] = [
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'number', label: 'Number', icon: '🔢' },
    { value: 'select', label: 'Select', icon: '📋' },
    { value: 'multiSelect', label: 'Multi-Select', icon: '📋' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { value: 'url', label: 'URL', icon: '🔗' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Phone', icon: '📞' },
    { value: 'tags', label: 'Tags', icon: '🏷️' },
    { value: 'formula', label: 'Formula', icon: '🧮' },
    { value: 'relation', label: 'Relation', icon: '🔗' }
  ];

  const availableDependencies = existingProperties
    .filter(p => p.type === 'number' || p.type === 'date' || p.type === 'select')
    .map(p => ({ id: p.id, name: p.name, type: p.type }));

  const handleCreateProperty = () => {
    // Validate the property
    const property = createCustomProperty(propertyName, propertyType, {
      description,
      required,
      options: propertyType === 'select' || propertyType === 'multiSelect' ? options.filter(o => o.trim()) : undefined,
      validation,
      unit,
      category,
      formula: propertyType === 'formula' ? formula : undefined,
      dependsOn: propertyType === 'formula' ? dependsOn : undefined
    });

    const validationErrors = validateCustomProperty(property);
    if (validationErrors.length > 0) {
      setErrors(validationErrors.map(e => e.message));
      return;
    }

    onPropertyCreated(property);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addDependency = (propertyId: string) => {
    if (!dependsOn.includes(propertyId)) {
      setDependsOn([...dependsOn, propertyId]);
    }
  };

  const removeDependency = (propertyId: string) => {
    setDependsOn(dependsOn.filter(id => id !== propertyId));
  };

  const updateValidation = (field: keyof PropertyValidation, value: any) => {
    setValidation(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="custom-property-builder">
      <div className="builder-header">
        <h3>Create Custom Property</h3>
        <button onClick={onCancel} className="close-button">
          <X size={16} />
        </button>
      </div>

      <div className="builder-content">
        {/* Basic Information */}
        <div className="builder-section">
          <h4>Basic Information</h4>
          
          <div className="form-row">
            <label>Property Name *</label>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g., Sample Count, Experiment Type"
              maxLength={50}
            />
          </div>

          <div className="form-row">
            <label>Property Type *</label>
            <div className="type-selector">
              {propertyTypes.map(type => (
                <button
                  key={type.value}
                  className={`type-option ${propertyType === type.value ? 'selected' : ''}`}
                  onClick={() => setPropertyType(type.value)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this property is for..."
              rows={2}
            />
          </div>

          <div className="form-row">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Experiment, Project, Team"
            />
          </div>

          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              Required field
            </label>
          </div>
        </div>

        {/* Type-Specific Options */}
        {(propertyType === 'select' || propertyType === 'multiSelect') && (
          <div className="builder-section">
            <h4>Options</h4>
            {options.map((option, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => removeOption(index)}
                  className="remove-option"
                  disabled={options.length === 1}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button onClick={addOption} className="add-option">
              <Plus size={14} />
              Add Option
            </button>
          </div>
        )}

        {/* Formula Configuration */}
        {propertyType === 'formula' && (
          <div className="builder-section">
            <h4>
              <Calculator size={16} />
              Formula Configuration
            </h4>
            
            <div className="form-row">
              <label>Formula Expression *</label>
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., DATEDIFF(due-date, TODAY()), budget - expenses, IF(status = 'Completed', 100, 50)"
                rows={3}
              />
            </div>

            <div className="form-row">
              <label>Dependencies</label>
              <div className="dependencies-list">
                {dependsOn.map(propId => {
                  const prop = existingProperties.find(p => p.id === propId);
                  return (
                    <span key={propId} className="dependency-tag">
                      {prop?.name || propId}
                      <button onClick={() => removeDependency(propId)}>
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="available-dependencies">
                <span>Available properties:</span>
                {availableDependencies
                  .filter(dep => !dependsOn.includes(dep.id))
                  .map(dep => (
                    <button
                      key={dep.id}
                      onClick={() => addDependency(dep.id)}
                      className="dependency-option"
                    >
                      {dep.name} ({dep.type})
                    </button>
                  ))}
              </div>
            </div>

            <div className="formula-help">
              <h5>Formula Examples:</h5>
              <ul>
                <li><code>DATEDIFF(due-date, TODAY())</code> - Days until due</li>
                <li><code>budget - expenses</code> - Simple arithmetic</li>
                <li><code>IF(status = 'Completed', 100, 50)</code> - Conditional logic</li>
                <li><code>SUM(expense1, expense2, expense3)</code> - Sum of properties</li>
              </ul>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div className="builder-section">
          <h4>
            <Settings size={16} />
            Validation Rules
          </h4>
          
          {(propertyType === 'number' || propertyType === 'text') && (
            <>
              {propertyType === 'text' && (
                <>
                  <div className="form-row">
                    <label>Minimum Length</label>
                    <input
                      type="number"
                      value={validation.minLength || ''}
                      onChange={(e) => updateValidation('minLength', e.target.value ? Number(e.target.value) : undefined)}
                      min={0}
                    />
                  </div>
                  <div className="form-row">
                    <label>Maximum Length</label>
                    <input
                      type="number"
                      value={validation.maxLength || ''}
                      onChange={(e) => updateValidation('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                      min={0}
                    />
                  </div>
                </>
              )}
              
              {propertyType === 'number' && (
                <>
                  <div className="form-row">
                    <label>Minimum Value</label>
                    <input
                      type="number"
                      value={validation.min || ''}
                      onChange={(e) => updateValidation('min', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Maximum Value</label>
                    <input
                      type="number"
                      value={validation.max || ''}
                      onChange={(e) => updateValidation('max', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {propertyType === 'text' && (
            <div className="form-row">
              <label>Pattern (Regex)</label>
              <input
                type="text"
                value={validation.pattern || ''}
                onChange={(e) => updateValidation('pattern', e.target.value || undefined)}
                placeholder="e.g., ^[A-Za-z]+$ for letters only"
              />
            </div>
          )}
        </div>

        {/* Unit */}
        {(propertyType === 'number' || propertyType === 'formula') && (
          <div className="builder-section">
            <h4>Unit of Measurement</h4>
            <div className="form-row">
              <label>Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., mg, °C, %, days, people"
              />
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="builder-errors">
            {errors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="builder-actions">
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleCreateProperty} className="create-button">
            Create Property
          </button>
        </div>
      </div>
    </div>
  );
};
