// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAu24f6vmreUJOjTVpH4NQ1zhP5LyTC2s0",
  authDomain: "eyobchat-1769b.firebaseapp.com",
  databaseURL: "https://eyobchat-1769b-default-rtdb.firebaseio.com",
  projectId: "eyobchat-1769b",
  storageBucket: "eyobchat-1769b.firebasestorage.app",
  messagingSenderId: "175396149369",
  appId: "1:175396149369:web:b310d2fb7132cacad11ca8",
  measurementId: "G-0XX85HVLKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Sign Up Function
function signUp() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message");

  if (!name || !email) {
    message.innerText = "Please enter all fields!";
    return;
  }

  // Create user with email and a temporary password
  createUserWithEmailAndPassword(auth, email, "tempPassword123")
    .then((userCredential) => {
      const user = userCredential.user;

      // Save user data to Firebase Realtime Database
      set(ref(db, "users/" + user.uid), {
        name: name,
        email: email,
        verified: false // Email is not verified yet
      })
        .then(() => {
          // Send email verification
          sendEmailVerification(user)
            .then(() => {
              message.innerText = "Verification email sent! Check your inbox.";
            })
            .catch((error) => {
              message.innerText = "Failed to send verification email: " + error.message;
            });
        })
        .catch((error) => {
          message.innerText = "Failed to save user data: " + error.message;
        });
    })
    .catch((error) => {
      message.innerText = error.message;
    });
}

// Login Function
function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const loginMessage = document.getElementById("login-message");

  if (!email || !password) {
    loginMessage.innerText = "Please enter email and password!";
    return;
  }

  // Sign in the user
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      loginMessage.innerText = "Login successful! Redirecting...";

      // Redirect to the main app page (you can create this later)
      setTimeout(() => {
        window.location.href = "main.html";
      }, 2000);
    })
    .catch((error) => {
      loginMessage.innerText = "Login failed: " + error.message;
    });
}

// Attach the signUp function to the signup button
if (document.getElementById("signup-button")) {
  document.getElementById("signup-button").addEventListener("click", signUp);
}

// Attach the login function to the login button
if (document.getElementById("login-button")) {
  document.getElementById("login-button").addEventListener("click", login);
}