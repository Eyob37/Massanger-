import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  push,
  onChildAdded,
  serverTimestamp
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

alert("hello all");
// Get userId from URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

// Assume current user ID is stored locally (from login)
const currentUserId = localStorage.getItem("uid");

const userInfoDiv = document.getElementById("user-info");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

if (!userId || !currentUserId) {
  userInfoDiv.textContent = "Invalid user data.";
} else {
  // Display user info
  const userRef = ref(db, "users/" + userId);
  get(userRef).then(snapshot => {
    if (snapshot.exists()) {
      const user = snapshot.val();
      userInfoDiv.innerHTML = `<strong>Chatting with:</strong> ${user.name} (${user.email})`;
    } else {
      userInfoDiv.textContent = "User not found.";
    }
  });

  // Generate unique chat room ID based on user IDs (sorted)
  const chatId = [currentUserId, userId].sort().join("_");
  const chatRef = ref(db, `chats/${chatId}`);

  // Listen for new messages
  onChildAdded(chatRef, (snapshot) => {
    const message = snapshot.val();
    displayMessage(message);
  });

  // Send message
  sendButton.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (text) {
      const message = {
        sender: currentUserId,
        receiver: userId,
        text,
        timestamp: Date.now()
      };
      push(chatRef, message);
      messageInput.value = "";
    }
  });
}

function displayMessage(msg) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (msg.sender === currentUserId) {
    messageDiv.classList.add("sent");
  } else {
    messageDiv.classList.add("received");
  }

  messageDiv.textContent = msg.text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}