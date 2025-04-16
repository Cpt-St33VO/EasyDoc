import React, { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "../firebaseConfig";

const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setFile(null);
      setError("Only PDF files are allowed.");
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to upload.");
      return;
    }

    const filePath = `uploads/${user.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);
    setProgress(0);
    setError("");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload progress:", pct);
        setProgress(Math.round(pct));
      },
      (err) => {
        console.error("Upload error:", err);
        setError("Upload failed. Check console for details.");
        setUploading(false);
      },
      () => {
        console.log("✅ Upload complete");
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("📄 File URL:", downloadURL);
          setUploading(false);
          setFile(null);
          setProgress(0);
          onUploadSuccess(downloadURL);
        });
      }
    );
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? `Uploading... ${progress}%` : "Upload PDF"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default UploadForm;
