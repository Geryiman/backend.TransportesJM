import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA7d0vBbfFbyVcTIgybUDdnWpUHr iO3g4w",
  authDomain: "transportesjm-d72d3.firebaseapp.com",
  projectId: "transportesjm-d72d3",
  storageBucket: "transportesjm-d72d3.appspot.com",
  messagingSenderId: "299157939631",
  appId: "1:299157939631:web:d12f3339c934a0e9d5bb5a",
  measurementId: "G-6VD13BY0M8"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };