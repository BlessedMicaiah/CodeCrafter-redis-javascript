const net = require("net");

console.log("Starting custom Redis server...");

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        // Parse incoming RESP message
        const command = data.toString().trim();

        // RESP for "HEY" command
        if (command === "*1\r\n$3\r\nHEY") {
            // Send RESP response: "+hey\r\n"
            connection.write("+hey\r\n");
        } else {
            // Unknown commands respond with an error
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
