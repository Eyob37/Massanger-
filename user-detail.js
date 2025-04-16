import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  push,
  onValue,
  update,
  set,
  onChildAdded
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
const db = getDatabase(app)

let messagesRef; // Declare globally

// Get userId from URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

// Assume current user ID is stored locally (from login)
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const currentUserId = userInfo?.id;

const userInfoDiv = document.getElementById("user-info");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

if (!userId || !currentUserId) {
  userInfoDiv.textContent = "Invalid user data.";
} else {
  // Display user info
  const userRef = ref(db, "EyobChat/users/" + userId);
  get(userRef).then(snapshot => {
    if (snapshot.exists()) {
      const user = snapshot.val();
      userInfoDiv.innerHTML = `<strong>Chatting with:</strong> ${user.name} (${user.email})`;
    } else {
      userInfoDiv.textContent = "User not found.";
    }
  });

  // Generate unique chat room ID
  const chatId = [currentUserId, userId].sort().join("_");
   messagesRef = ref(db, `EyobChat/chats/${chatId}/messages`);
  const metadataRef = ref(db, `EyobChat/chats/${chatId}/metadata`);  
  
  // Listen for new messages
  onChildAdded(messagesRef, (snapshot) => {
  const message = snapshot.val();
  const messageKey = snapshot.key;

  displayMessage(message);

  // Mark as seen if it's from the other user
  if (message.sender !== currentUserId) {
    update(ref(db, `EyobChat/chats/${chatId}/messages/${messageKey}`), {
      seen: true
    });
  }
});

  // Send message
  sendButton.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (text) {
      const timestamp = Date.now();
      const message = {
        sender: currentUserId,
        receiver: userId,
        text,
        timestamp,
        seen: false,
        type: "text"
      };

      push(messagesRef, message);
      set(metadataRef, {
        lastMessage: text,
        lastTimestamp: timestamp
      });      

      messageInput.value = "";
    }
  });
}

onValue(messagesRef, (snapshot) => {
alert("onValue starts run");
  snapshot.forEach((chatSnap) => {
     const RN = chatSnap.key;
     let seenHTML = "";
     const messageRef = ref(db, `EyobChat/chats/${chatId}/messages/${RN}`);

     get(messageRef).then((snapshot) => {
       if (snapshot.exists()) {
         const data = snapshot.val();
         if (data.seen && data.sender === currentUserId) {
           seenHTML = `<span class="seen-icon">"✔✔"</span>`;
           const messageDiv = document.querySelector(".${data.timestamp} div span");
           if(messageDiv){
               messageDiv.innerHTML = seenHTML;
           }else{
             alert("It can't get");
           }          
         }
       }
     });
  });
});

function displayMessage(msg) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const isSent = msg.sender === currentUserId;

  if (isSent) {
    messageDiv.classList.add("sent");
  } else {
    messageDiv.classList.add("received");
  }

  messageDiv.classList.add(msg.timestamp);

  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  let seenHTML = "";
  if (isSent) {
    // Single check if not seen, double if seen
    seenHTML = `<span class="seen-icon">${msg.seen ? "✔✔" : "✔"}</span>`;
  }

  messageDiv.innerHTML = `
    <div class="message-content">
      <p class="text">${msg.text}</p>
      <span class="timestamp">${time} ${seenHTML}</span>
    </div>
  `;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}