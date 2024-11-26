const net = require("net");

console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        // Convert the buffer to a string and process the RESP format
        const command = data.toString().trim();

        // RESP format: "*1\r\n$4\r\nPING\r\n"
        // Parse the RESP command
        if (command === "*1\r\n$4\r\nPING") {
            // Respond with a simple string for PING
            connection.write('+PONG\r\n');
        } else {
            // Respond with a valid Redis error for unknown commands
            connection.write('-ERR unknown command\r\n');
        }
    });

    // Handle errors 
    connection.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
});

server.listen(6379, "127.0.0.1", () => {
    console.log("Server is listening on port 6379");
});
