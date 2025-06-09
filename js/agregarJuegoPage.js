document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();

    const addGameContent = document.getElementById('add-game-sections');
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
            renderAddGameForm(); 
        } else {
            navLoginLink.classList.remove('d-none');
            navRegisterLink.classList.remove('d-none');
            navUserProfile.classList.add('d-none');
            addGameContent.innerHTML = `
                <div class="p-5 bg-secondary text-light rounded-lg shadow-xl text-center">
                    <h3 class="text-3xl font-bold mb-4">Acceso Requerido</h3>
                    <p class="opacity-75">Inicia sesión para añadir juegos a tu biblioteca.</p>
                    <a href="login.html" class="btn btn-primary mt-3">Ir a Login</a>
                </div>
            `;
        }
    }

    function renderAddGameForm() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            addGameContent.innerHTML = `
                <div class="p-5 bg-danger text-white rounded-lg shadow-xl text-center">
                    <h2 class="text-3xl font-bold mb-4">Acceso Denegado</h2>
                    <p class="opacity-75">Solo los usuarios con rol 'administrador' pueden acceder a esta página.</p>
                    <p class="opacity-75 mt-2">Por favor, inicia sesión como administrador.</p>
                    <a href="index.html" class="btn btn-light mt-3">Ir al inicio</a>
                </div>
            `;
            return;
        }

        addGameContent.innerHTML = `
            <form id="add-game-form">
                <div class="mb-3">
                    <label for="gameTitle" class="form-label text-muted">Título del Juego</label>
                    <input type="text" class="form-control" id="gameTitle" placeholder="Ej: Elden Ring" required>
                </div>
                <div class="mb-3">
                    <label for="gameDescription" class="form-label text-muted">Descripción</label>
                    <textarea class="form-control" id="gameDescription" rows="4" placeholder="Breve descripción del juego..."></textarea>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="gamePlatform" class="form-label text-muted">Plataforma(s)</label>
                        <input type="text" class="form-control" id="gamePlatform" placeholder="Ej: PC, PS5, Xbox Series X/S">
                    </div>
                    <div class="col-md-6">
                        <label for="gameGenre" class="form-label text-muted">Género(s)</label>
                        <input type="text" class="form-control" id="gameGenre" placeholder="Ej: ARPG, Fantasía">
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="gameHours" class="form-label text-muted">Horas de Juego Estimadas</label>
                        <input type="number" class="form-control" id="gameHours" placeholder="Ej: 80" min="0">
                    </div>
                    <div class="col-md-6">
                        <label for="gameImage" class="form-label text-muted">URL de Imagen de Portada</label>
                        <input type="url" class="form-control" id="gameImage" placeholder="https://ejemplo.com/portada.jpg">
                    </div>
                </div>
                <div class="d-grid gap-2 mt-4">
                    <button type="submit" class="btn btn-primary btn-lg">Añadir Juego a Mi Biblioteca</button>
                </div>
                <div id="add-game-message" class="mt-3 text-center"></div>
            </form>
        `;
        document.getElementById('add-game-form').addEventListener('submit', handleAddGame);
    }

    function handleAddGame(event) {
        event.preventDefault();
        const currentUser = AuthService.getCurrentUser();
        const messageDiv = document.getElementById('add-game-message');

        if (!currentUser) {
            messageDiv.innerHTML = '<div class="alert alert-danger">Debes iniciar sesión para añadir juegos.</div>';
            return;
        }
        if (currentUser.role !== 'admin') {
            messageDiv.innerHTML = '<div class="alert alert-danger">Solo los usuarios administradores pueden añadir juegos.</div>';
            return;
        }

        const gameData = {
            title: document.getElementById('gameTitle').value,
            description: document.getElementById('gameDescription').value,
            platform: document.getElementById('gamePlatform').value,
            genre: document.getElementById('gameGenre').value,
            hoursPlayed: parseFloat(document.getElementById('gameHours').value) || 0,
            image: document.getElementById('gameImage').value
        };

        GameService.addGame(currentUser.username, gameData);
        messageDiv.innerHTML = `<div class="alert alert-success">"${gameData.title}" añadido a tu biblioteca.</div>`;

        document.getElementById('add-game-form').reset();
    }

    updateAuthUI();
});