import React, { useState } from 'react';

export default function FieldOverlay({ fields, scale = 1, onUpdate }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempLabel, setTempLabel] = useState('');
  const [tempType, setTempType] = useState('');

  const handleDoubleClick = (index, field) => {
    setEditingIndex(index);
    setTempLabel(field.label);
    setTempType(field.type);
  };

  const handleSave = () => {
    if (onUpdate && editingIndex !== null) {
      const updatedField = {
        ...fields[editingIndex],
        label: tempLabel,
        type: tempType
      };
      const updatedFields = [...fields];
      updatedFields[editingIndex] = updatedField;
      onUpdate(updatedFields);
    }
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    if (onUpdate) onUpdate(updatedFields);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 5 }}>
      {fields.map((field, idx) => {
        const [x0, y0, x1, y1] = field.bbox;
        const width = (x1 - x0) * scale * 0.9; // Adjust for better fit
        const height = (y1 - y0) * scale * 0.9;
        const isEditing = editingIndex === idx;

        return (
          <div
            key={idx}
            onDoubleClick={() => handleDoubleClick(idx, field)}
            style={{
              position: 'absolute',
              left: x0 * scale,
              top: y0 * scale,
              width,
              height,
              border: isEditing ? '2px solid #007bff' : '1.5px dashed #007bff',
              borderRadius: 4,
              backgroundColor: isEditing ? 'rgba(0,123,255,0.15)' : 'transparent',
              padding: 3,
              fontSize: 10,
              color: '#007bff',
              boxSizing: 'border-box',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {isEditing ? (
              <div style={{ fontSize: 10 }}>
                <input
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  placeholder="Label"
                  style={{
                    fontSize: 10,
                    width: '100%',
                    marginBottom: 2
                  }}
                />
                <select
                  value={tempType}
                  onChange={(e) => setTempType(e.target.value)}
                  style={{ fontSize: 10, width: '100%' }}
                >
                  <option value="text">Text</option>
                  <option value="signature">Signature</option>
                  <option value="initials">Initials</option>
                  <option value="date">Date</option>
                </select>
                <div style={{ marginTop: 4, textAlign: 'right' }}>
                  <button
                    onClick={handleSave}
                    style={{
                      fontSize: 10,
                      marginRight: 4,
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    style={{
                      fontSize: 10,
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 10, opacity: 0.7 }}>
                {field.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
