import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCYR13jfjOnujd5L9k0Y2oJT8yKw5--qEA",
  authDomain: "fireblogs-1ec75.firebaseapp.com",
  projectId: "fireblogs-1ec75",
  storageBucket: "fireblogs-1ec75.appspot.com",
  messagingSenderId: "21401671087",
  appId: "1:21401671087:web:fd2bc1e9a714a20bed4b5a",
  measurementId: "G-2QC2D5260W",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
