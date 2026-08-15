// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDw6kGvXzkwjyAmgmCLSSJrSSASY4xqjKA",
  authDomain: "amol-tracker.firebaseapp.com",
  projectId: "amol-tracker",
  storageBucket: "amol-tracker.firebasestorage.app",
  messagingSenderId: "676050400746",
  appId: "1:676050400746:web:046f055eb410a7753d6e93",
  measurementId: "G-YLC97NSTX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);