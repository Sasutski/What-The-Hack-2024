document.addEventListener('DOMContentLoaded', () => {
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