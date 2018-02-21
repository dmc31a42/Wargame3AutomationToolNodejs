"use strinct";

var MMS_LOCAL_PORT = 10002;
var MMS_REMOTE_PORT = 10002;
var MMS_REMOTE_ADDR = "178.32.126.73";
var net = require('net');

var server = net.createServer(function (socket) {
    socket.on('data', function (msg) {
        console.log('  ** START **');
        console.log('<< From client to proxy ', msg.toString());
        var serviceSocket = new net.Socket();
        serviceSocket.connect(parseInt(MMS_REMOTE_PORT), MMS_REMOTE_ADDR, function () {
            console.log('>> From proxy to remote', msg.toString());
            serviceSocket.write(msg);
        });
        serviceSocket.on("data", function (data) {
            console.log('<< From remote to proxy', data.toString());
            socket.write(data);
            console.log('>> From proxy to client', data.toString());
        });
    });
});
 
server.listen(MMS_LOCAL_PORT);
console.log("TCP server accepting connection on port: " + MMS_LOCAL_PORT);