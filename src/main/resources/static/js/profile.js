/* ========================
   PROFILE PAGE - ZeroPoint Platform
   Security: Auth check, token validation
   API: Fetch user profile, update profile
======================== */

class ProfileManager {
    constructor() {
        this.authToken = localStorage.getItem('jwt_token');
        this.userCache = null;
        this.apiBaseUrl = '/api';
    }

    // Security check - redirect if not authenticated
    checkAuthentication() {
        if (!this.authToken) {
            console.warn('No auth token found. Redirecting to login...');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // Get auth headers
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
        };
    }

    // Handle logout
    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // Handle authentication errors
    handleAuthError(status) {
        if (status === 401 || status === 403) {
            console.error('Token expired or invalid. Logging out...');
            this.showToast('Сессия истекла. Войдите снова.', 'error');
            setTimeout(() => this.logout(), 2000);
            return true;
        }
        return false;
    }

    // Fetch user profile from API
    async fetchUserProfile() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (this.handleAuthError(response.status)) {
                    throw new Error('Authentication failed');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.userCache = data;
            return data;

        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    // Update user profile
    async updateUserProfile(updateData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/me`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                if (this.handleAuthError(response.status)) {
                    throw new Error('Authentication failed');
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const data = await response.json();
            this.userCache = data;
            return data;

        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Format balance for display
    formatBalance(balance) {
        if (!balance) return '0 ₽';
        
        // Handle string or number
        const numValue = typeof balance === 'string' ? parseFloat(balance) : balance;
        
        if (isNaN(numValue)) return '0 ₽';
        
        // Format with spaces as thousand separators
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numValue);
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'Н/Д';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Get role display name
    getRoleDisplayName(role) {
        const roleMap = {
            'FREELANCER': 'Фрилансер',
            'CLIENT': 'Заказчик',
            'ADMIN': 'Администратор'
        };
        return roleMap[role] || role;
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
            border: 1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
            color: ${type === 'success' ? '#10b981' : '#ef4444'};
            padding: 16px 24px;
            border-radius: 12px;
            backdrop-filter: blur(16px);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Render user profile data
    renderProfile(userData) {
        // Sidebar user info
        document.getElementById('sidebar-username').textContent = userData.username || 'Пользователь';
        document.getElementById('sidebar-role').textContent = this.getRoleDisplayName(userData.role);
        
        const sidebarAvatar = document.getElementById('sidebar-avatar');
        sidebarAvatar.src = userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`;

        // Balance display
        document.getElementById('balance-display').textContent = this.formatBalance(userData.balance);

        // Profile form fields
        document.getElementById('username').value = userData.username || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('fullName').value = userData.fullName || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('avatarUrl').value = userData.avatarUrl || '';

        // Role badge
        const roleBadge = document.getElementById('role-badge');
        const roleText = document.getElementById('role-text');
        roleText.textContent = this.getRoleDisplayName(userData.role);
        
        if (userData.role === 'CLIENT') {
            roleBadge.classList.add('client');
        } else {
            roleBadge.classList.remove('client');
        }

        // Account details
        document.getElementById('userId').value = userData.id || 'N/A';
        document.getElementById('createdAt').value = this.formatDate(userData.createdAt);
        document.getElementById('updatedAt').value = this.formatDate(userData.updatedAt);
    }

    // Show loading state
    showLoading(show = true) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('profile-content');
        const error = document.getElementById('error-content');

        if (show) {
            loading.style.display = 'flex';
            content.style.display = 'none';
            error.style.display = 'none';
        } else {
            loading.style.display = 'none';
            content.style.display = 'block';
        }
    }

    // Show error state
    showError(message) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('profile-content');
        const error = document.getElementById('error-content');
        const errorText = document.getElementById('error-text');

        loading.style.display = 'none';
        content.style.display = 'none';
        error.style.display = 'block';
        errorText.textContent = message;
    }

    // Initialize profile page
    async init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return;
        }

        // Setup logout button
        document.getElementById('btn-logout').addEventListener('click', () => {
            this.logout();
        });

        // Setup save button
        document.getElementById('btn-save').addEventListener('click', async () => {
            await this.handleSaveProfile();
        });

        // Load user profile
        await this.loadProfile();
    }

    // Load profile data
    async loadProfile() {
        this.showLoading(true);

        try {
            const userData = await this.fetchUserProfile();
            this.renderProfile(userData);
            this.showLoading(false);
        } catch (error) {
            console.error('Failed to load profile:', error);
            this.showError('Не удалось загрузить данные профиля. Попробуйте обновить страницу.');
        }
    }

    // Handle profile save
    async handleSaveProfile() {
        const saveButton = document.getElementById('btn-save');
        const originalText = saveButton.innerHTML;
        
        // Disable button and show loading
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';

        try {
            // Collect form data
            const updateData = {
                fullName: document.getElementById('fullName').value.trim() || null,
                phone: document.getElementById('phone').value.trim() || null,
                avatarUrl: document.getElementById('avatarUrl').value.trim() || null
            };

            // Update profile via API
            const updatedUser = await this.updateUserProfile(updateData);
            
            // Re-render with new data
            this.renderProfile(updatedUser);
            
            // Update localStorage cache
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Show success message
            this.showToast('Профиль успешно обновлен!', 'success');

        } catch (error) {
            console.error('Failed to save profile:', error);
            this.showToast(error.message || 'Ошибка сохранения. Попробуйте снова.', 'error');
        } finally {
            // Re-enable button
            saveButton.disabled = false;
            saveButton.innerHTML = originalText;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const profileManager = new ProfileManager();
    profileManager.init();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);
