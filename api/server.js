const { Server } = require("ws");

let server;

module.exports = (req, res) => {
    if (!server) {
        server = new Server({ noServer: true });

        server.on("connection", (ws) => {
            ws.on("message", (message) => {
                console.log("Received:", message);
                server.clients.forEach((client) => {
                    if (client.readyState === 1) {
                        client.send(message);
                    }
                });
            });
        });

        console.log("WebSocket server started");
    }

    if (req.method === "GET") {
        res.status(200).send("WebSocket server is running");
    }
};
