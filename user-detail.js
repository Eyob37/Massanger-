import { ref, get, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { auth } from "./firebase-init.js";
import { db } from "./firebase-init.js";

// Get userId from URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

const userInfo = document.getElementById("user-info");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
alert("hii all");
let currentUser = null;
let receiver = null;

// Get current user
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;

    // Get receiver info
    const userRef = ref(db, "users/" + userId);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        receiver = snapshot.val();

        userInfo.innerHTML = `
          <h2>Chat with ${receiver.name}</h2>
          <p>Email: ${receiver.email}</p>
          <p>Status: ${receiver.status === "online" ? "Online" : "Offline"}</p>
        `;

        // Start loading messages
        loadMessages();
      }
    });
  } else {
    userInfo.innerHTML = "<p>You must be logged in to chat.</p>";
  }
});

function loadMessages() {
  const chatRef = ref(db, `messages/${currentUser.uid}_${userId}`);

  onChildAdded(chatRef, (snapshot) => {
    const msg = snapshot.val();
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    if (msg.sender === currentUser.uid) {
      msgDiv.classList.add("sent");
    } else {
      msgDiv.classList.add("received");
    }

    msgDiv.textContent = msg.text;
    chatBox.appendChild(msgDiv);

    // Auto scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (text === "") return;

  const message = {
    sender: currentUser.uid,
    receiver: userId,
    text,
    timestamp: Date.now()
  };

  // Save to both sender-receiver and receiver-sender paths
  const path1 = `messages/${currentUser.uid}_${userId}`;
  const path2 = `messages/${userId}_${currentUser.uid}`;

  push(ref(db, path1), message);
  push(ref(db, path2), message);

  messageInput.value = "";
}