document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket("ws://localhost:3000");

    // When connection is opened
    ws.addEventListener("open", () => {
        console.log("Connected to WebSocket server");
        ws.send("Hello from the browser!");
    });

    // When a message is received
    ws.addEventListener("message", (event) => {
        console.log("Message from server:", event.data);

        // You can update the UI with the received data
        const dashboard = document.querySelector("#dashboard");
        if (dashboard) {
            const newData = document.createElement("p");
            newData.textContent = `Server: ${event.data}`;
            dashboard.appendChild(newData);
        }
    });

    // Example usage: Send message from form submission
    document.querySelector("#profile-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const message = "Profile settings updated!";
        ws.send(message);
    });


    const themeSelect = document.getElementById('theme');
    const preferencesForm = document.getElementById('preferences-form');

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        themeSelect.value = savedTheme;
    }

    // Handle form submission
    preferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedTheme = themeSelect.value;
        document.body.className = selectedTheme;
        localStorage.setItem('theme', selectedTheme);
        alert('Preferences saved!');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profile-form');

    // Load saved profile settings from local storage
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

        // Save profile settings to local storage
        localStorage.setItem('profile', JSON.stringify(data));

        console.log('Profile saved:', data);
        alert('Profile updated successfully!');
    });
});

