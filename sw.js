// sw.js
self.addEventListener("notificationclick", function(event) {
    event.notification.close();
    // Optional: Do something when notification is clicked
});