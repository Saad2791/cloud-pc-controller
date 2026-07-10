const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dgram = require('dgram');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 5555;
const TARGET_MAC = process.env.TARGET_MAC || "1C:1B:0D:C9:97:78";

app.use(express.static('public'));

function createMagicPacket(macAddress) {
    const macBytes = macAddress.split(':').map(hex => parseInt(hex, 16));
    const packet = Buffer.alloc(102);
    for (let i = 0; i < 6; i++) packet[i] = 0xFF;
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 6; j++) {
            packet[6 + i * 6 + j] = macBytes[j];
        }
    }
    return packet;
}

function sendWakeOnLan() {
    const targetIp = process.env.ROUTER_IP || '255.255.255.255';
    const port = 9;
    const packet = createMagicPacket(TARGET_MAC);
    const client = dgram.createSocket('udp4');
    
    client.bind(() => {
        client.setBroadcast(true);
        client.send(packet, 0, packet.length, port, targetIp, (err) => {
            client.close();
            if (err) console.error("Error sending packet:", err);
            else console.log(`Wake packet sent to ${targetIp}:${port}`);
        });
    });
}

// Socket.io Real-time connection
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('send_command', (cmd) => {
        console.log(`Command received from UI: ${cmd}`);
        
        if (cmd === 'wake') {
            sendWakeOnLan();
            socket.emit('status', { msg: 'Wake packet sent!', type: 'success' });
        } else {
            // Forward command to the Local Agent running on the PC
            io.emit('execute_command', cmd);
            socket.emit('status', { msg: `Command '${cmd}' sent to PC!`, type: 'success' });
        }
    });

    socket.on('agent_online', () => {
        console.log("Local PC Agent Connected!");
        io.emit('status', { msg: 'PC Agent is ONLINE', type: 'info' });
    });
});

server.listen(PORT, () => {
    console.log(`=======================================`);
    console.log(`🚀 Unified Cloud Controller running!`);
    console.log(`👉 Open: http://localhost:${PORT}`);
    console.log(`=======================================`);
});
