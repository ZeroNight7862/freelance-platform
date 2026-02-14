(function () {
    window.__AUTH_FLOW_EXTERNAL__ = true;

    const API_BASE = window.ZeroPointConfig?.apiBase || localStorage.getItem('zeropoint_api_base') || '';

    function buildApiUrl(path) {
        if (!path || /^https?:\/\//i.test(path)) return path;
        if (!API_BASE) return path;
        const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
    }

    function authFetch(path, options) {
        return fetch(buildApiUrl(path), options);
    }

    function showError(message) {
        if (window.toast?.error) {
            window.toast.error(message);
        } else {
            alert(message || 'Произошла ошибка');
        }
    }

    function saveAuth(authResponse) {
        if (!authResponse?.token || !authResponse?.user) {
            throw new Error('Некорректный ответ авторизации');
        }

        localStorage.setItem('jwt_token', authResponse.token);
        localStorage.setItem('user', JSON.stringify(authResponse.user));
    }

    async function parseResponse(response) {
        let data = null;
        try {
            data = await response.json();
        } catch (_) {
            // no-op
        }

        if (!response.ok) {
            const message = data?.message || data?.error || 'Не удалось выполнить запрос';
            throw new Error(message);
        }

        return data;
    }

    async function handleRegisterSubmit(e) {
        e.preventDefault();

        const username = document.getElementById('register-username')?.value?.trim();
        const email = document.getElementById('register-email')?.value?.trim();
        const password = document.getElementById('register-password')?.value;
        const role = document.getElementById('register-role')?.value;

        if (!username || !email || !password || !role) {
            showError('Заполните все поля');
            return;
        }

        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton?.innerHTML;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        }

        try {
            const response = await authFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await parseResponse(response);
            saveAuth(data);
            window.location.href = 'profile-setup.html';
        } catch (error) {
            showError(error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    }

    async function handleLoginSubmit(e) {
        e.preventDefault();

        const email = document.getElementById('login-email')?.value?.trim();
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            showError('Введите email и пароль');
            return;
        }

        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton?.innerHTML;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        }

        try {
            const response = await authFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await parseResponse(response);
            saveAuth(data);
            window.location.href = 'profile.html';
        } catch (error) {
            showError(error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    }

    async function loginWithTelegram() {
        const fakeTelegramUser = {
            id: Date.now(),
            username: `tg_user_${Math.floor(Math.random() * 10000)}`,
            first_name: 'Telegram',
            auth_date: Math.floor(Date.now() / 1000)
        };

        const registerPayload = {
            username: fakeTelegramUser.username,
            email: `${fakeTelegramUser.id}@telegram.local`,
            password: `TgDemo!${fakeTelegramUser.id}`,
            role: 'FREELANCER'
        };

        try {
            let response = await authFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerPayload)
            });

            if (!response.ok) {
                response = await authFetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: registerPayload.email, password: registerPayload.password })
                });
            }

            const data = await parseResponse(response);
            saveAuth(data);
            window.location.href = 'profile.html';
        } catch (error) {
            showError(`Telegram login error: ${error.message}`);
        }
    }

    window.loginWithTelegram = loginWithTelegram;

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('register-form')?.addEventListener('submit', handleRegisterSubmit);
        document.getElementById('login-form')?.addEventListener('submit', handleLoginSubmit);
        document.getElementById('btn-telegram-register')?.addEventListener('click', loginWithTelegram);
    });
})();
