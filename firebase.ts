
// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/analytics";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBxzamZr-5WD0M6FdPBKshTTGGifT-frk",
  authDomain: "chailainails-booking.firebaseapp.com",
  projectId: "chailainails-booking",
  storageBucket: "chailainails-booking.firebasestorage.app",
  messagingSenderId: "332090265345",
  appId: "1:332090265345:web:8dc75745599eca01d65500",
  measurementId: "G-48L5D3H9D7"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();
const analytics = firebase.analytics();
const db = firebase.firestore();
const auth = firebase.auth();
const Timestamp = firebase.firestore.Timestamp;

export { app, analytics, db, auth, Timestamp };
