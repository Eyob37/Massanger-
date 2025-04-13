    import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  query,
  orderByChild,
  equalTo,
  set,
  onChildAdded,
  onDisconnect,
  onValue
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
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
const auth = getAuth(app);
const db = getDatabase(app);

let onValueStoper = 0; 
let isFirstStarte = true;

if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register('sw.js').then(registration => {
      console.log("Service Worker registered");
      window.swRegistration = registration;
   }).catch(err => {
      alert("Service Worker registration failed: " + err);
   });
} else {
   alert("Service Workers are not supported in this browser.");
}

       
function showNotification(Uname, messag) {           
   if (!window.swRegistration) {
      alert("Service Worker not ready.");
      return;
   }

   try {
      window.swRegistration.showNotification(Uname, {
         body: messag
      });
   } catch (error) {
      alert("Failed to show notification: " + error.message);
   }
}

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "signup.html";
  } else {
    const userRef = ref(db, "EyobChat/users/" + user.uid);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        document.querySelector(".chat-header").innerHTML = `<h2>Welcome, ${userData.name}!</h2>`;
      }
    });

    // Reference to the user's status in the database
    const userStatusRef = ref(db, `EyobChat/users/${user.uid}/status`);

    // Set user status to online
    set(userStatusRef, "online").catch((err) => {
      console.error("Error setting online status:", err);
    });

    // Handle disconnection: set user status to offline
    onDisconnect(userStatusRef)
      .set("offline")
      .catch((err) => {
        console.error("Error setting offline status on disconnect:", err);
      });

    // Optional: Listen for connection state changes
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        set(userStatusRef, "online").catch((err) => {
          console.error("Error setting online status:", err);
        });
      } else {
        set(userStatusRef, "offline").catch((err) => {
          console.error("Error setting offline status:", err);
        });
      }
    });
  }
});

// Logout functionality
document
  .getElementById("logout-button")
  .addEventListener("click", function () {
    signOut(auth)
      .then(() => {
        alert("Logged out.");
        localStorage.setItem("userInfo", null);
        window.location.href = "signup.html";
      })
      .catch((error) => {
        alert("Logout failed: " + error.message);
      });
  });

// Show change password modal
document
  .getElementById("change-password-button")
  .addEventListener("click", function () {
    document.getElementById("change-password-form").style.display = "block";
  });

// Close change password modal
document
  .getElementById("close-modal")
  .addEventListener("click", function () {
    document.getElementById("change-password-form").style.display = "none";
  });

// Handle password change with re-authentication
document
  .getElementById("change-password-form-content")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const user = auth.currentUser;

    if (!currentPassword || !newPassword) {
      document.getElementById("password-message").innerText =
        "Please fill in both fields.";
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      document.getElementById("password-message").innerText =
        "Password updated successfully!";
      setTimeout(() => {
         document.getElementById("change-password-form").style.display = "none";
      }, 2000);
    } catch (error) {
      document.getElementById("password-message").innerText =
        "Error updating password: " + error.message;
    }
  });

// Search for users by email
document
  .getElementById("search-button")
  .addEventListener("click", function () {
    const email = document.getElementById("search-email").value;
    if (!email) {
      document.getElementById("search-results").innerHTML =
        "<p>Please enter an email to search.</p>";
      return;
    }

    const usersRef = ref(db, "EyobChat/users");
    const usersQuery = query(usersRef, orderByChild("email"), equalTo(email));

    get(usersQuery)
      .then((snapshot) => {
        const searchResults = document.getElementById("search-results");
        searchResults.innerHTML = ""; // Clear previous results

        if (snapshot.exists()) {
          const users = snapshot.val();

          // Iterate through all users that match the search query
          Object.keys(users).forEach((userId) => {
            const user = users[userId];

            const userDiv = document.createElement("div");
            userDiv.textContent = `${
              user.status === "online" ? "Online" : "Offline"
            }: ${user.name}`;
            userDiv.style.cursor = "pointer";
            userDiv.classList.add(
              user.status === "online" ? "online" : "offline"
            );

            userDiv.addEventListener("click", () => {
              window.location.href = `user-detail.html?userId=${userId}`;
            });

            searchResults.appendChild(userDiv);
          });
        } else {
          searchResults.innerHTML = "<p>No users found with this email.</p>";
        }
      })
      .catch((error) => {
        console.error("Error searching user: ", error);
        document.getElementById("search-results").innerHTML =
          "<p>Error searching user.</p>";
      });
  });

const lastMessageCache = {};

const chatList = document.getElementById("chat-list");
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const currentUserId = String(userInfo?.id.trim());
const usersPreviewed = new Set();

    const chatsRef = ref(db, "EyobChat/chats/");
    onValue(chatsRef, (snapshot) => {
      if(onValueStoper % 2 != 0 && !isFirstStarte){
         isFirstStarte = false;
         onValueStoper++;    
         return;
      }
      usersPreviewed.clear();      
      chatList.innerHTML = "";    
      snapshot.forEach((chatSnap) => {
        const chatId = chatSnap.key;

        if (chatId.includes(currentUserId)) {
          const metadata = chatSnap.child("metadata").val();
          const userIds = chatId.split('_');
          const otherUserId = userIds[0] == currentUserId ? userIds[1] : userIds[0];

          if (!usersPreviewed.has(otherUserId)) {
            usersPreviewed.add(otherUserId);

            const userRef = ref(db, `EyobChat/users/${otherUserId}`);
            get(userRef).then((userSnap) => {
              if (userSnap.exists()) {
                const user = userSnap.val();
                const lastMessage = metadata?.lastMessage || "No messages yet";
                const lastTimestamp = metadata?.lastTimestamp || null;

                if(!isFirstStarte){
                  isFirstStarte = false;
                  createUserPreviewDiv(user, lastMessage, otherUserId, chatId, lastTimestamp);   
                  return;
                }

                if (
                  lastMessage && 
              (!lastMessageCache[chatId] || lastMessageCache[chatId] !== lastMessage)
                 ) {
                // Only notify if the last sender is not the current user
                  const lastSender = metadata?.lastSender || "";
                  if (lastSender !== currentUserId) {
                    if (!("Notification" in window)) {
                      alert("This browser does not support notifications.");
                      return;
                    }
 
                  Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                      showNotification(`${user.name}`,`${lastMessage}`);
                    } else {
                      alert("Permission denied.");
                    }
                });
              }

              lastMessageCache[chatId] = lastMessage;
            }

                createUserPreviewDiv(user, lastMessage, otherUserId, chatId, lastTimestamp);
              }
            }).catch((error) => {
              console.error("Error fetching user info:", error);
            });
          }
        }
      });
      isFirstStarte = false;
      onValueStoper++;      
    });

    function createUserPreviewDiv(user, lastMessage, userId, chatId, lastTimestamp) {
      const div = document.createElement("div");
      div.classList.add("chat-preview");

      const statusClass = user.status === "online" ? "online" : "offline";
      div.classList.add(statusClass);

      div.innerHTML = `
        <div class="preview-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="preview-content">
          <strong>${user.name}</strong>
          <p>${lastMessage}</p>
        </div>
        <div class="preview-time">${formatTime(lastTimestamp)}</div>
      `;

      div.addEventListener("click", () => {
        window.location.href = `user-detail.html?userId=${userId}&chatId=${chatId}`;
      });

      chatList.appendChild(div);
    }

    function formatTime(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }