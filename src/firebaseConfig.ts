import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCnshcRehG0E3PuzkI2XGAtiEgdNGw5pGk",
    authDomain: "wanderlust-ai-e98e8.firebaseapp.com",
    projectId: "wanderlust-ai-e98e8",
    storageBucket: "wanderlust-ai-e98e8.firebasestorage.app",
    messagingSenderId: "579063896194",
    appId: "1:579063896194:web:36eb20031ac00e3955fc9b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
