import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';

// PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function EditDocument() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fields, setFields] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.3);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPdfUrl(localStorage.getItem("pdfUrl") || "");
      setFields(JSON.parse(localStorage.getItem("fields") || "[]"));
    }
  }, []);

  const updateField = (idx, updated) => {
    const newFields = [...fields];
    newFields[idx] = { ...newFields[idx], ...updated };
    setFields(newFields);
  };

  const updatePosition = (idx, data) => {
    const [x, y] = [data.x, data.y];
    const width = fields[idx].bbox[2] - fields[idx].bbox[0];
    const height = fields[idx].bbox[3] - fields[idx].bbox[1];
    updateField(idx, { bbox: [x, y, x + width, y + height] });
  };

  const updateSize = (idx, width, height) => {
    const [x, y] = [fields[idx].bbox[0], fields[idx].bbox[1]];
    updateField(idx, { bbox: [x, y, x + width, y + height] });
  };

  const handleSave = () => {
    localStorage.setItem("editedFields", JSON.stringify(fields));
    window.location.href = "/review";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit Fields</h2>
      {pdfUrl && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>

          {fields.map((field, idx) => {
            const [x0, y0, x1, y1] = field.bbox;
            const width = (x1 - x0);
            const height = (y1 - y0);
            return (
              <Draggable
                key={idx}
                defaultPosition={{ x: x0, y: y0 }}
                onStop={(e, data) => updatePosition(idx, data)}
              >
                <Resizable
                  defaultSize={{ width, height }}
                  onResizeStop={(e, dir, ref, d) => updateSize(idx, ref.offsetWidth, ref.offsetHeight)}
                  style={{
                    position: 'absolute',
                    border: '2px solid red',
                    backgroundColor: 'rgba(255,0,0,0.2)',
                    zIndex: 5
                  }}
                >
                  <input
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    style={{ fontSize: 10, width: '100%' }}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(idx, { type: e.target.value })}
                    style={{ fontSize: 10, width: '100%' }}
                  >
                    <option value="text">Text</option>
                    <option value="signature">Signature</option>
                    <option value="initials">Initials</option>
                    <option value="date">Date</option>
                  </select>
                </Resizable>
              </Draggable>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave}>✅ Save & Review</button>
      </div>
    </div>
  );
}

