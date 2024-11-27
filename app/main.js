const net = require("net");

// In-memory storage for key-value pairs and expiration times
const store = {};
const expiryTimes = {}; // Stores expiration times (key: expiration timestamp in ms)

console.log("Starting custom Redis server...");

// Function to check if a key is expired
const isKeyExpired = (key) => {
    if (expiryTimes[key] && Date.now() > expiryTimes[key]) {
        delete store[key];
        delete expiryTimes[key];
        return true;
    }
    return false;
};

const server = net.createServer((connection) => {
    connection.on("data", (data) => {
        const command = data.toString().trim();

        if (command.startsWith("*1\r\n$4\r\nPING")) {
            connection.write("+PONG\r\n");

        } else if (command.startsWith("*2\r\n$4\r\nECHO")) {
            const parts = command.split("\r\n");
            const echoMessage = parts[4];
            connection.write(`$${echoMessage.length}\r\n${echoMessage}\r\n`);

        } else if (command.startsWith("*5\r\n$3\r\nSET")) {
            // Handle SET key value PX milliseconds
            const parts = command.split("\r\n");
            const key = parts[4];
            const value = parts[6];
            const option = parts[8]; // Should be "PX"
            const expiryInMs = parseInt(parts[10], 10);

            if (option === "PX" && !isNaN(expiryInMs)) {
                store[key] = value;
                expiryTimes[key] = Date.now() + expiryInMs;
                connection.write("+OK\r\n");
            } else {
                connection.write("-ERR syntax error\r\n");
            }

        } else if (command.startsWith("*3\r\n$3\r\nSET")) {
            // Handle basic SET command without PX
            const parts = command.split("\r\n");
            const key = parts[4];
            const value = parts[6];

            store[key] = value;
            delete expiryTimes[key]; // No expiration if PX is not used
            connection.write("+OK\r\n");

        } else if (command.startsWith("*2\r\n$3\r\nGET")) {
            const parts = command.split("\r\n");
            const key = parts[4];

            if (isKeyExpired(key)) {
                connection.write("$-1\r\n");
            } else if (key in store) {
                const value = store[key];
                connection.write(`$${value.length}\r\n${value}\r\n`);
            } else {
                connection.write("$-1\r\n");
            }

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
