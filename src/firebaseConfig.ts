import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyQmye2fGgIpCUdwvpRsM3onZOsKFflWU",
  authDomain: "smartkantin-e75ae.firebaseapp.com",
  projectId: "smartkantin-e75ae",
  storageBucket: "smartkantin-e75ae.firebasestorage.app",
  messagingSenderId: "49491734279",
  appId: "1:49491734279:web:7a208a4a716eee67e31fa2",
  measurementId: "G-RCGC8RLFE6"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor fungsi agar bisa dipakai di halaman lain
export const auth = getAuth(app);
export const db = getFirestore(app);