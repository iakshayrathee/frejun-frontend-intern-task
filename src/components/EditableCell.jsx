import { useState, useEffect, memo } from 'react';
import { FiSave, FiX, FiEdit2 } from 'react-icons/fi';

const EditableCell = memo(({ 
  isEditing, 
  value, 
  field, 
  onEdit, 
  onSave, 
  onCancel, 
  isSaving,
  fieldType = 'text'
}) => {
  // Render counter for performance diagnostic
 // console.count(`EditableCell render - field: ${field}`);

  const [editValue, setEditValue] = useState(value);
  
  useEffect(() => {
    if (isEditing) {
      setEditValue(value);
    }
  }, [isEditing, value]);

  const handleSave = () => onSave(editValue);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (!e.ctrlKey || fieldType !== 'textarea')) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && fieldType === 'textarea') {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="edit-container">
        {fieldType === 'textarea' ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="edit-textarea"
            rows="3"
            placeholder={`Enter ${field}...`}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="edit-input"
            placeholder={`Enter ${field}...`}
          />
        )}
        <div className="edit-actions">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="save-btn"
            aria-label={`Save ${field} changes`}
          >
            {isSaving ? (
              <span className="saving-text">Saving...</span>
            ) : (
              <>
                <FiSave className="action-icon" />
                <span className="action-text">Save</span>
              </>
            )}
          </button>
          <button 
            onClick={onCancel}
            disabled={isSaving}
            className="cancel-btn"
            aria-label="Cancel editing"
          >
            <FiX className="action-icon" />
            <span className="action-text">Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <div className="editable-content">
      <div className="editable-text">{value}</div>
      <div 
        className="edit-icon-container"
        onClick={handleEditClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleEditClick(e)}
        aria-label={`Edit ${field}`}
      >
        <FiEdit2 className="edit-icon" />
      </div>
    </div>
  );
});

export default EditableCell;
