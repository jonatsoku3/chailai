// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, Timestamp, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);


// --- Initial Data Seeding ---
// This function checks and creates default admin/technician users if they don't exist.
const seedInitialUsers = async () => {
  const adminData = {
    email: 'admin@chailainails.com',
    password: 'admin1234',
    profile: {
      email: 'admin@chailainails.com',
      name: 'ผู้ดูแลระบบ',
      phone: '0800000000',
      lineId: 'admin.chailai',
      role: 'admin' as const,
      position: 'ผู้จัดการ'
    }
  };

  const techData = {
    email: 'technician@chailainails.com',
    password: 'tech1234',
    profile: {
      email: 'technician@chailainails.com',
      name: 'ช่าง A',
      phone: '0811111111',
      lineId: 'tech.chailai',
      role: 'technician' as const,
      position: 'ช่างทำเล็บ'
    }
  };

  // Fix: The parameter type for `userData` was too specific, only allowing the admin data structure. 
  // By using a union type (`typeof adminData | typeof techData`), the function now correctly accepts both admin and technician user data.
  const createUser = async (userData: typeof adminData | typeof techData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const { uid } = userCredential.user;
      const profileData = {
        ...userData.profile,
        profilePicture: `https://picsum.photos/seed/${uid}/100`,
      };
      await setDoc(doc(db, "users", uid), profileData);
      console.log(`Successfully created ${userData.profile.role} user.`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`${userData.profile.role} user already exists.`);
      } else {
        console.error(`Error creating ${userData.profile.role} user:`, error);
      }
    }
  };

  await createUser(adminData);
  await createUser(techData);
};

// Run the seeding function when this module is loaded.
seedInitialUsers();


export { app, analytics, db, auth, Timestamp };