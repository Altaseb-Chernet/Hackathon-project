
// // Authentication System
// let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
// const users = JSON.parse(localStorage.getItem('users')) || [];

// // Initialize Auth
// function initAuth() {
//     updateAuthUI();
//     attachAuthEvents();
// }

// // Update UI State
// function updateAuthUI() {
//     const authButton = document.getElementById('authButton');
//     const orderButtons = document.querySelectorAll('.order-btn');
    
//     if (currentUser) {
//         authButton.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name}`;
//         orderButtons.forEach(btn => {
//             btn.disabled = false;
//             btn.classList.remove('disabled');
//         });
//     } else {
//         authButton.innerHTML = '<i class="fas fa-user"></i> Sign In';
//         orderButtons.forEach(btn => {
//             btn.disabled = true;
//             btn.classList.add('disabled');
//         });
//     }
// }

// // Event Handlers
// function attachAuthEvents() {
//     // Login Form
//     document.getElementById('loginForm').addEventListener('submit', function(e) {
//         e.preventDefault();
//         const email = this.querySelector('input[type="email"]').value;
//         const password = this.querySelector('input[type="password"]').value;
        
//         const user = users.find(u => u.email === email && u.password === password);
        
//         if (user) {
//             currentUser = user;
//             localStorage.setItem('currentUser', JSON.stringify(currentUser));
//             bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
//             updateAuthUI();
//             showToast(`Welcome back, ${user.name}!`);
//         } else {
//             alert('Invalid email or password');
//         }
//     });

//     // Registration Form
//     document.getElementById('registerForm').addEventListener('submit', function(e) {
//         e.preventDefault();
//         const formData = {
//             name: this.querySelector('input[type="text"]').value,
//             email: this.querySelector('input[type="email"]').value,
//             phone: this.querySelector('input[type="tel"]').value,
//             password: this.querySelector('input[type="password"]').value,
//             confirmPassword: this.querySelectorAll('input[type="password"]')[1].value
//         };

//         if (formData.password !== formData.confirmPassword) {
//             alert('Passwords do not match!');
//             return;
//         }

//         if (users.some(u => u.email === formData.email)) {
//             alert('Email already registered!');
//             return;
//         }

//         const newUser = {
//             name: formData.name,
//             email: formData.email,
//             phone: formData.phone,
//             password: formData.password
//         };

//         users.push(newUser);
//         localStorage.setItem('users', JSON.stringify(users));
        
//         bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
//         document.getElementById('loginForm').querySelector('input[type="email"]').value = formData.email;
//         bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal')).show();
//         alert('Registration successful! Please sign in.');
//     });
// }

// // Initialize on page load
// document.addEventListener('DOMContentLoaded', initAuth);







// Authentication System
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const users = JSON.parse(localStorage.getItem('users')) || [];
let googleClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Initialize Authentication System
function initAuthSystem() {
    initializeGoogleAuth();
    checkAuthState();
    attachAuthHandlers();
    updateAuthUI();
}

// Google Auth Initialization
function initializeGoogleAuth() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
            prompt_parent_id: 'google_signin_container'
        });
    }
}

// Handle Google Auth Response
function handleGoogleResponse(response) {
    try {
        const credential = parseJwt(response.credential);
        
        const userData = {
            id: credential.sub,
            name: credential.name,
            email: credential.email,
            picture: credential.picture,
            verified: credential.email_verified,
            provider: 'google'
        };

        handleSocialLogin(userData);
    } catch (error) {
        showAuthError('Google authentication failed. Please try again.');
        console.error('Google Auth Error:', error);
    }
}

// Handle Social Media Login
function handleSocialLogin(userData) {
    const existingUser = users.find(u => u.email === userData.email);
    
    if (!existingUser) {
        users.push({
            ...userData,
            phone: '',
            password: '', // No password for social users
            registeredAt: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
    }

    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateAuthUI();
    showToast(`Welcome ${userData.name}!`);
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
    
    // Optional: Refresh page state
    setTimeout(() => location.reload(), 1000);
}

// JWT Parser
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        throw new Error('Invalid JWT token');
    }
}

// Check Authentication State
function checkAuthState() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser && currentUser.expiresAt < Date.now()) {
        handleLogout();
    }
}

// Update UI State
function updateAuthUI() {
    const authButton = document.getElementById('authButton');
    const orderButtons = document.querySelectorAll('.order-btn');
    
    if (currentUser) {
        authButton.innerHTML = `
            <img src="${currentUser.picture}" class="user-avatar" alt="Profile">
            <span class="user-name">${currentUser.name}</span>
        `;
        orderButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
    } else {
        authButton.innerHTML = '<i class="fas fa-user"></i> Sign In';
        orderButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }
}

// Logout Handler
function handleLogout() {
    if (currentUser?.provider === 'google') {
        google.accounts.id.disableAutoSelect();
    }
    
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateAuthUI();
    showToast('Logged out successfully');
    
    // Optional: Redirect to home page
    window.location.href = '/';
}

// Attach Event Handlers
function attachAuthHandlers() {
    // Logout on double click
    document.getElementById('authButton').addEventListener('dblclick', handleLogout);
    
    // Manual Google Sign-In Trigger
    document.getElementById('googleSigninBtn').addEventListener('click', () => {
        google.accounts.id.prompt(notification => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                showAuthError('Please allow popups for Google Sign-In');
            }
        });
    });
    
    // Session Timeout (1 hour)
    setInterval(checkAuthState, 3600000);
}

// Error Handling
function showAuthError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-message error';
    errorDiv.textContent = message;
    
    const modalBody = document.querySelector('.modal-body');
    modalBody.prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAuthSystem);
