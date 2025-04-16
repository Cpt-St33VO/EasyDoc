import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseApp } from "./firebaseConfig";
import AuthForm from "./components/AuthForm";
import UploadForm from "./components/UploadForm";
import axios from "axios";

const auth = getAuth(firebaseApp);

function App() {
  const [user, setUser] = useState(null);
  const [uploadURL, setUploadURL] = useState("");
  const [aiResponse, setAIResponse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    setUploadURL("");
    setAIResponse(null);
    signOut(auth);
  };

  const handleUploadSuccess = async (url) => {
    setUploadURL(url);
    setAIResponse(null);
    setError("");

    try {
      const response = await axios.post(
        "https://easydoc-backend-1017571777844.us-central1.run.app/api/upload-url"
        { file_url: url }
      );

      console.log("✅ AI Response:", response.data);
      setAIResponse(response.data);
    } catch (err) {
      console.error("❌ AI processing failed:", err);
      setError("AI failed to process the uploaded document.");
    }
  };

  return (
    <div className="app" style={{ padding: "2rem", color: "#fff" }}>
      <h1>📄 EasyDoc AI</h1>

      {!user ? (
        <AuthForm onAuth={setUser} />
      ) : (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>

          <hr />

          <UploadForm onUploadSuccess={handleUploadSuccess} />

          {uploadURL && (
            <div style={{ marginTop: "20px" }}>
              <p>✅ PDF Uploaded Successfully</p>
              <a
                href={uploadURL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#00f" }}
              >
                View Uploaded PDF
              </a>
            </div>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          {aiResponse && (
            <div style={{ marginTop: "2rem", background: "#222", padding: "1rem", borderRadius: "8px" }}>
              <h3>{aiResponse.chat_message}</h3>
              <ul>
                {aiResponse.fields?.map((field, index) => (
                  <li key={index}>
                    {field.label} ({field.type}) – found {field.instances} time(s)
                  </li>
                ))}
              </ul>
              <h4>Next steps:</h4>
              {aiResponse.suggestions?.map((s, i) => (
                <button key={i} style={{ margin: "5px" }}>{s}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
