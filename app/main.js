const net = require("net");

console.log("Starting custom Redis server...");

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        const command = data.toString().trim();

        // Parse the RESP command for ECHO
        if (command.startsWith("*2\r\n$4\r\nECHO")) {
            // Extract the second argument (the string to echo)
            const parts = command.split("\r\n");
            const echoMessage = parts[4]; // "mango" or the message to be echoed

            // Respond with the echoed message as a bulk string
            connection.write(`$${echoMessage.length}\r\n${echoMessage}\r\n`);
        } else {
            // Respond with a valid Redis error for unknown commands
            connection.write("-ERR unknown command\r\n");
        }
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
});

server.listen(6379, "127.0.0.1", () => {
    console.log("Custom Redis server is listening on port 6379");
});
