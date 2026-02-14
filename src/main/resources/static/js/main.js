/* ========================
   MAIN.JS - ZeroPoint Platform
   Core UI functionality, Toast system, Project cards rendering
   Author: Senior Frontend Architect
======================== */

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
class ToastSystem {
    constructor() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
        this.activeToasts = [];
        this.maxToasts = 3;
    }

    show(message, type = 'success', details = null) {
        // Remove oldest if limit reached
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
                if (index > -1) this.activeToasts.splice(index, 1);
            }, 300);
        }, 5000);
    }

    success(message) {
        this.show(message, 'success');
    }

    error(message, details = null) {
        this.show(message, 'error', details);
    }
}

// Global toast instance
const toast = new ToastSystem();


const API_BASE = window.ZeroPointConfig?.apiBase || localStorage.getItem('zeropoint_api_base') || '';

function buildApiUrl(path) {
    if (!path || /^https?:\/\//i.test(path)) {
        return path;
    }

    if (!API_BASE) {
        return path;
    }

    const normalizedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    return path.startsWith('/') ? `${normalizedBase}${path}` : `${normalizedBase}/${path}`;
}

function apiFetch(path, options) {
    return fetch(buildApiUrl(path), options);
}

/* ========================
   API ERROR HANDLER
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
        const message = error?.message || 'Произошла ошибка';

        if (error?.validationErrors) {
            // Show validation errors with details
            toast.error('Проверьте введенные данные:', error.validationErrors);
            return;
        }

        // Show standard error
        toast.error(message);

        // Fallback for layouts without toast container
        if (!document.getElementById('toast-container')) {
            alert(message);
        }
    }
}

/* ========================
   AUTH MANAGER - Updated for new API
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
            const response = await apiFetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
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

    getAuthHeaders(includeContentType = true) {
        const headers = {
            'Authorization': `Bearer ${this.token}`
        };

        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;

// ========================================
// MONEY FORMATTER
// ========================================
class MoneyFormatter {
    static format(value) {
        if (!value) return '0';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '0';
        
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numValue);
    }

    static formatWithCurrency(value, currency = '₽') {
        return `${this.format(value)} ${currency}`;
    }
}


// ========================================
// PROJECT CARD RENDERER
// ========================================
class ProjectRenderer {
    static renderCard(project) {
        const card = document.createElement('div');
        card.className = 'col-lg-6';
        card.innerHTML = `
            <div class="project-card">
                <div class="project-top">
                    <span class="project-category">${project.category || 'Веб-разработка'}</span>
                    <span class="project-price">${MoneyFormatter.formatWithCurrency(project.budget)}</span>
                </div>
                <h3 class="project-name">${this.escapeHtml(project.title)}</h3>
                <p class="project-desc">${this.truncate(this.escapeHtml(project.description), 120)}</p>
                <div class="project-skills">
                    ${this.renderSkills(project.skills || [])}
                </div>
                <div class="project-bottom">
                    <div class="project-time">
                        <i class="fas fa-clock"></i>
                        <span>${this.formatDate(project.createdAt)}</span>
                    </div>
                    <button class="btn-project-apply" data-project-id="${project.id}">
                        Откликнуться
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    static renderSkills(skills) {
        if (!skills || skills.length === 0) {
            return '<span class="skill-tag">JavaScript</span><span class="skill-tag">React</span>';
        }
        return skills.slice(0, 4).map(skill => 
            `<span class="skill-tag">${this.escapeHtml(skill)}</span>`
        ).join('');
    }

    static formatDate(dateString) {
        if (!dateString) return 'Недавно';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Только что';
        if (diffHours < 24) return `${diffHours} ч. назад`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        
        return date.toLocaleDateString('ru-RU');
    }

    static formatWithCurrency(value, currency = '$') {
        return `${currency}${this.format(value)}`;
    }
}

/* ========================
   EVENT LISTENERS - HEADER BUTTONS
document.getElementById('btn-login')?.addEventListener('click', () => {
    loginModal.open();
});

document.getElementById('btn-register')?.addEventListener('click', () => {
    registerModal.open();
});

document.getElementById('hero-start')?.addEventListener('click', () => {
    if (auth.isLoggedIn()) {
        window.location.href = '#projects';
    } else {
        registerModal.open();
    }
});

/* ========================
   EVENT LISTENERS - MODAL CLOSE BUTTONS
document.getElementById('close-login')?.addEventListener('click', () => {
    loginModal.close();
});

document.getElementById('close-register')?.addEventListener('click', () => {
    registerModal.close();
});

document.getElementById('login-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'login-modal') {
        loginModal.close();
    static truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.getElementById('register-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'register-modal') {
        registerModal.close();
    }
});

// ========================================
// API SERVICE
// ========================================
class ApiService {
    static async fetchProjects(limit = 6, filters = {}) {
        try {
            // TODO CODEX: Connect to real endpoint GET /api/projects
            // const response = await fetch('/api/projects');
            // const data = await response.json();
            
            // Mock data for now
            console.log('Fetching projects with filters:', filters);
            
            return this.getMockProjects().slice(0, limit);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Не удалось загрузить проекты');
            return [];
        }
    }
document.getElementById('switch-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.close();
    setTimeout(() => {
        registerModal.open();
    }, 300);
});

document.getElementById('switch-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.close();
    setTimeout(() => {
        loginModal.open();
    }, 300);
});

/* ========================
   EVENT LISTENERS - LOGOUT
document.getElementById('btn-logout')?.addEventListener('click', (e) => {
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
if (!window.__AUTH_FLOW_EXTERNAL__) {
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        toast.error('Заполните все поля');
        return;

    static getMockProjects() {
        return [
            {
                id: 1,
                title: 'Редизайн E-Commerce платформы',
                description: 'Требуется опытный разработчик для редизайна платформы электронной коммерции с современным UI/UX и интеграцией платежных систем.',
                budget: 5000,
                category: 'Веб-разработка',
                skills: ['React', 'Node.js', 'PostgreSQL'],
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                status: 'OPEN'
            },
            {
                id: 2,
                title: 'Дизайн-система для мобильного приложения',
                description: 'Нужен дизайнер для создания комплексной дизайн-системы финтех мобильного приложения с полным набором компонентов.',
                budget: 3000,
                category: 'UI/UX Дизайн',
                skills: ['Figma', 'Design Systems', 'Mobile'],
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                status: 'OPEN'
            },
            {
                id: 3,
                title: 'Telegram бот для автоматизации',
                description: 'Разработка бота для автоматизации бизнес-процессов с интеграцией CRM и платежными системами.',
                budget: 2500,
                category: 'Backend',
                skills: ['Python', 'Telegram API', 'PostgreSQL'],
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                status: 'OPEN'
            },
            {
                id: 4,
                title: 'Видеоролик для YouTube канала',
                description: 'Нужен монтажер для создания динамичного видео для IT-канала. Длительность 10-15 минут.',
                budget: 1500,
                category: 'Видео',
                skills: ['Premiere Pro', 'After Effects'],
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                status: 'OPEN'
            }
        ];
    }
}


// ========================================
// MODAL MANAGER
// ========================================
class ModalManager {
    static open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
if (!window.__AUTH_FLOW_EXTERNAL__) {
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
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
    
    if (password.length < 6) {
        toast.error('Пароль должен быть не менее 6 символов');
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
        const response = await apiFetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })

    static close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    static closeAll() {
        document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            const target = document.querySelector(href);
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
async function loadProjects() {
    try {
        const response = await apiFetch('/api/projects', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            if (target) {
                e.preventDefault();
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
}


// ========================================
// LOAD PROJECTS ON INDEX PAGE
// ========================================
async function loadIndexProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    try {
        // TODO CODEX: Fetch from GET /api/projects?limit=4
        const projects = await ApiService.fetchProjects(4);
        
        projectsGrid.innerHTML = '';
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Пока нет доступных проектов</p>
                </div>
            `;
            return;
        }

async function createProject(title, description, budget) {
    if (!auth.isLoggedIn()) {
        toast.error('Войдите в систему для создания проекта');
        return null;
    }

    try {
        const response = await apiFetch('/api/projects', {
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
async function createOrder(projectId, freelancerId, price) {
    if (!auth.isLoggedIn()) {
        toast.error('Войдите в систему для создания заказа');
        return null;
    }

    try {
        const response = await apiFetch('/api/orders', {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                projectId,
                freelancerId,
                price: parseFloat(price) // Convert string to number for BigDecimal
            })
        });
        projects.forEach(project => {
            const card = ProjectRenderer.renderCard(project);
            projectsGrid.appendChild(card);
        });

        // Attach event listeners to apply buttons
        attachProjectApplyListeners();

    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Ошибка загрузки проектов</p>
            </div>
        `;
    }
}

async function completeOrder(orderId) {
    if (!auth.isLoggedIn()) {
        toast.error('Войдите в систему');
        return false;
    }

    try {
        const response = await apiFetch(`/api/orders/${orderId}/complete`, {
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

// ========================================
// PROJECT APPLY LISTENERS
// ========================================
function attachProjectApplyListeners() {
    document.querySelectorAll('.btn-project-apply').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id');
            
            // Check if user is logged in
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                toast.error('Войдите в аккаунт для отклика на проект');
                setTimeout(() => {
                    ModalManager.open('login-modal');
                }, 1000);
                return;
            }

            // TODO CODEX: Send application POST /api/orders
            console.log('Applying to project:', projectId);
            toast.success('Отклик отправлен! Заказчик рассмотрит ваше предложение.');
        });
    });
}


// ========================================
// CLOSE MODAL ON BACKDROP CLICK
// ========================================
function initModalCloseListeners() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', function(e) {
            if (e.target === this) {
                ModalManager.close(this.id);
            }
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            ModalManager.closeAll();
        }
    });
}


// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🚀 ZeroPoint Platform', 'font-size: 24px; font-weight: bold; color: #7c3aed;');
    console.log('%cMain.js loaded successfully', 'font-size: 14px; color: #06b6d4;');

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize modal listeners
    initModalCloseListeners();

    // Load projects on index page
    if (document.getElementById('projects-grid')) {
        loadIndexProjects();
    }

    // Hero "Start" button
    const heroStartBtn = document.getElementById('hero-start');
    if (heroStartBtn) {
        heroStartBtn.addEventListener('click', function() {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                window.location.href = 'profile.html';
            } else {
                ModalManager.open('register-modal');
            }
        });
    }
});

window.addEventListener('load', () => {
    const authRequired = document.body?.dataset?.authRequired === 'true';
    if (authRequired && !auth.isLoggedIn()) {
        sessionStorage.setItem('auth_redirect_notice', 'Нужно войти');
        window.location.href = 'index.html';
        return;
    }

    const authNotice = sessionStorage.getItem('auth_redirect_notice');
    if (authNotice && document.getElementById('toast-container')) {
        toast.error(authNotice);
        sessionStorage.removeItem('auth_redirect_notice');
    }

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

// ========================================
// EXPORT FOR OTHER SCRIPTS
// ========================================
window.ZeroPoint = {
    toast,
    ModalManager,
    ApiService,
    ProjectRenderer,
    MoneyFormatter
};
