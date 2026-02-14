(function () {
    const form = document.getElementById('profile-setup-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('jwt_token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');

        if (!token || !user?.id) {
            sessionStorage.setItem('auth_redirect_notice', 'Нужно войти');
            window.location.href = 'index.html';
            return;
        }

        const payload = {
            bio: document.getElementById('setup-bio')?.value || null,
            avatarUrl: document.getElementById('setup-avatar')?.value || null
        };

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Ошибка сохранения профиля');
            }

            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = 'profile.html';
        } catch (error) {
            if (window.toast?.error) {
                window.toast.error(error.message);
            } else {
                alert(error.message);
            }
        }
    });
})();
