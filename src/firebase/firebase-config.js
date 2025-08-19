import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
  apiKey: "AIzaSyCuJiErDjrG3vuK3If3ZGqWcqaBY9vpNv4",
  authDomain: "marraquetas-ya.firebaseapp.com",
  projectId: "marraquetas-ya",
  storageBucket: "marraquetas-ya.firebasestorage.app",
  messagingSenderId: "775634667861",
  appId: "1:775634667861:web:83a5ac7a737424931a07dc"
};


const app = initializeApp(firebaseConfig);

export const FirebaseAuth = getAuth(app)
export const FirestoreDB = getFirestore(app)


