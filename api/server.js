const WebSocket = require("ws");

const server = new WebSocket.Server({ noServer: true });

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

module.exports = (req, res) => {
    if (req.method === "GET") {
        res.status(200).send("WebSocket server is running");
    }
};
