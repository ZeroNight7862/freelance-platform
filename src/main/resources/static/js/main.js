/* ========================
   TOAST SYSTEM - Enhanced for Validation Errors
======================== */
class ToastSystem {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.activeToasts = [];
        this.maxToasts = 3;
    }

    show(message, type = 'success', details = null) {
        // Remove oldest toast if limit reached
        if (this.activeToasts.length >= this.maxToasts) {
            const oldest = this.activeToasts.shift();
            oldest.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' 
            ? '<i class="fas fa-check-circle"></i>' 
            : '<i class="fas fa-exclamation-circle"></i>';
        
        const title = type === 'success' ? 'Успех!' : 'Ошибка!';
        
        let detailsHtml = '';
        if (details && typeof details === 'object') {
            detailsHtml = '<ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 12px;">';
            for (const [field, error] of Object.entries(details)) {
                detailsHtml += `<li>${error}</li>`;
            }
            detailsHtml += '</ul>';
        }
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}${detailsHtml}</div>
            </div>
        `;
        
        this.container.appendChild(toast);
        this.activeToasts.push(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
                const index = this.activeToasts.indexOf(toast);
                if (index > -1) {
                    this.activeToasts.splice(index, 1);
                }
            }, 300);
        }, 5000); // Longer duration for validation errors
    }

    success(message) {
        this.show(message, 'success');
    }

    error(message, validationErrors = null) {
        this.show(message, 'error', validationErrors);
    }

    clear() {
        this.activeToasts.forEach(toast => toast.remove());
        this.activeToasts = [];
    }
}

const toast = new ToastSystem();

/* ========================
   API ERROR HANDLER
======================== */
class ApiErrorHandler {
    static async handleResponse(response) {
        if (response.ok) {
            return await response.json();
        }

        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error('Ошибка сервера. Попробуйте позже.');
        }

        // Handle validation errors (400 with validationErrors map)
        if (response.status === 400 && errorData.validationErrors) {
            throw {
                status: 400,
                message: errorData.error || 'Ошибка валидации',
                validationErrors: errorData.validationErrors
            };
        }

        // Handle standard error response
        throw {
            status: errorData.status || response.status,
            message: errorData.message || errorData.error || 'Произошла ошибка'
        };
    }

    static displayError(error) {
        if (error.validationErrors) {
            // Show validation errors with details
            toast.error('Проверьте введенные данные:', error.validationErrors);
        } else {
            // Show standard error
            toast.error(error.message || 'Произошла ошибка');
        }
    }
}

/* ========================
   AUTH MANAGER - Updated for new API
======================== */
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('jwt_token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
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
    }

    updateUI() {
        const guestButtons = document.querySelector('.guest-buttons');
        const userProfile = document.querySelector('.user-profile');
        
        if (this.isLoggedIn()) {
            guestButtons.style.display = 'none';
            userProfile.style.display = 'block';
            
            if (this.user && this.user.username) {
                const avatar = document.querySelector('#user-avatar img');
                if (avatar) {
                    avatar.src = this.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user.username}`;
                }
            }
        } else {
            guestButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    async fetchUserProfile() {
        if (!this.token) return null;

        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await ApiErrorHandler.handleResponse(response);
            this.user = data;
            localStorage.setItem('user', JSON.stringify(data));
            this.updateUI();
            return data;
        } catch (error) {
            console.error('Profile fetch error:', error);
            if (error.status === 401 || error.status === 403) {
                this.logout();
            }
            return null;
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

const auth = new AuthManager();

/* ========================
   MODAL MANAGER
======================== */
class ModalManager {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

const loginModal = new ModalManager('login-modal');
const registerModal = new ModalManager('register-modal');

/* ========================
   MONEY FORMATTER
======================== */
class MoneyFormatter {
    static format(value) {
        if (value === null || value === undefined) return '0.00';
        
        // Handle string or number
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isNaN(numValue)) return '0.00';
        
        return numValue.toFixed(2);
    }

    static formatWithCurrency(value, currency = '$') {
        return `${currency}${this.format(value)}`;
    }
}

/* ========================
   EVENT LISTENERS - HEADER BUTTONS
======================== */
document.getElementById('btn-login').addEventListener('click', () => {
    loginModal.open();
});

document.getElementById('btn-register').addEventListener('click', () => {
    registerModal.open();
});

document.getElementById('hero-start').addEventListener('click', () => {
    if (auth.isLoggedIn()) {
        window.location.href = '#projects';
    } else {
        registerModal.open();
    }
});

/* ========================
   EVENT LISTENERS - MODAL CLOSE BUTTONS
======================== */
document.getElementById('close-login').addEventListener('click', () => {
    loginModal.close();
});

document.getElementById('close-register').addEventListener('click', () => {
    registerModal.close();
});

document.getElementById('login-modal').addEventListener('click', (e) => {
    if (e.target.id === 'login-modal') {
        loginModal.close();
    }
});

document.getElementById('register-modal').addEventListener('click', (e) => {
    if (e.target.id === 'register-modal') {
        registerModal.close();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        loginModal.close();
        registerModal.close();
    }
});

/* ========================
   EVENT LISTENERS - MODAL SWITCHERS
======================== */
document.getElementById('switch-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.close();
    setTimeout(() => {
        registerModal.open();
    }, 300);
});

document.getElementById('switch-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.close();
    setTimeout(() => {
        loginModal.open();
    }, 300);
});

