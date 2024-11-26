const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        // Ensure we correctly process the data as a string
        const command = data.toString().trim();

        if (command.toUpperCase() === "PING") {
            // Respond with the Redis-compatible PONG message
            connection.write('+PONG\r\n');
        } else {
            // Return an error message for unknown commands
            connection.write('-ERR unknown command\r\n');
        }
    });

    // Handle connection errors
    connection.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
 });
//
 server.listen(6379, "127.0.0.1");
 
