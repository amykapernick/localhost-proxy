const createServer = require("net").createServer;

const server = createServer();

const port = process.argv[2];
// Default timeout is 5 seconds
const serverTimeout = process.argv[3] || 5;

process.on("uncaughtException", (e) => {
	if (e.code !== "ECONNRESET") {
		console.log(e);
	}
});

server.on("listening", () => {
	console.log(`Server listening on port ${server.address().port}`);
	console.log(`Stopping server in ${serverTimeout} seconds`);
});

server.on("connection", (socket) => {
	console.info("Client connected");

	socket.on("data", (message) => {
		const text = message.toString("utf8");

		console.info(`Received message (${message.length} bytes) ${text}`);
		// Echo back
		socket.write(text);
	});

	socket.on("end", () => {
		console.info("Client disconnected");
	});

	socket.on("close", () => {
		console.info("Client socket closed");
	});

	socket.on("timeout", () => {
		console.error("Client socket timedout");
	});
});

server.on("error", (err) => {
	console.error("Server error:", err);
});

server.on("close", () => {
	console.log("Server shutdown");
});

server.listen(port);

setTimeout(() => {
	server.close();
}, serverTimeout * 1000);
