document.addEventListener('DOMContentLoaded', () => {
    AuthService.init(); // Inicializa los usuarios de prueba

    const profileContent = document.getElementById('profile-content');
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
                window.location.href = '/index.html'; // Redirige a la página de inicio
            };
            renderProfileForm(currentUser); // Renderiza el formulario de perfil
        } else {
            navLoginLink.classList.remove('d-none');
            navRegisterLink.classList.remove('d-none');
            navUserProfile.classList.add('d-none');
            // Si no está logueado, muestra un mensaje y redirige al login
            profileContent.innerHTML = `
                <div class="p-5 bg-secondary text-light rounded-lg shadow-xl text-center">
                    <h3 class="text-3xl font-bold mb-4">Acceso Requerido</h3>
                    <p class="opacity-75">Inicia sesión para ver y editar tu perfil.</p>
                    <a href="login.html" class="btn btn-primary mt-3">Ir a Login</a>
                </div>
            `;
        }
    }

    function renderProfileForm(user) {
        profileContent.innerHTML = `
            <h2 class="card-title text-center mb-4 text-light display-6 fw-bold">Mi Perfil</h2>
            <form id="profile-form" novalidate>
                <div class="mb-3">
                    <label for="nombre" class="form-label text-primary">Nombre completo</label>
                    <input type="text" class="form-control" id="profileFullNameInput" value="${user.fullName}" required>
                    <div class="invalid-feedback">Este campo es obligatorio.</div>
                </div>
                <div class="mb-3">
                    <label for="profileUsernameInput" class="form-label">Nombre de Usuario</label>
                    <input type="text" class="form-control" id="profileUsernameInput" value="${user.username}" placeholder="Tu Nombre de Usuario" required>
                </div>
                <div class="mb-3">
                    <label for="profileEmailInput" class="form-label">Correo Electrónico</label>
                    <input type="email" class="form-control" id="profileEmailInput" value="${user.email || 'no-email@ejemplo.com'}" disabled>
                </div>
                <div class="mb-3">
                    <label for="fechaNacimiento" class="form-label text-primary">Fecha de nacimiento</label>
                    <input type="date" class="form-control" id="profileBirthDayInput" value="${user.birthDay}" placeholder="********" required>
                    <div class="invalid-feedback">Debes tener al menos 13 años.</div>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label text-primary">Contraseña</label>
                    <input type="password" class="form-control" id="profilePasswordInput" value="${user.password}" placeholder="********" required>
                    <div class="invalid-feedback">Debe tener mínimo 8 caracteres, 1 número, 1 mayúscula y 1 caracter
                        especial.</div>
                </div>
                <div class="mb-3">
                    <label for="profileRoleInput" class="form-label">Rol</label>
                    <input type="text" class="form-control" id="profileRoleInput" value="${user.role.charAt(0).toUpperCase() + user.role.slice(1)}" disabled>
                </div>
                <div class="d-grid gap-2 mb-3">
                    <button type="submit" class="btn btn-primary btn-lg">Guardar Cambios</button>
                </div>
                <div id="profile-message" class="mt-3 text-center"></div>
            </form>
        `;
        document.getElementById('profile-form').addEventListener('submit', (e) => handleProfileUpdate(e, user.username));
    }

    function handleProfileUpdate(event, originalUsername) {
        event.preventDefault();
        const newUsername = document.getElementById('profileUsernameInput').value;
        const newFullName = document.getElementById('profileFullNameInput').value;
        const newEmail = document.getElementById('profileEmailInput').value;
        const newBirthDay = document.getElementById('profileBirthDayInput').value;
        const newPassword = document.getElementById('profilePasswordInput').value;
        const messageDiv = document.getElementById('profile-message');

        //const newUser = { fullName, username, email, birthDay, password, confirmPassword, role: 'normal' };
        if (!validatePerfilUser()) {
            messageDiv.innerHTML = '<div class="alert alert-danger">Error al actualizar perfil.</div>';
            return;
        }
        newUser = {
            fullName: newFullName,
            username: newUsername,
            email: newEmail,
            birthDay: newBirthDay,
            password: newPassword,
            role: 'normal'
        };
        const result = AuthService.updateProfile(originalUsername, newUser);
        if (result.success) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            updateAuthUI();
            setTimeout(() => { window.location.href = '/index.html'; }, 1000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    }

    updateAuthUI();
});

function validatePerfilUser() {
    let esValido = true;
    esValido &= validateEmptyString("profileFullNameInput");
    esValido &= validateEmptyString("profileUsernameInput");
    esValido &= validateEmail("profileEmailInput");
    esValido &= validateDates("profileBirthDayInput");
    esValido &= validatePassword("profilePasswordInput", "profilePasswordInput");

    return Boolean(esValido);
}