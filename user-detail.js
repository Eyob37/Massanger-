import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAu24f6vmreUJOjTVpH4NQ1zhP5LyTC2s0",
  authDomain: "eyobchat-1769b.firebaseapp.com",
  databaseURL: "https://eyobchat-1769b-default-rtdb.firebaseio.com",
  projectId: "eyobchat-1769b",
  storageBucket: "eyobchat-1769b.appspot.com",
  messagingSenderId: "175396149369",
  appId: "1:175396149369:web:b310d2fb7132cacad11ca8",
  measurementId: "G-0XX85HVLKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get userId from the URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userId");

if (!userId) {
  document.body.innerHTML = "<p>User ID not found in URL!</p>";
} else {
  const userRef = ref(db, "users/" + userId);
  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        document.getElementById("user-name").textContent = user.name;
        document.getElementById("user-email").textContent = user.email;
        document.getElementById("user-status").textContent =
          user.status === "online" ? "Online" : "Offline";
      } else {
        document.body.innerHTML = "<p>User not found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error loading user details:", error);
      document.body.innerHTML = "<p>Error loading user details.</p>";
    });
}