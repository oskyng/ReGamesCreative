document.addEventListener('DOMContentLoaded', () => {
    AuthService.init(); // Inicializa los usuarios de prueba

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
                window.location.href = 'index.html'; // Redirige a la página de inicio
            };
        } else {
            navLoginLink.classList.remove('d-none');
            navRegisterLink.classList.remove('d-none');
            navUserProfile.classList.add('d-none');
        }
    }

    function handleRegister(event) {
        event.preventDefault();
        const fullName  = document.getElementById('regFullNameInput').value;
        const username  = document.getElementById('regUsernameInput').value;
        const email     = document.getElementById('regEmailInput').value;
        const birthDay  = document.getElementById('regBirthDayInput').value;
        const password  = document.getElementById('regPasswordInput').value;
        const confirmPassword = document.getElementById('regConfirmPasswordInput').value;
        const messageDiv = document.getElementById('register-message');

        const newUser = { fullName, username, email, birthDay, password, confirmPassword, role: 'normal' };
        if (!validateRegisterUser()) {
            messageDiv.innerHTML = '<div class="alert alert-danger">Error al enviar formulario.</div>';
            return;
        }

        const result = AuthService.register(newUser);
        if (result.success) {
            messageDiv.innerHTML = '<div class="alert alert-success">Registro exitoso. Redirigiendo a Login...</div>';
            updateAuthUI();
            setTimeout(() => { window.location.href = '/usuario/Login.html'; }, 1000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    }

    document.getElementById('register-form').addEventListener('submit', handleRegister);
    updateAuthUI();
});

function validateRegisterUser() {
    let esValido = true;
    esValido &= validateEmptyString("regFullNameInput");
    esValido &= validateEmptyString("regUsernameInput");
    esValido &= validateEmail("regEmailInput");
    esValido &= validateDates("regBirthDayInput");
    esValido &= validatePassword("regPasswordInput", "regConfirmPasswordInput");

    return Boolean(esValido);
}