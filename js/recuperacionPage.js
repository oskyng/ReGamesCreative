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
                window.location.href = 'index.html';
            };
        } else {
            navLoginLink.classList.remove('d-none');
            navRegisterLink.classList.remove('d-none');
            navUserProfile.classList.add('d-none');
        }
    }

    document.getElementById('recovery-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const recoveryEmail = document.getElementById('recoveryEmailInput').value;
        const recoveryPassword = document.getElementById('recoveryPasswordInput').value;
        const recoveryConfirmPassword = document.getElementById('recoveryConfirmPasswordInput').value;
        const messageDiv = document.getElementById('recovery-message');

        if(!validateRecoveryPassword()) {
            messageDiv.innerHTML = '<div class="alert alert-danger">Error al enviar formulario.</div>';
            return;
        }

        const result = AuthService.updatePassword(recoveryEmail, recoveryPassword);
        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            updateAuthUI();
            setTimeout(() => { window.location.href = '/usuario/Login.html'; }, 1000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    });
    updateAuthUI(); // Llama al cargar la página
});

function validateRecoveryPassword() {
    const recoveryEmail = document.getElementById('recoveryEmailInput');
    const recoveryPassword = document.getElementById('recoveryPasswordInput');
    const recoveryConfirmPassword = document.getElementById('recoveryConfirmPasswordInput');

    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    let valido = true;

    if (!regexEmail.test(recoveryEmail.value.trim())) {
        recoveryEmail.classList.add("is-invalid");
        valido = false;
    }

    if (!regexPassword.test(recoveryPassword.value)) {
        recoveryPassword.classList.add("is-invalid");
        valido = false;
    } else {
        recoveryPassword.classList.remove("is-invalid");
        recoveryPassword.classList.add("is-valid");
    }

    if (recoveryPassword.value !== recoveryConfirmPassword.value || recoveryConfirmPassword.value === "") {
        recoveryConfirmPassword.classList.add("is-invalid");
        valido = false;
    } else {
        recoveryConfirmPassword.classList.remove("is-invalid");
        recoveryConfirmPassword.classList.add("is-valid");
    }

    return valido;
}