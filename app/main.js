const net = require("net");

// In-memory storage for key-value pairs and expiration times
const store = {};
const expiryTimes = {};

// Function to check if a key is expired
const isKeyExpired = (key) => {
    if (expiryTimes[key] && Date.now() > expiryTimes[key]) {
        delete store[key];
        delete expiryTimes[key];
        return true;
    }
    return false;
};

console.log("Starting custom Redis server...");

const server = net.createServer((connection) => {
    connection.on("data", (data) => {
        const command = data.toString().trim();
        const parts = command.split("\r\n");

        if (parts[2] === "SET") {
            // Handle SET command
            const key = parts[4];
            const value = parts[6];
            let expiry = null;

            if (parts.length > 8) {
                const option = parts[8].toUpperCase();
                const expiryInMs = parseInt(parts[10], 10);

                if (option === "PX" && !isNaN(expiryInMs)) {
                    expiry = expiryInMs;
                } else {
                    connection.write("-ERR syntax error\r\n");
                    return;
                }
            }

            store[key] = value;
            if (expiry !== null) {
                expiryTimes[key] = Date.now() + expiry;
            } else {
                delete expiryTimes[key];
            }
            connection.write("+OK\r\n");

        } else if (parts[2] === "GET") {
            // Handle GET command
            const key = parts[4];
            if (isKeyExpired(key)) {
                connection.write("$-1\r\n");
            } else if (key in store) {
                const value = store[key];
                connection.write(`$${value.length}\r\n${value}\r\n`);
            } else {
                connection.write("$-1\r\n");
            }

        } else if (parts[2] === "PING") {
            connection.write("+PONG\r\n");

        } else if (parts[2] === "ECHO") {
            // Handle ECHO command
            const message = parts[4];
            connection.write(`$${message.length}\r\n${message}\r\n`);

        } else {
            connection.write("-ERR syntax error\r\n");
        }
    });

    connection.on("error", (err) => {
        console.error("Connection error:", err.message);
    });
});

server.listen(6379, "127.0.0.1", () => {
    console.log("Custom Redis server is listening on port 6379");
});
