const { io } = require("socket.io-client");
const { exec } = require('child_process');

// Change this to your Render/Vercel URL once deployed to the cloud!
const CLOUD_URL = process.env.CLOUD_URL || "http://localhost:5555";

console.log(`Connecting to Cloud Server at: ${CLOUD_URL}`);
const socket = io(CLOUD_URL);

socket.on("connect", () => {
    console.log("✅ Successfully connected to Cloud Server!");
    // Tell the server we are the PC agent
    socket.emit("agent_online");
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from Cloud Server. Retrying...");
});

// Listen for commands from the cloud
socket.on("execute_command", (cmd) => {
    console.log(`\n⚡ Received command from Cloud: [${cmd.toUpperCase()}]`);

    if (cmd === 'sleep') {
        console.log('Putting PC to sleep...');
        exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
    } 
    else if (cmd === 'lock') {
        console.log('Locking PC...');
        exec('rundll32.exe user32.dll,LockWorkStation');
    } 
    else if (cmd === 'shutdown') {
        console.log('Shutting down PC...');
        exec('shutdown /s /t 0');
    }
    else {
        console.log('Unknown command ignored.');
    }
});
