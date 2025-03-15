function toggleDarkMode() {
    const body = document.body.classList.toggle("dark-mode");
    const modeButton = document.getElementById('modeButton');
    
    
    // Update button text based on current mode
    modeButton.textContent = body.classList.contains('dark-mode') 
        ? "Dark Mode" 
        : "Light Mode";
}