/* ========================
   EVENT LISTENERS - LOGOUT
======================== */
document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    auth.logout();
    toast.success('Вы успешно вышли из аккаунта');
    
    // Redirect to home if on protected page
    setTimeout(() => {
        window.location.href = '#';
    }, 1000);
});

/* ========================
   LOGIN FORM HANDLER - Updated for new API
======================== */
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        toast.error('Заполните все поля');
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await ApiErrorHandler.handleResponse(response);
        
        if (data.token && data.user) {
            auth.login(data.token, data.user);
            toast.success('Добро пожаловать в ZeroPoint!');
            loginModal.close();
            e.target.reset();
        } else {
            toast.error('Неверный формат ответа сервера');
        }
    } catch (error) {
        ApiErrorHandler.displayError(error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

/* ========================
   REGISTER FORM HANDLER - Updated for new API with Validation
======================== */
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    
    // Client-side validation
    if (!username || !email || !password || !role) {
        toast.error('Заполните все поля');
        return;
    }
    
    if (username.length < 3) {
        toast.error('Имя пользователя должно быть не менее 3 символов');
        return;
    }
    
    if (!isStrongPassword(password)) {
        toast.error('Пароль слишком слабый: минимум 10 символов, верхний/нижний регистр, цифра и спецсимвол');
        return;
    }
    
    if (!validateEmail(email)) {
        toast.error('Введите корректный email адрес');
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await ApiErrorHandler.handleResponse(response);
        
        if (data.token && data.user) {
            auth.login(data.token, data.user);
            toast.success('Аккаунт успешно создан! Добро пожаловать!');
            registerModal.close();
            e.target.reset();
        } else {
            toast.error('Неверный формат ответа сервера');
        }
    } catch (error) {
        ApiErrorHandler.displayError(error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

/* ========================
   HELPER FUNCTIONS
======================== */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,128}$/.test(password);
}

/* ========================
   SMOOTH SCROLL FOR NAVIGATION
======================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            
            const target = document.querySelector(href);
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ========================
   PROJECT APPLY BUTTONS
======================== */
document.querySelectorAll('.btn-project-apply').forEach(button => {
    button.addEventListener('click', () => {
        if (!auth.isLoggedIn()) {
            toast.error('Войдите в аккаунт для отклика на проект');
            setTimeout(() => {
                loginModal.open();
            }, 1000);
        } else {
            toast.success('Отклик отправлен! Заказчик рассмотрит ваше предложение.');
        }
    });
});

/* ========================
   LOAD PROJECTS - Example API Integration
======================== */
async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const projects = await ApiErrorHandler.handleResponse(response);
        
        // Update UI with projects
        // This is where you would update the projects list dynamically
        console.log('Loaded projects:', projects);
        
        // Example: Format budget values
        projects.forEach(project => {
            if (project.budget) {
                project.formattedBudget = MoneyFormatter.formatWithCurrency(project.budget);
            }
        });
        
    } catch (error) {
        console.error('Failed to load projects:', error);
        // Don't show toast here to avoid annoying users on page load
    }
}

