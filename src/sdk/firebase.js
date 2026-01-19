import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmBTZtKu0RfVBnPXAODG9nESMhx81Dvp0",
  authDomain: "react-login-96b85.firebaseapp.com",
  projectId: "react-login-96b85",
  storageBucket: "react-login-96b85.firebasestorage.app",
  messagingSenderId: "435845695260",
  appId: "1:435845695260:web:a98018f95cdf74e963dcd9",
  measurementId: "G-L0FMGT2DCM",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
