/* ========================
   AUTH.JS - ZeroPoint Platform
   Authentication: Login, Registration, Telegram Auth, Token Management
   Author: Senior Frontend Architect
======================== */

// ========================================
// AUTH MANAGER
// ========================================
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('jwt_token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.apiBase = '/api';
    }

    isLoggedIn() {
        return !!this.token;
    }

    login(token, userData) {
        this.token = token;
        this.user = userData;
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        this.updateUI();
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        this.updateUI();
        window.location.href = 'index.html';
    }

    updateUI() {
        const guestButtons = document.querySelector('.guest-buttons');
        const userProfile = document.querySelector('.user-profile');
        
        if (!guestButtons || !userProfile) return;

        if (this.isLoggedIn()) {
            guestButtons.style.display = 'none';
            userProfile.style.display = 'block';
            
            if (this.user && this.user.username) {
                const avatar = document.querySelector('#user-avatar img');
                if (avatar) {
                    avatar.src = this.user.avatarUrl || 
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user.username}`;
                }
            }
        } else {
            guestButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async fetchUserProfile() {
        if (!this.token) return null;

        try {
            // TODO CODEX: Connect to GET /api/auth/me
            const response = await fetch(`${this.apiBase}/auth/me`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.logout();
                }
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            this.user = data;
            localStorage.setItem('user', JSON.stringify(data));
            this.updateUI();
            return data;

        } catch (error) {
            console.error('Profile fetch error:', error);
            return null;
        }
    }
}

const auth = new AuthManager();


// ========================================
// LOGIN FORM HANDLER
// ========================================
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            window.ZeroPoint.toast.error('Заполните все поля');
            return;
        }

        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';

        try {
            // TODO CODEX: Connect to POST /api/auth/login
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ошибка входа');
            }

            const data = await response.json();
            
            if (data.token && data.user) {
                auth.login(data.token, data.user);
                window.ZeroPoint.toast.success('Добро пожаловать в ZeroPoint!');
                window.ZeroPoint.ModalManager.close('login-modal');
                loginForm.reset();
                
                // Redirect to profile
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                throw new Error('Неверный формат ответа сервера');
            }

        } catch (error) {
            console.error('Login error:', error);
            window.ZeroPoint.toast.error(error.message || 'Ошибка входа');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}


// ========================================
// REGISTRATION FORM HANDLER
// ========================================
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('selected-role').value;
        
        // Validation
        if (!username || !email || !password || !role) {
            window.ZeroPoint.toast.error('Заполните все поля');
            return;
        }
        
        if (username.length < 3) {
            window.ZeroPoint.toast.error('Имя пользователя должно быть не менее 3 символов');
            return;
        }
        
        if (password.length < 6) {
            window.ZeroPoint.toast.error('Пароль должен быть не менее 6 символов');
            return;
        }
        
        if (!validateEmail(email)) {
            window.ZeroPoint.toast.error('Введите корректный email адрес');
            return;
        }

        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';

        try {
            // TODO CODEX: Connect to POST /api/auth/register
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, role })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                // Handle validation errors
                if (errorData.validationErrors) {
                    window.ZeroPoint.toast.error('Проверьте введенные данные:', errorData.validationErrors);
                    return;
                }
                
                throw new Error(errorData.message || 'Ошибка регистрации');
            }

            const data = await response.json();
            
            if (data.token && data.user) {
                auth.login(data.token, data.user);
                window.ZeroPoint.toast.success('Аккаунт успешно создан! Добро пожаловать!');
                window.ZeroPoint.ModalManager.close('register-modal');
                registerForm.reset();
                
                // Redirect to profile
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                throw new Error('Неверный формат ответа сервера');
            }

        } catch (error) {
            console.error('Registration error:', error);
            window.ZeroPoint.toast.error(error.message || 'Ошибка регистрации');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}


// ========================================
// ROLE SELECTION (IMPROVED UX)
// ========================================
function initRoleSelection() {
    const roleCards = document.querySelectorAll('.role-card');
    const roleSelection = document.getElementById('role-selection');
    const registerForm = document.getElementById('register-form');
    const selectedRoleInput = document.getElementById('selected-role');
    const backToRoleBtn = document.getElementById('back-to-role');

    if (!roleCards.length) return;

    // Role card click
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            selectedRoleInput.value = role;
            
            // Hide role selection, show form
            roleSelection.style.display = 'none';
            registerForm.style.display = 'block';
            
            // Visual feedback
            window.ZeroPoint.toast.success(`Вы выбрали: ${role === 'FREELANCER' ? 'Фрилансер' : 'Заказчик'}`);
        });
    });

    // Back to role selection
    if (backToRoleBtn) {
        backToRoleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            roleSelection.style.display = 'block';
            registerForm.style.display = 'none';
            selectedRoleInput.value = '';
        });
    }
}


// ========================================
// TELEGRAM AUTH (WIDGET PLACEHOLDER)
// ========================================
function initTelegramAuth() {
    const telegramLoginBtn = document.getElementById('btn-telegram-login');
    const telegramRegisterBtn = document.getElementById('btn-telegram-register');

    if (telegramLoginBtn) {
        telegramLoginBtn.addEventListener('click', function() {
            // TODO CODEX: Implement Telegram Widget
            // Reference: https://core.telegram.org/widgets/login
            
            console.log('Telegram login clicked');
            window.ZeroPoint.toast.error('Telegram авторизация временно недоступна');
            
            // Placeholder for Telegram OAuth flow
            // 1. Open Telegram Widget
            // 2. Get auth data from callback
            // 3. Send to backend: POST /api/auth/telegram
            // 4. Receive JWT token
            // 5. Call auth.login(token, userData)
        });
    }

    if (telegramRegisterBtn) {
        telegramRegisterBtn.addEventListener('click', function() {
            // TODO CODEX: Connect to POST /api/auth/telegram
            console.log('Telegram register clicked');
            window.ZeroPoint.toast.error('Telegram регистрация временно недоступна');
        });
    }
}


// ========================================
// MODAL SWITCHING (LOGIN <-> REGISTER)
// ========================================
function initModalSwitching() {
    const switchToRegister = document.getElementById('switch-register');
    const switchToLogin = document.getElementById('switch-login');

    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            window.ZeroPoint.ModalManager.close('login-modal');
            setTimeout(() => {
                window.ZeroPoint.ModalManager.open('register-modal');
            }, 300);
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            window.ZeroPoint.ModalManager.close('register-modal');
            setTimeout(() => {
                window.ZeroPoint.ModalManager.open('login-modal');
            }, 300);
        });
    }
}


// ========================================
// MODAL CLOSE BUTTONS
// ========================================
function initModalCloseButtons() {
    const closeLogin = document.getElementById('close-login');
    const closeRegister = document.getElementById('close-register');

    if (closeLogin) {
        closeLogin.addEventListener('click', () => {
            window.ZeroPoint.ModalManager.close('login-modal');
        });
    }

    if (closeRegister) {
        closeRegister.addEventListener('click', () => {
            window.ZeroPoint.ModalManager.close('register-modal');
        });
    }
}


// ========================================
// HEADER AUTH BUTTONS
// ========================================
function initHeaderButtons() {
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');

    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            window.ZeroPoint.ModalManager.open('login-modal');
        });
    }

    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            window.ZeroPoint.ModalManager.open('register-modal');
        });
    }
}


// ========================================
// EMAIL VALIDATION
// ========================================
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


// ========================================
// PROFILE PAGE AUTH CHECK
// ========================================
function checkProfileAuth() {
    // Only run on profile.html
    if (!window.location.pathname.includes('profile.html')) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.warn('No auth token. Redirecting to index...');
        window.location.href = 'index.html';
    }
}


// ========================================
// INITIALIZE AUTH ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🔐 Auth.js loaded', 'font-size: 14px; color: #10b981;');

    // Check authentication for profile page
    checkProfileAuth();

    // Update UI based on auth state
    auth.updateUI();

    // Initialize all forms and buttons
    initLoginForm();
    initRegisterForm();
    initRoleSelection();
    initTelegramAuth();
    initModalSwitching();
    initModalCloseButtons();
    initHeaderButtons();

    // Fetch user profile if logged in
    if (auth.isLoggedIn()) {
        auth.fetchUserProfile();
    }
});


// ========================================
// EXPORT AUTH MANAGER
// ========================================
window.ZeroPoint = window.ZeroPoint || {};
window.ZeroPoint.auth = auth;
