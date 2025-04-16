import React, { useState } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [filename, setFilename] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState({});
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('https://easydoc-steevo346.pythonanywhere.com/api/upload/', formData);
      const { fields: detectedFields, filename: uploadedFilename } = response.data;

      const uploadedUrl = `https://easydoc-steevo346.pythonanywhere.com/uploads/${uploadedFilename}`;

      setFields(detectedFields);
      setFilename(uploadedFilename);
      setPdfUrl(uploadedUrl);

      // Default select all fields
      const initialSelection = {};
      detectedFields.forEach(field => {
        initialSelection[field.key] = true;
      });
      setSelectedFields(initialSelection);

      // Store in localStorage
      localStorage.setItem("pdfUrl", uploadedUrl);
      localStorage.setItem("filename", uploadedFilename);
      localStorage.setItem("fields", JSON.stringify(detectedFields));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload or detect fields.');
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (key) => {
    setSelectedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!filename) {
      alert("No filename found.");
      return;
    }

    const finalFields = fields.filter(field => selectedFields[field.key]);

    if (finalFields.length === 0) {
      alert("Please select at least one field.");
      return;
    }

    try {
      setSaving(true);

      await axios.post('https://easydoc-steevo346.pythonanywhere.com/api/save-fields/', {
        filename,
        fields: finalFields,
      });

      // Update localStorage
      localStorage.setItem("fields", JSON.stringify(finalFields));

      // Redirect to editing screen
      window.location.href = "/edit";
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📄 EasyDoc Uploader</h1>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "⏳ Detecting..." : "📤 Upload & Detect"}
      </button>

      {pdfUrl && (
        <div style={{ marginTop: 20 }}>
          <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                scale={1.3}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      )}

      {fields.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Detected Fields:</h3>
          <ul>
            {fields.map((field, idx) => (
              <li key={idx}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!selectedFields[field.key]}
                    onChange={() => toggleField(field.key)}
                  />
                  {field.label} — <i>{field.type}</i> (Page {field.page})
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleSave} disabled={saving}>
            ✅ Save & Edit Fields
          </button>
        </div>
      )}
    </div>
  );
}