/* ========================
   LOAD USER PROFILE - Example
======================== */
async function loadUserProfile() {
    if (!auth.isLoggedIn()) return;

    try {
        const response = await fetch('/api/users/me', {
            method: 'GET',
            headers: auth.getAuthHeaders()
        });

        const profile = await ApiErrorHandler.handleResponse(response);
        
        // Update UI with profile data
        console.log('User profile:', profile);
        
        // Example: Display balance
        if (profile.balance) {
            const formattedBalance = MoneyFormatter.formatWithCurrency(profile.balance);
            console.log('Balance:', formattedBalance);
        }
        
    } catch (error) {
        console.error('Failed to load profile:', error);
        if (error.status === 401 || error.status === 403) {
            auth.logout();
        }
    }
}

/* ========================
   CREATE PROJECT - Example
======================== */
async function createProject(title, description, budget) {
    if (!auth.isLoggedIn()) {
        toast.error('Войдите в систему для создания проекта');
        return null;
    }

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                title,
                description,
                budget: parseFloat(budget) // Convert string to number for BigDecimal
            })
        });

        const project = await ApiErrorHandler.handleResponse(response);
        
        toast.success('Проект успешно создан!');
        return project;
        
    } catch (error) {
        ApiErrorHandler.displayError(error);
        return null;
    }
}

/* ========================
   CREATE ORDER - Example with Balance Check
======================== */
async function createOrder(projectId, freelancerId, price) {
    if (!auth.isLoggedIn()) {
        toast.error('Войдите в систему для создания заказа');
        return null;
    }

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                projectId,
                freelancerId,
                price: parseFloat(price) // Convert string to number for BigDecimal
            })
        });

        const order = await ApiErrorHandler.handleResponse(response);
        
        toast.success('Заказ успешно создан!');
        return order;
        
    } catch (error) {
        // Backend will return InsufficientFundsException with proper message
        ApiErrorHandler.displayError(error);
        return null;
    }
}

/* ========================
   COMPLETE ORDER - Example
======================== */
async function completeOrder(orderId) {
    if (!auth.isLoggedIn()) {
        toast.error('Войдите в систему');
        return false;
    }

    try {
        const response = await fetch(`/api/orders/${orderId}/complete`, {
            method: 'PUT',
            headers: auth.getAuthHeaders()
        });

        const order = await ApiErrorHandler.handleResponse(response);
        
        toast.success('Заказ завершен! Средства переведены фрилансеру.');
        return true;
        
    } catch (error) {
        ApiErrorHandler.displayError(error);
        return false;
    }
}


/* ========================
   BALANCE / TRANSACTIONS UI
======================== */
const transactions = [];

function renderBalance() {
    const balanceElement = document.getElementById('balance-amount');
    if (!balanceElement) return;
    const balance = auth.user?.balance ?? '0';
    balanceElement.textContent = MoneyFormatter.formatWithCurrency(balance);
}

function renderTransactions() {
    const list = document.getElementById('transactions-list');
    if (!list) return;

    if (transactions.length === 0) {
        list.innerHTML = '<div class="transaction-item"><div><strong>Пока нет транзакций</strong><div class="transaction-meta">Пополните баланс или завершите заказ</div></div><span class="transaction-amount in">$0.00</span></div>';
        return;
    }

    list.innerHTML = transactions.map((tx) => `
        <div class="transaction-item">
            <div>
                <strong>${tx.title}</strong>
                <div class="transaction-meta">${tx.date} · ${tx.method}</div>
            </div>
            <span class="transaction-amount ${tx.type}">${tx.type === 'in' ? '+' : '-'}$${MoneyFormatter.format(tx.amount)}</span>
        </div>
    `).join('');
}

