document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();

    const gamesList = document.getElementById('games');
    const searchInput = document.getElementById('search-input');
    const platformFilter = document.getElementById('platform-filter');
    const genreFilter = document.getElementById('genre-filter');

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

    // Funcionalidad de Búsqueda y Filtro
    function filterGames() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedPlatform = platformFilter.value.toLowerCase();
        const selectedGenre = genreFilter.value.toLowerCase();

        const gameCards = gamesList.getElementsByClassName('col');

        for (let i = 0; i < gameCards.length; i++) {
            const card = gameCards[i];
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.dataset.gameDescription.toLowerCase();
            const platformData = card.dataset.gamePlatform ? card.dataset.gamePlatform.toLowerCase() : '';
            const genreData = card.dataset.gameGenre ? card.dataset.gameGenre.toLowerCase() : '';

            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesPlatform = selectedPlatform === '' || platformData.includes(selectedPlatform);
            const matchesGenre = selectedGenre === '' || genreData.includes(selectedGenre);

            if (matchesSearch && matchesPlatform && matchesGenre) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    }

    // Event Listeners para Búsqueda y Filtro
    searchInput.addEventListener('keyup', filterGames);
    platformFilter.addEventListener('change', filterGames);
    genreFilter.addEventListener('change', filterGames);


    // Event Listener para el Modal de Detalles
    const gameDetailModal = document.getElementById('gameDetailModal');
    if (gameDetailModal) {
        gameDetailModal.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget;
            const card = button.closest('.game-card');

            const title = card.dataset.gameTitle;
            const description = card.dataset.gameDescription;
            const platform = card.dataset.gamePlatform;
            const genre = card.dataset.gameGenre;
            const hours = card.dataset.gameHours;
            const image = card.dataset.gameImage;
            const achievementsJson = card.dataset.gameAchievements;

            gameDetailModal.querySelector('#modal-game-image').src = image;
            gameDetailModal.querySelector('#modal-game-title').textContent = title;
            gameDetailModal.querySelector('#modal-game-platform').textContent = platform;
            gameDetailModal.querySelector('#modal-game-genre').textContent = genre;
            gameDetailModal.querySelector('#modal-game-description').textContent = description;
            gameDetailModal.querySelector('#modal-game-hours').textContent = hours;

            const achievementsListDiv = gameDetailModal.querySelector('#modal-game-achievements-list');
            let achievements = [];
            try {
                achievements = achievementsJson ? JSON.parse(achievementsJson) : [{ name: "Completar Nivel 1", completed: false }, { name: "Derrotar Primer Jefe", completed: false }];
            } catch (e) {
                console.error("Error parsing achievements JSON:", e);
            }

            if (achievements.length > 0) {
                achievementsListDiv.innerHTML = achievements.map((ach, index) => `
                    <div class="form-check text-light mb-2">
                        <input class="form-check-input achievement-checkbox" type="checkbox" value="" id="achievement-${index}" ${ach.completed ? 'checked' : ''} data-game-id="${card.dataset.gameId}" data-achievement-index="${index}">
                        <label class="form-check-label ${ach.completed ? 'text-muted text-decoration-line-through' : ''}" for="achievement-${index}">
                            ${ach.name}
                        </label>
                    </div>
                `).join('');

                achievementsListDiv.querySelectorAll('.achievement-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        const currentUser = AuthService.getCurrentUser();
                        if (!currentUser) {
                            alert("Debes iniciar sesión para guardar el progreso de logros.");
                            e.target.checked = !e.target.checked;
                            return;
                        }

                        const gameId = parseInt(card.dataset.gameId);
                        const achIndex = parseInt(e.target.dataset.achievementIndex);
                        const isCompleted = e.target.checked;

                        const userGames = GameService.getUserGames(currentUser.username);
                        const gameToUpdate = userGames.find(g => g.id === gameId);

                        if (gameToUpdate && gameToUpdate.achievements && gameToUpdate.achievements[achIndex]) {
                            gameToUpdate.achievements[achIndex].completed = isCompleted;
                            GameService.updateGame(currentUser.username, gameToUpdate);
                            const label = e.target.nextElementSibling;
                            if (isCompleted) {
                                label.classList.add('text-muted', 'text-decoration-line-through');
                            } else {
                                label.classList.remove('text-muted', 'text-decoration-line-through');
                            }
                        }
                    });
                });

            } else {
                achievementsListDiv.innerHTML = '<p class="text-light">No hay logros disponibles para este juego.</p>';
            }
        });
    }

    // Funcionalidad para "Añadir a Mi Biblioteca"
    document.querySelectorAll('.add-to-user-library-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const card = button.closest('.game-card');
            const currentUser = AuthService.getCurrentUser();
            const messageDiv = card.querySelector('.add-to-library-message');
            messageDiv.style.display = 'block';

            if (!currentUser) {
                messageDiv.className = 'add-to-library-message mt-2 text-center text-sm text-danger';
                messageDiv.textContent = 'Debes iniciar sesión para añadir juegos.';
                return;
            }

            const gameData = {
                id: parseInt(card.dataset.gameId),
                title: card.dataset.gameTitle,
                description: card.dataset.gameDescription,
                platform: card.dataset.gamePlatform,
                genre: card.dataset.gameGenre,
                hoursPlayed: parseFloat(card.dataset.gameHours) || 0,
                image: card.dataset.gameImage,
                achievements: JSON.parse(card.dataset.gameAchievements || '[]')
            };

            const result = GameService.addGame(currentUser.username, gameData);

            if (result.success) {
                messageDiv.className = 'add-to-library-message mt-2 text-center text-sm text-success';
                messageDiv.textContent = result.message;
                button.disabled = true;
            } else {
                messageDiv.className = 'add-to-library-message mt-2 text-center text-sm text-warning';
                messageDiv.textContent = result.message;
            }
        });
    });


    updateAuthUI();
});