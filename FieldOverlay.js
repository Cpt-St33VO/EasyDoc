import React from 'react';

export default function FieldOverlay({ fields, scale = 1 }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, pointerEvents: 'none' }}>
      {fields.map((field, idx) => {
        const [x0, y0, x1, y1] = field.bbox;
        const width = (x1 - x0) * scale;
        const height = (y1 - y0) * scale;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: x0 * scale,
              top: y0 * scale,
              width,
              height,
              border: '2px dashed red',
              color: 'red',
              fontSize: 12,
              padding: 2,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255,255,255,0.4)',
              pointerEvents: 'auto'
            }}
            title={`Field: ${field.label} (${field.type})`}
          >
            {field.label}
          </div>
        );
      })}
    </div>
  );
}