document.getElementById('payment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!auth.isLoggedIn()) {
        toast.error('Для пополнения нужно войти в аккаунт');
        loginModal.open();
        return;
    }

    const amount = parseFloat(document.getElementById('topup-amount').value);
    const methodMap = { card: 'Card', sbp: 'SBP', crypto: 'USDT' };
    const method = document.getElementById('topup-method').value;

    if (!amount || amount <= 0) {
        toast.error('Введите корректную сумму');
        return;
    }

    const currentBalance = parseFloat(auth.user?.balance ?? '0');
    const newBalance = currentBalance + amount;
    auth.user.balance = MoneyFormatter.format(newBalance);
    localStorage.setItem('user', JSON.stringify(auth.user));

    transactions.unshift({
        title: 'Пополнение баланса',
        date: new Date().toLocaleString(),
        method: methodMap[method] ?? method,
        amount,
        type: 'in'
    });

    renderBalance();
    renderTransactions();
    e.target.reset();
    toast.success('Баланс успешно пополнен');
});

/* ========================
   I18N (RU/EN)
======================== */
const i18n = {
    ru: {
        'nav.projects': 'Проекты',
        'nav.benefits': 'Преимущества',
        'nav.balance': 'Баланс',
        'nav.transactions': 'Транзакции',
        'wallet.title': 'Баланс и оплата',
        'wallet.subtitle': 'Управляйте деньгами, транзакциями и пополнениями',
        'wallet.currentBalance': 'Текущий баланс',
        'wallet.note': 'Без скрытых комиссий, мгновенные внутренние переводы.',
        'payment.title': 'Пополнить баланс',
        'payment.amount': 'Сумма',
        'payment.method': 'Метод оплаты',
        'payment.payBtn': 'Пополнить',
        'transactions.title': 'Транзакции',
        'transactions.subtitle': 'История входящих и исходящих платежей',
        'auth.password': 'Пароль',
        'auth.passwordHint': 'Минимум 10 символов, с заглавной, строчной, цифрой и спецсимволом.'
    },
    en: {
        'nav.projects': 'Projects',
        'nav.benefits': 'Benefits',
        'nav.balance': 'Balance',
        'nav.transactions': 'Transactions',
        'wallet.title': 'Balance & Payments',
        'wallet.subtitle': 'Manage funds, transactions and top-ups',
        'wallet.currentBalance': 'Current balance',
        'wallet.note': 'No hidden fees, instant internal transfers.',
        'payment.title': 'Top up balance',
        'payment.amount': 'Amount',
        'payment.method': 'Payment method',
        'payment.payBtn': 'Top up',
        'transactions.title': 'Transactions',
        'transactions.subtitle': 'Incoming and outgoing payment history',
        'auth.password': 'Password',
        'auth.passwordHint': 'Min 10 chars with uppercase, lowercase, number and special char.'
    }
};

function applyLanguage(lang) {
    const dict = i18n[lang] || i18n.ru;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem('lang', lang);
    document.getElementById('lang-current').textContent = lang.toUpperCase();
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

document.getElementById('lang-toggle')?.addEventListener('click', () => {
    document.getElementById('lang-menu').classList.toggle('active');
});

document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
        applyLanguage(btn.dataset.lang);
        document.getElementById('lang-menu').classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.language-switcher')) {
        document.getElementById('lang-menu')?.classList.remove('active');
    }
});

/* ========================
   INITIALIZATION
======================== */
window.addEventListener('load', () => {
    // Update UI based on auth state
    auth.updateUI();
    
    // Fetch user profile if logged in
    if (auth.isLoggedIn()) {
        auth.fetchUserProfile();
        loadUserProfile();
    }
    
    // Load projects (public endpoint)
    loadProjects();
    renderBalance();
    renderTransactions();
    applyLanguage(localStorage.getItem('lang') || 'ru');
    
    console.log('%c🚀 ZeroPoint Platform', 'font-size: 24px; font-weight: bold; color: #7c3aed;');
    console.log('%cFrontend connected to refactored backend API', 'font-size: 14px; color: #06b6d4;');
});

/* ========================
   EXPOSE API FOR DEBUGGING (Development Only)
======================== */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.ZeroPointAPI = {
        auth,
        toast,
        createProject,
        createOrder,
        completeOrder,
        loadProjects,
        loadUserProfile,
        MoneyFormatter
    };
    console.log('%cDevelopment mode: API exposed as window.ZeroPointAPI', 'color: #10b981;');
}
