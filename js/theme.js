document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('themeSelect');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') || 'auto';
    
    // Set the initial value of the select
    themeSelect.value = savedTheme;
    
    // Apply the initial theme
    applyTheme(savedTheme);
    
    // Handle theme selection changes
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (themeSelect.value === 'auto') {
            applyTheme('auto');
        }
    });
    
    function applyTheme(theme) {
        if (theme === 'auto') {
            // Remove any explicit theme and let the system preference take over
            document.documentElement.removeAttribute('data-theme');
        } else {
            // Apply the selected theme
            document.documentElement.setAttribute('data-theme', theme);
        }
    }
}); 