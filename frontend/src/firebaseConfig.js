// src/firebaseConfig.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDM_KvgyZ_rkuE0KHr8SIz6oJghAthqitA",
  authDomain: "easydoc-app-2025.firebaseapp.com",
  projectId: "easydoc-app-2025",
  storageBucket: "easydoc-app-2025.firebasestorage.app",
  messagingSenderId: "1017571777844",
  appId: "1:1017571777844:web:b62553c1a37beb267e5961",
  measurementId: "G-NW9GKCCVLL"
};


// ✅ You MUST export this as named export
export const firebaseApp = initializeApp(firebaseConfig);
