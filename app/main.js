const net = require("net");

// In-memory storage for key-value pairs
const store = {};

console.log("Starting custom Redis server...");

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        const command = data.toString().trim();

        if (command.startsWith("*1\r\n$4\r\nPING")) {
            // Handle PING command without arguments
            connection.write("+PONG\r\n");

        } else if (command.startsWith("*2\r\n$4\r\nPING")) {
            // Handle PING command with an argument
            const parts = command.split("\r\n");
            const pingMessage = parts[4]; // The message argument
            connection.write(`$${pingMessage.length}\r\n${pingMessage}\r\n`);

        } else if (command.startsWith("*2\r\n$4\r\nECHO")) {
            // Handle ECHO command
            const parts = command.split("\r\n");
            const echoMessage = parts[4]; // The message to echo
            connection.write(`$${echoMessage.length}\r\n${echoMessage}\r\n`);

        } else if (command.startsWith("*3\r\n$3\r\nSET")) {
            // Handle SET command
            const parts = command.split("\r\n");
            const key = parts[4]; // Key
            const value = parts[6]; // Value

            // Store the key-value pair in memory
            store[key] = value;

            // Respond with a success message
            connection.write("+OK\r\n");

        } else if (command.startsWith("*2\r\n$3\r\nGET")) {
            // Handle GET command
            const parts = command.split("\r\n");
            const key = parts[4]; // Key

            if (key in store) {
                // Respond with the value as a bulk string
                const value = store[key];
                connection.write(`$${value.length}\r\n${value}\r\n`);
            } else {
                // Respond with a null bulk string if the key doesn't exist
                connection.write("$-1\r\n");
            }

        } else {
            // Respond with a valid Redis error for unknown commands
            connection.write("ERROR\r\n");
        }
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
});

server.listen(6379, "127.0.0.1", () => {
    console.log("Custom Redis server is listening on port 6379");
});
