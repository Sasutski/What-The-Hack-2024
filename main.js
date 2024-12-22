const apiUrl = `.`;

document.addEventListener('DOMContentLoaded', () => {
    fetchDeviceStates();
    const toggleLightButton = document.querySelector(".toggle-button");

    if (toggleLightButton) {
        toggleLightButton.addEventListener("click", toggleLight);
    }

    const ws = new WebSocket("ws://localhost:3000");

    // When connection is opened
    ws.addEventListener("open", () => {
        console.log("Connected to WebSocket server");
        ws.send("Hello from the browser!");
    });

    // When a message is received
    ws.addEventListener("message", (event) => {
        console.log("Message from server:", event.data);

        const dashboard = document.querySelector("#dashboard");
        if (dashboard) {
            const newData = document.createElement("p");
            newData.textContent = `Server: ${event.data}`;
            dashboard.appendChild(newData);
        }
    });

    const themeSelect = document.getElementById('theme');
    const preferencesForm = document.getElementById('preferences-form');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        themeSelect.value = savedTheme;
    }

    preferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedTheme = themeSelect.value;
        document.body.className = selectedTheme;
        localStorage.setItem('theme', selectedTheme);
        alert('Preferences saved!');
    });

    const fanSelect = document.getElementById('fan');
    const presetForm = document.getElementById('preset-form');
    
    const savedPreset = JSON.parse(localStorage.getItem('preset'));
    if (savedPreset) {
        fanSelect.value = savedPreset.fanSpeed;
    }

    presetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedFan = fanSelect.value;
        const presetData = { fanSpeed: selectedFan };
        localStorage.setItem('preset', JSON.stringify(presetData));
        alert('Preset saved!');
    });

    const profileForm = document.getElementById('profile-form');

    const savedProfile = JSON.parse(localStorage.getItem('profile'));
    if (savedProfile) {
        document.getElementById('username').value = savedProfile.username;
        document.getElementById('email').value = savedProfile.email;
        document.getElementById('password').value = savedProfile.password;
    }

    profileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(profileForm);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        localStorage.setItem('profile', JSON.stringify(data));
        alert('Profile updated successfully!');
    });
});

async function fetchDeviceStates() {
    try {
        const fanResponse = await fetch(`${apiUrl}/fan/speed`);
        const lightResponse = await fetch(`${apiUrl}/light`);
        if (!fanResponse.ok || !lightResponse.ok) {
            throw new Error("Failed to fetch device states.");
        }

        const fanData = await fanResponse.json();
        const lightData = await lightResponse.json();

        document.getElementById("fan-status").textContent = fanData.fanSpeed > 0 ? "On" : "Off";
        document.getElementById("light-status").textContent = lightData.lightOn ? "On" : "Off";
    } catch (error) {
        console.error("Error fetching device states:", error);
    }
}

async function toggleLight() {
    try {
        const lightStatus = document.getElementById("light-status").textContent === "On";
        const newLightState = !lightStatus;

        const response = await fetch(`${apiUrl}/light`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ lightOn: newLightState }),
        });

        if (!response.ok) {
            throw new Error("Failed to toggle light state.");
        }

        const data = await response.json();
        document.getElementById("light-status").textContent = data.lightOn ? "On" : "Off";
    } catch (error) {
        console.error("Error toggling light:", error);
    }
}

function toggleFan() {
    const fanStatus = document.getElementById('fan-status');
    fanStatus.textContent = fanStatus.textContent === 'Off' ? 'On' : 'Off';
}
