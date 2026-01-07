import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXkj7z4XpH85FTh8clp-_MwuurDXhcs-k",
  authDomain: "peer2peer-46ac2.firebaseapp.com",
  projectId: "peer2peer-46ac2",
  appId: "1:325337547846:web:a07443b89766c958107647"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
