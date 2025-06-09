document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();

    const navLoginLink = document.getElementById('nav-login-link');
    const navRegisterLink = document.getElementById('nav-register-link');
    const navUserProfile = document.getElementById('nav-user-profile');
    const navUsername = document.getElementById('nav-username');
    const navUserRole = document.getElementById('nav-user-role');
    const navLogoutBtn = document.getElementById('nav-logout-btn');

    function updateAuthUI() {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            navLoginLink.classList.add('d-none');
            navRegisterLink.classList.add('d-none');
            navUserProfile.classList.remove('d-none');
            navUsername.textContent = currentUser.username;
            navUserRole.textContent = `Rol: ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}`;
            navLogoutBtn.onclick = () => {
                AuthService.logout();
                updateAuthUI();
                window.location.href = '/index.html';
            };
        } else {
            navLoginLink.classList.remove('d-none');
            navRegisterLink.classList.remove('d-none');
            navUserProfile.classList.add('d-none');
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
        const messageDiv = document.getElementById('login-message');

        const result = AuthService.login(username, password);
        if (result.success) {
            messageDiv.innerHTML = '<div class="alert alert-success">Inicio de sesión exitoso. Redirigiendo...</div>';
            updateAuthUI();
            setTimeout(() => { window.location.href = '/mi_biblioteca.html'; }, 1000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    }

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    updateAuthUI();
});