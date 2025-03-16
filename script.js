
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

const hamburger = document.getElementById('hamburger');
const navList = document.getElementById('navList');

hamburger.addEventListener('click', () => {
    navList.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.container1') && window.innerWidth <= 768) {
        navList.classList.remove('show');
    }
});

// Close menu on item click
document.querySelectorAll('.nav-list a').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navList.classList.remove('show');
        }
    });
});







let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add to Cart Functionality
function initializeCart() {
    document.querySelectorAll('.btn').forEach(button => {
        if(button.textContent.includes('Order')) {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.card');
                const item = {
                    name: card.querySelector('.card-text').textContent.trim(),
                    price: parseInt(card.querySelector('p:nth-last-child(2)').textContent.match(/\d+/)[0]),
                    image: card.querySelector('img').src
                };
                addToCart(item);
            });
        }
    });
}




function addToCart(item) {
    cart.push(item);
    updateCartDisplay();
    showToast(`${item.name.split('.')[0]} added to cart!`);
}

function updateCartDisplay() {
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    document.getElementById('cartCountNav').textContent = cart.length;
    
    // Update cart items
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <div class="d-flex align-items-center">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                <div class="ms-3">
                    <h6 class="mb-0">${item.name}</h6>
                    <small>ETB ${item.price}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    // Update total
    document.getElementById('cartTotal').textContent = cart.reduce((sum, item) => sum + item.price, 0);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    updateCartDisplay();
});







function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification bg-success text-white p-3 rounded';
    toast.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span>${message}</span>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Clear Cart Function
function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    showToast('Cart cleared successfully!');
    $('#cartModal').modal('hide');
}

// Show Payment Form


// Payment Functions
function showPaymentForm() {
    if (cart.length === 0) {
        showToast('Your cart is empty! Add items before checking out.');
        return;
    }

    // Hide cart modal using Bootstrap's native method
    const cartModal = document.getElementById('cartModal');
    const modalInstance = bootstrap.Modal.getInstance(cartModal);
    modalInstance.hide();

    // Show payment form
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.style.display = 'block';
    
    // Initialize default payment method
    const initialMethod = document.querySelector('input[name="paymentMethod"]');
    if (initialMethod) {
        initialMethod.checked = true;
        updatePaymentFields();
    }
    
    // Scroll to payment form
    setTimeout(() => {
        paymentForm.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
}

function updatePaymentFields() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const paymentFields = document.getElementById('paymentFields');
    const totalAmount = document.getElementById('cartTotal').textContent;

    const fields = `
        <div class="payment-fields">
            <div class="form-group">
                <label>Account Information</label>
                ${paymentMethod === 'paypal' ? `
                    <input type="email" 
                           class="form-control"
                           placeholder="PayPal Email Address"
                           required>
                ` : `
                    <input type="text" 
                           class="form-control"
                           placeholder="Account Number"
                           required>
                `}
            </div>
            
            <div class="form-group">
                <label>Amount</label>
                <div class="input-group">
                    <span class="input-group-text">ETB</span>
                    <input type="number" 
                           class="form-control"
                           value="${totalAmount}"
                           readonly
                           required>
                </div>
            </div>
        </div>
    `;

    paymentFields.innerHTML = fields;
}

// Event Listeners
document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
    input.addEventListener('change', function() {
        updatePaymentFields();
        document.getElementById('paymentFields').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

document.getElementById('paymentDetails').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const amount = document.getElementById('cartTotal').textContent;
    const accountInfo = document.querySelector('#paymentFields input').value;

    // Validate account info based on payment method
    if (paymentMethod === 'paypal' && !validateEmail(accountInfo)) {
        showToast('Please enter a valid PayPal email address');
        return;
    }

    if (paymentMethod !== 'paypal' && !/^\d+$/.test(accountInfo)) {
        showToast('Please enter a valid account number');
        return;
    }

    // Process payment
    processPayment({
        method: paymentMethod,
        amount: amount,
        account: accountInfo
    });
});

// Helper Functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function processPayment(paymentData) {
    // Here you would normally send to your backend
    console.log('Processing payment:', paymentData);
    
    showToast(`Payment of ETB ${paymentData.amount} via ${paymentData.method.toUpperCase()} successful!`);
    
    // Clear cart and reset UI
    clearCart();
    document.getElementById('paymentForm').style.display = 'none';
    
    // Show confirmation
    alert(`Thank you for your payment!\nA confirmation has been sent to ${paymentData.method === 'paypal' ? paymentData.account : 'your registered contact'}`);
}

function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    showToast('Cart cleared successfully');
}

















