import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const usersRef = collection(db, "users");
  const q = query(usersRef, limit(3));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("No users in DB");
    return;
  }

  snapshot.forEach((doc) => {
    console.log("User doc:", doc.id);
    console.log(Object.keys(doc.data()));
    console.log(JSON.stringify(doc.data(), null, 2));
  });

  process.exit(0);
}

check().catch(console.error);
