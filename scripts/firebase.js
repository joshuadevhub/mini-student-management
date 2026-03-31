// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAL6nkLNvv-N4MMDb59Gu3m5OFvJzq7yng",
  authDomain: "student-manager-app-7ef87.firebaseapp.com",
  projectId: "student-manager-app-7ef87",
  storageBucket: "student-manager-app-7ef87.firebasestorage.app",
  messagingSenderId: "645062876171",
  appId: "1:645062876171:web:ef469d047c56d484363b0e",
  measurementId: "G-W0W3L25DXV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);
