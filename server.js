const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const path = require('path');
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Mock database for simplicity
let deviceState = {
    fanSpeed: 0,
    lightOn: false,
    devices: ["Fan", "Light", "ESP32"],
};
let presets = [];

// Routes
app.get("/devices", (req, res) => {
    res.json(deviceState.devices);
});

app.get("/fan/speed", (req, res) => {
    res.json({ fanSpeed: deviceState.fanSpeed });
});

app.post("/fan/speed", (req, res) => {
    const { speed } = req.body;
    if (speed < 0 || speed > 100) {
        return res.status(400).json({ error: "Speed must be between 0 and 100." });
    }
    deviceState.fanSpeed = speed;
    broadcast({ type: "fanSpeed", speed });
    res.status(200).json({ message: "Fan speed updated.", speed });
});

app.get("/light", (req, res) => {
    res.json({ lightOn: deviceState.lightOn });
});


app.post('/light', (req, res) => {
    console.log("Request received: ", req.body);
    const { lightOn } = req.body;
    if (lightOn === undefined) {
        return res.status(400).json({ error: "Invalid data sent" });
    }

    // Update device state
    deviceState.lightOn = lightOn;

    // Broadcast the new state to connected devices (like ESP32)
    broadcast({ type: "lightState", lightOn });

    res.status(200).json({ message: "Light state updated.", lightOn });
});

app.get("/presets", (req, res) => {
    res.json(presets);
});

app.post("/presets", (req, res) => {
    const { name, fanSpeed, lightOn } = req.body;
    presets.push({ name, fanSpeed, lightOn });
    res.status(201).json({ message: "Preset saved.", presets });
});

// WebSocket Communication
function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

wss.on("connection", (ws) => {
    console.log("A device connected.");
    ws.send(JSON.stringify({ type: "initialState", state: deviceState }));

    ws.on("message", (message) => {
        console.log("Received message:", message);
    });

    ws.on("close", () => {
        console.log("A device disconnected.");
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT} test`));
