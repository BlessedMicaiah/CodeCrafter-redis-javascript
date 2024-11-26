const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        const command = data.toString().trim();

        if (command === "PING") {
            // Respond to PING command with one PONG as per RESP protocol
            connection.write('+PONG\r\n');
            
            // Send another PONG separately (not as a response to PING)
            setTimeout(() => {
                connection.write('+PONG\r\n');
            }, 100); // Send second PONG after a short delay
        } else {
            // Handle unknown commands gracefully
            connection.write('-ERROR\r\n');
        }
    });
 });
//
 server.listen(6379, "127.0.0.1");
 
