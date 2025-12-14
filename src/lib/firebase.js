import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAJ1Oo9auwzneNNw7qUrtf1v9jIazp_Jqc",
    authDomain: "techsersales-4e89c.firebaseapp.com",
    projectId: "techsersales-4e89c",
    storageBucket: "techsersales-4e89c.firebasestorage.app",
    messagingSenderId: "1094657939354",
    appId: "1:1094657939354:web:23c6af7cb789a8b036cc23",
    measurementId: "G-CT6W88HFXV"
};

let app;
let messaging;

if (typeof window !== "undefined" && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    isSupported().then(supported => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
} else if (getApps().length > 0) {
    app = getApps()[0];
    isSupported().then(supported => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}

export { messaging, getToken };
