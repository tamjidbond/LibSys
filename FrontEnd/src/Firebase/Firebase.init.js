// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUgThWXg7Ge717j4PWgbgTAvjW8984IZA",
  authDomain: "libsys-b67f1.firebaseapp.com",
  projectId: "libsys-b67f1",
  storageBucket: "libsys-b67f1.firebasestorage.app",
  messagingSenderId: "884692051465",
  appId: "1:884692051465:web:8a8d477d9ef00e9354fad8",
  measurementId: "G-6S8H0R0MV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export default auth;
