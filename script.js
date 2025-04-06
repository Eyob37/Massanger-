
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAu24f6vmreUJOjTVpH4NQ1zhP5LyTC2s0",
  authDomain: "eyobchat-1769b.firebaseapp.com",
  databaseURL: "https://eyobchat-1769b-default-rtdb.firebaseio.com",
  projectId: "eyobchat-1769b",
  storageBucket: "eyobchat-1769b.appspot.com", // FIXED storageBucket
  messagingSenderId: "175396149369",
  appId: "1:175396149369:web:b310d2fb7132cacad11ca8",
  measurementId: "G-0XX85HVLKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Initialize EmailJS
(function() {
    emailjs.init("7UGwi5Gy7R_A48GpD"); // Replace with your actual EmailJS Public Key
})();

// Function to Send Email Verification using EmailJS
function sendEmail(userName, userEmail, verificationCode) {
    var params = {
        name: userName, 
        email: userEmail, 
        code: verificationCode // Pass the generated code
    };

    emailjs.send("service_sjp7z9x", "template_wi5pwvs", params)
        .then(function(response) {
            alert("Verification email sent successfully! Check your inbox.");
            window.location.href = "verification.html"; // Redirect user to verification page
        }, function(error) {
            alert("Failed to send email. Error: " + JSON.stringify(error));
        });
}

// Sign Up Function
function signUp() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message");

  if (!name || !email) {
    message.innerText = "Please enter all fields!";
    return;
  }

  // Check if the email is already registered
  fetchSignInMethodsForEmail(auth, email)
    .then((methods) => {
      if (methods.length > 0) {
        message.innerText = "Email is already in use. Please use a different email.";
        return;
      }

      // Create user with email and a temporary password
      return createUserWithEmailAndPassword(auth, email, "tempPassword123");
    })
    .then((userCredential) => {
      if (!userCredential) return; // If user exists, don't continue

      const user = userCredential.user;
      message.innerText = "Account created! Sending verification email...";

      // Generate a verification code (6-digit random number)
      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      // Save verification code in localStorage
      localStorage.setItem("verificationCode", verificationCode);
      // Inside the .then block after user creation
      set(ref(db, "EyobChat/users/" + user.uid), {
        name: name,
        email: email,
        verified: false
      });
      // Send verification email using EmailJS
      sendEmail(name, email, verificationCode);
      
    })
    .catch((error) => {
      message.innerText = "Error: " + error.message;
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

      // Get user info from database
      const userRef = ref(db, "EyobChat/users/" + user.uid); // FIXED: use db instead of database
      get(userRef).then(snapshot => {
        if (snapshot.exists()) {
          const userData = snapshot.val();

          // Save user info to localStorage
          localStorage.setItem("userInfo", JSON.stringify({
            name: userData.name,
            id: user.uid,
            email: user.email
          }));

          // Redirect to the main app page
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
        } else {
          loginMessage.innerText = "User data not found.";
        }
      });
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

