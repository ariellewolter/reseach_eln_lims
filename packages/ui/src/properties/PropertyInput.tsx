import React from 'react';
import { PropertyDefinition, PropertyValue, PropertyOption, PropertyValidationError } from '@research/types/properties';
import { validatePropertyValue } from '@research/utils/properties';

interface PropertyInputProps {
  property: PropertyDefinition;
  value?: any;
  onChange: (value: any) => void;
  showValidation?: boolean;
}

export function PropertyInput({ property, value, onChange, showValidation = true }: PropertyInputProps) {
  const validationError = showValidation ? validatePropertyValue(property, value) : null;

  const renderInput = () => {
    const inputClass = validationError ? 'property-input error' : 'property-input';
    
    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${property.name.toLowerCase()}`}
            className={inputClass}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder="0"
            className={inputClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="property-checkbox"
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
          />
        );

      case 'select':
      case 'status':
      case 'priority':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Select {property.name.toLowerCase()}</option>
            {property.options?.map((option) => {
              if (typeof option === 'string') {
                return <option key={option} value={option}>{option}</option>;
              } else {
                return <option key={option.id} value={option.id}>{option.name}</option>;
              }
            })}
          </select>
        );

      case 'multiSelect':
      case 'tags':
        return <TagsInput value={value || []} onChange={onChange} options={property.options?.map(opt => typeof opt === 'string' ? opt : opt.name)} />;

      case 'relation':
        return <RelationInput 
          value={value} 
          onChange={onChange} 
        />;

      case 'createdTime':
      case 'lastEditedTime':
        return (
          <span className="property-readonly">
            {value ? new Date(value).toLocaleDateString() : 'Not set'}
          </span>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );
    }
  };

  return (
    <div className="property-row">
      <label className="property-label">
        {property.name}
        {property.required && <span className="required-indicator">*</span>}
      </label>
      <div className="property-value">
        {renderInput()}
        {validationError && (
          <div className="validation-error">
            {validationError.message}
          </div>
        )}
      </div>
    </div>
  );
}

// Tags/Multi-select component
function TagsInput({ 
  value, 
  onChange, 
  options 
}: { 
  value: string[]; 
  onChange: (value: string[]) => void;
  options?: string[];
}) {
  const [inputValue, setInputValue] = React.useState('');

  const addTag = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="tags-input">
      <div className="tags-list">
        {value.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button onClick={() => removeTag(tag)} className="tag-remove">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
          }
        }}
        placeholder="Add tag..."
        className="tags-input-field"
      />
      {options && (
        <div className="tags-suggestions">
          {options
            .filter(opt => !value.includes(opt) && opt.toLowerCase().includes(inputValue.toLowerCase()))
            .map(opt => (
              <button
                key={opt}
                onClick={() => addTag(opt)}
                className="tag-suggestion"
              >
                {opt}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// Relation/Reference component
function RelationInput({ 
  value, 
  onChange, 
  relationTo,
  documentType
}: { 
  value?: string; 
  onChange: (value: string) => void;
  relationTo?: string;
  documentType?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Mock documents for demo - in real app this would come from your data store
  const mockDocuments = [
    { id: '1', title: 'Experiment Protocol - DNA Extraction', type: 'note' },
    { id: '2', title: 'Chemical Inventory Table', type: 'table' },
    { id: '3', title: 'Gene Expression Study Project', type: 'project' },
    { id: '4', title: 'Order New Primers Task', type: 'task' }
  ];

  const filteredDocuments = mockDocuments.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!relationTo || doc.type === relationTo)
  );

  const selectedDocument = mockDocuments.find(doc => doc.id === value);

  return (
    <div className="relation-input">
      {selectedDocument ? (
        <div className="relation-selected">
          <span className="relation-title">{selectedDocument.title}</span>
          <button 
            onClick={() => onChange('')} 
            className="relation-remove"
            title="Remove relation"
          >
            ×
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="relation-picker-button"
        >
          Select {relationTo || 'document'}...
        </button>
      )}

      {isOpen && (
        <div className="relation-picker-modal">
          <div className="relation-picker-header">
            <h4>Select {relationTo || 'Document'}</h4>
            <button 
              onClick={() => setIsOpen(false)} 
              className="relation-picker-close"
            >
              ×
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relation-search"
          />
          
          <div className="relation-picker-list">
            {filteredDocuments.map(doc => (
              <button
                key={doc.id}
                onClick={() => {
                  onChange(doc.id);
                  setIsOpen(false);
                }}
                className="relation-option"
              >
                <span className="relation-option-title">{doc.title}</span>
                <span className="relation-option-type">{doc.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
