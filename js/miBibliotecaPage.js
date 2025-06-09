document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();

    const libraryContent = document.getElementById('library-content');
    const navLoginLink = document.getElementById('nav-login-link');
    const navRegisterLink = document.getElementById('nav-register-link');
    const navUserProfile = document.getElementById('nav-user-profile');
    const navUsername = document.getElementById('nav-username');
    const navUserRole = document.getElementById('nav-user-role');
    const navLogoutBtn = document.getElementById('nav-logout-btn');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const favoriteFilter = document.getElementById('favorite-filter');

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
            filterAndRenderGames();
        } else {
            navLoginLink.classList.remove('d-none');
            navRegisterLink.classList.remove('d-none');
            navUserProfile.classList.add('d-none');
            libraryContent.innerHTML = `
                <div class="p-5 bg-secondary text-light rounded-lg shadow-xl text-center">
                    <h3 class="text-3xl font-bold mb-4">¡Bienvenido a la Biblioteca de Videojuegos!</h3>
                    <p class="opacity-75 mb-6">Inicia sesión o regístrate para gestionar tu propia biblioteca personal.</p>
                    <p class="opacity-75 text-sm">Puedes usar <code>admin</code> / <code>adminpassword</code> o <code>user1</code> / <code>userpassword</code>.</p>
                </div>
            `;
        }
    }

    function filterAndRenderGames() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            libraryContent.innerHTML = '';
            return;
        }

        const allUserGames = GameService.getUserGames(currentUser.username);
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedFavorite = favoriteFilter.value;

        const filteredGames = allUserGames.filter(game => {
            const matchesSearch = game.title.toLowerCase().includes(searchTerm) ||
                                  game.description.toLowerCase().includes(searchTerm) ||
                                  game.platform.toLowerCase().includes(searchTerm) ||
                                  game.genre.toLowerCase().includes(searchTerm);

            const matchesStatus = selectedStatus === '' ||
                                  (selectedStatus === 'jugado' && game.played) ||
                                  (selectedStatus === 'pendiente' && !game.played);

            const matchesFavorite = selectedFavorite === '' ||
                                    (selectedFavorite === 'favorito' && game.isFavorite) ||
                                    (selectedFavorite === 'no-favorito' && !game.isFavorite);

            return matchesSearch && matchesStatus && matchesFavorite;
        });

        if (filteredGames.length === 0) {
            libraryContent.innerHTML = `
                <div class="p-5 text-light rounded-lg shadow-xl text-center">
                    <h3 class="text-2xl font-bold mb-4">No se encontraron juegos con los filtros aplicados.</h3>
                    <p>Intenta ajustar tus criterios de búsqueda o filtro.</p>
                </div>
            `;
        } else {
            libraryContent.innerHTML = `
                <div id="games-list" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    ${filteredGames.map(game => createGameCard(game)).join('')}
                </div>
            `;
            addGameCardEventListeners();
        }
    }

    function handleToggleFavorite(gameId) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) { alert("Debes iniciar sesión para marcar favoritos."); return; }
        const userGames = GameService.getUserGames(currentUser.username);
        const gameToUpdate = userGames.find(game => game.id === gameId);
        if (gameToUpdate) {
            gameToUpdate.isFavorite = !gameToUpdate.isFavorite;
            GameService.updateGame(currentUser.username, gameToUpdate);
            filterAndRenderGames();
        }
    }

    function handleTogglePlayed(gameId) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) { alert("Debes iniciar sesión para actualizar el estado."); return; }
        const userGames = GameService.getUserGames(currentUser.username);
        const gameToUpdate = userGames.find(game => game.id === gameId);
        if (gameToUpdate) {
            gameToUpdate.played = !gameToUpdate.played;
            GameService.updateGame(currentUser.username, gameToUpdate);
            filterAndRenderGames();
        }
    }

    function handleUpdateHoursPlayed(gameId) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) { alert("Debes iniciar sesión para actualizar las horas."); return; }
        const userGames = GameService.getUserGames(currentUser.username);
        const gameToUpdate = userGames.find(game => game.id === gameId);
        if (gameToUpdate) {
            const newHours = prompt(`Introduce las horas jugadas para "${gameToUpdate.title}":`, gameToUpdate.hoursPlayed);
            const parsedHours = parseFloat(newHours);
            if (!isNaN(parsedHours) && parsedHours >= 0) {
                gameToUpdate.hoursPlayed = parsedHours;
                GameService.updateGame(currentUser.username, gameToUpdate);
                filterAndRenderGames();
            } else if (newHours !== null) { alert("Entrada no válida. Por favor, introduce un número positivo."); }
        }
    }

    function handleDeleteGame(gameId) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) { alert("Debes iniciar sesión para eliminar juegos."); return; }
        if (confirm(`¿Estás seguro de que quieres eliminar este juego de tu biblioteca?`)) {
            GameService.deleteGame(currentUser.username, gameId);
            filterAndRenderGames();
        }
    }

    function createGameCard(game) {
        const gameIdNum = parseInt(game.id);

        return `
            <div class="col">
                <div class="card h-100 game-card shadow-sm border-0" data-game-id="${gameIdNum}"
                             data-game-title="${game.title}"
                             data-game-description="${game.description}"
                             data-game-platform="${game.platform}"
                             data-game-genre="${game.genre}"
                             data-game-hours="${game.hoursPlayed}"
                             data-game-image="${game.image}"
                             data-game-achievements='${JSON.stringify(game.achievements || [])}'>
                    <img src="${game.image}" class="card-img-top" alt="Portada ${game.title}" onerror="this.onerror=null;this.src='https://placehold.co/400x250/374151/D1D5DB?text=No+Image';">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary">${game.title}</h5>
                        <p class="card-text small text-muted">Plataforma: ${game.platform} | Género: ${game.genre}</p>
                        <p class="card-text flex-grow-1">${game.description.substring(0, 100)}${game.description.length > 100 ? '...' : ''}</p>
                        <p class="card-text text-secondary"><i class="fas fa-clock me-2"></i>Horas de juego: ${game.hoursPlayed}h</p>

                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="badge ${game.played ? 'bg-success' : 'bg-warning'}">${game.played ? 'Jugado' : 'Pendiente'}</span>
                            <button class="btn btn-sm ${game.isFavorite ? 'btn-warning' : 'btn-outline-warning'} toggle-favorite-btn" data-game-id="${gameIdNum}">
                                <i class="fas fa-star"></i> ${game.isFavorite ? 'Favorito' : 'Añadir a Fav.'}
                            </button>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <button type="button" class="btn btn-sm btn-info view-details-btn" data-bs-toggle="modal" data-bs-target="#gameDetailModal" data-game-id="${gameIdNum}">Ver Detalles</button>
                            <button type="button" class="btn btn-sm btn-secondary toggle-played-btn" data-game-id="${gameIdNum}">${game.played ? 'Marcar Pend.' : 'Marcar Jugado'}</button>
                            <button type="button" class="btn btn-sm btn-primary update-hours-btn" data-game-id="${gameIdNum}"><i class="fas fa-edit"></i> Horas</button>
                            <button type="button" class="btn btn-sm btn-danger delete-game-btn" data-game-id="${gameIdNum}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function addGameCardEventListeners() {
        document.querySelectorAll('.toggle-favorite-btn').forEach(button => {
            button.onclick = (e) => handleToggleFavorite(parseInt(e.currentTarget.dataset.gameId));
        });
        document.querySelectorAll('.toggle-played-btn').forEach(button => {
            button.onclick = (e) => handleTogglePlayed(parseInt(e.currentTarget.dataset.gameId));
        });
        document.querySelectorAll('.update-hours-btn').forEach(button => {
            button.onclick = (e) => handleUpdateHoursPlayed(parseInt(e.currentTarget.dataset.gameId));
        });
        document.querySelectorAll('.delete-game-btn').forEach(button => {
            button.onclick = (e) => handleDeleteGame(parseInt(e.currentTarget.dataset.gameId));
        });

        // Event listener para el Modal de Detalles (logros)
        const gameDetailModal = document.getElementById('gameDetailModal');
        if (gameDetailModal) {
            gameDetailModal.addEventListener('show.bs.modal', event => {
                const button = event.relatedTarget;
                const card = button.closest('.game-card');
                const gameId = parseInt(card.dataset.gameId);
                const currentUser = AuthService.getCurrentUser();
                let gameDataFromService = null;

                if (currentUser) {
                    const userGames = GameService.getUserGames(currentUser.username);
                    gameDataFromService = userGames.find(g => g.id === gameId);
                }

                const title = card.dataset.gameTitle;
                const description = card.dataset.gameDescription;
                const platform = card.dataset.gamePlatform;
                const genre = card.dataset.gameGenre;
                const hours = card.dataset.gameHours;
                const image = card.dataset.gameImage;
                
                const achievements = gameDataFromService && gameDataFromService.achievements
                                     ? gameDataFromService.achievements
                                     : (card.dataset.gameAchievements ? JSON.parse(card.dataset.gameAchievements) : [{ name: "Completar Nivel 1", completed: false },{ name: "Derrotar Primer Jefe", completed: false }]);
                
                gameDetailModal.querySelector('#modal-game-image').src = image;
                gameDetailModal.querySelector('#modal-game-title').textContent = title;
                gameDetailModal.querySelector('#modal-game-platform').textContent = platform;
                gameDetailModal.querySelector('#modal-game-genre').textContent = genre;
                gameDetailModal.querySelector('#modal-game-description').textContent = description;
                gameDetailModal.querySelector('#modal-game-hours').textContent = hours;

                const achievementsListDiv = gameDetailModal.querySelector('#modal-game-achievements-list');
                
                if (achievements.length > 0) {
                    achievementsListDiv.innerHTML = achievements.map((ach, index) => `
                        <div class="form-check text-light mb-2">
                            <input class="form-check-input achievement-checkbox" type="checkbox" value="" id="modal-achievement-${gameId}-${index}" ${ach.completed ? 'checked' : ''} data-game-id="${gameId}" data-achievement-index="${index}">
                            <label class="form-check-label ${ach.completed ? 'text-decoration-line-through' : ''}" for="modal-achievement-${gameId}-${index}">
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

                            const modalGameId = parseInt(e.target.dataset.gameId);
                            const achIndex = parseInt(e.target.dataset.achievementIndex);
                            const isCompleted = e.target.checked;

                            const userGames = GameService.getUserGames(currentUser.username);
                            const gameToUpdate = userGames.find(g => g.id === modalGameId);

                            if (gameToUpdate && gameToUpdate.achievements && gameToUpdate.achievements[achIndex]) {
                                gameToUpdate.achievements[achIndex].completed = isCompleted;
                                GameService.updateGame(currentUser.username, gameToUpdate);
                                const label = e.target.nextElementSibling;
                                if (isCompleted) {
                                    label.classList.add('text-decoration-line-through');
                                } else {
                                    label.classList.remove('text-decoration-line-through');
                                }
                            }
                        });
                    });

                } else {
                    achievementsListDiv.innerHTML = '<p class="text-ligth">No hay logros disponibles para este juego.</p>';
                }
            });
        }
    }
    
    // Event Listeners para los filtros
    searchInput.addEventListener('keyup', filterAndRenderGames);
    statusFilter.addEventListener('change', filterAndRenderGames);
    favoriteFilter.addEventListener('change', filterAndRenderGames);

    updateAuthUI();
});
