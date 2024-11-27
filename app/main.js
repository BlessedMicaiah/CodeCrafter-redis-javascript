const net = require("net");

// In-memory storage for key-value pairs and expiration times
const store = {};
const expiryTimes = {}; // Stores expiration times (key: expiration timestamp in ms)

console.log("Starting custom Redis server...");

// Function to check if a key is expired
const isKeyExpired = (key) => {
    if (expiryTimes[key] && Date.now() > expiryTimes[key]) {
        // If the key is expired, delete it
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
            // Handle PING command without arguments
            connection.write("+PONG\r\n");

        } else if (command.startsWith("*2\r\n$4\r\nPING")) {
            // Handle PING command with an argument
            const parts = command.split("\r\n");
            const pingMessage = parts[4];
            connection.write(`$${pingMessage.length}\r\n${pingMessage}\r\n`);

        } else if (command.startsWith("*2\r\n$4\r\nECHO")) {
            // Handle ECHO command
            const parts = command.split("\r\n");
            const echoMessage = parts[4];
            connection.write(`$${echoMessage.length}\r\n${echoMessage}\r\n`);

        } else if (command.startsWith("*5\r\n$3\r\nSET")) {
            // Handle SET command with PX option
            const parts = command.split("\r\n");
            const key = parts[4];    // Key
            const value = parts[6];  // Value
            const option = parts[8]; // Option ("PX" or other)

            if (option === "PX") {
                const expiryInMs = parseInt(parts[10]); // Expiration time in ms

                // Store the key-value pair and set expiration time
                store[key] = value;
                expiryTimes[key] = Date.now() + expiryInMs;

                connection.write("+OK\r\n");
            } else {
                // Handle invalid or unsupported options
                connection.write("-ERR syntax error\r\n");
            }

        } else if (command.startsWith("*3\r\n$3\r\nSET")) {
            // Handle basic SET command without PX
            const parts = command.split("\r\n");
            const key = parts[4];
            const value = parts[6];

            // Store key-value pair and remove any previous expiration
            store[key] = value;
            delete expiryTimes[key];
            connection.write("+OK\r\n");

        } else if (command.startsWith("*2\r\n$3\r\nGET")) {
            // Handle GET command
            const parts = command.split("\r\n");
            const key = parts[4];

            if (isKeyExpired(key)) {
                connection.write("$-1\r\n"); // Key expired or does not exist
            } else if (key in store) {
                const value = store[key];
                connection.write(`$${value.length}\r\n${value}\r\n`);
            } else {
                connection.write("$-1\r\n"); // Key does not exist
            }

        } else {
            connection.write("-ERR unknown command\r\n");
        }
    });

    connection.on("error", (err) => {
        console.error("Connection error:", err.message);
    });
});

server.listen(6379, "127.0.0.1", () => {
    console.log("Custom Redis server is listening on port 6379");
});
