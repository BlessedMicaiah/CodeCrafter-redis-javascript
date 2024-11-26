const net = require("net");

console.log("Starting custom Redis server...");

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        const command = data.toString().trim();

        // Parse the RESP command for PING
        if (command.startsWith("*1\r\n$4\r\nPING")) {
            // Respond with a simple string for PING
            connection.write("+PONG\r\n");
        } else if (command.startsWith("*2\r\n$4\r\nPING")) {
            // Extract the second argument (message to respond with)
            const parts = command.split("\r\n");
            const pingMessage = parts[4]; // The message argument
            connection.write(`$${pingMessage.length}\r\n${pingMessage}\r\n`);
        } else if (command.startsWith("*2\r\n$4\r\nECHO")) {
            // Parse the RESP command for ECHO
            const parts = command.split("\r\n");
            const echoMessage = parts[4]; // The message to echo
            connection.write(`$${echoMessage.length}\r\n${echoMessage}\r\n`);
        } else {
            // Respond with a valid Redis error for unknown commands
            connection.write("-ERROR\r\n");
        }
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
});

server.listen(6379, "127.0.0.1", () => {
    console.log("Custom Redis server is listening on port 6379");
});
