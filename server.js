const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

server.on("connection", (ws) => {
    ws.on("message", (message) => {
        console.log("Received: " + message);
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log("WebSocket server running on ws://localhost:3000");
