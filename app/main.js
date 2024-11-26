const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
    connection.compose('data', (data) => {
        const command = data.toString().trim();
    if (command === "PING"){
        connection.write('+PONG\r\n');
    } else{
        connection.write('ERROR\r\n');
    }
  })
 });
//
 server.listen(6379, "127.0.0.1");
 
