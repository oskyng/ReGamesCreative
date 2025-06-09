const USER_GAMES_KEY = 'my_game_library_userGames';

const GameService = {
    // Obtener todos los juegos para un usuario específico
    getUserGames: (username) => {
        const allUserGames = JSON.parse(localStorage.getItem(USER_GAMES_KEY) || '{}');
        return allUserGames[username] || [];
    },

    // Guardar todos los juegos para un usuario específico
    _saveUserGames: (username, games) => {
        const allUserGames = JSON.parse(localStorage.getItem(USER_GAMES_KEY) || '{}');
        allUserGames[username] = games;
        localStorage.setItem(USER_GAMES_KEY, JSON.stringify(allUserGames));
    },

    // Lógica interna para asegurar que un array de logros tenga al menos 2 logros predeterminados
    _ensureMinimumAchievements: (achievementsArray) => {
        let currentAchievements = achievementsArray || [];
        const defaultAchievement1 = { name: "Completar Nivel 1", completed: false };
        const defaultAchievement2 = { name: "Derrotar Primer Jefe", completed: false };

        const existingNames = new Set(currentAchievements.map(a => a.name));

        if (!existingNames.has(defaultAchievement1.name)) {
            currentAchievements.push(defaultAchievement1);
        }
        if (!existingNames.has(defaultAchievement2.name)) {
            currentAchievements.push(defaultAchievement2);
        }

        return currentAchievements;
    },

    // Añadir un nuevo juego a la biblioteca de un usuario
    // Devuelve un objeto con éxito/fallo y un mensaje
    addGame: (username, gameData) => {
        const userGames = GameService.getUserGames(username);

        // Convertir el ID de string a número si viene de dataset
        const newGameId = parseInt(gameData.id) || Date.now();

        // Verificar si el juego ya existe en la biblioteca del usuario (por título y plataforma)
        const alreadyExists = userGames.some(game =>
            game.title === gameData.title && game.platform === gameData.platform
        );

        if (alreadyExists) {
            return { success: false, message: 'El juego ya está en tu biblioteca.', game: null };
        }

        let gameAchievements = gameData.achievements || [];
        if (gameAchievements.length < 2) {
            const defaultAchievement1 = { name: "Completar Nivel 1", completed: false };
            const defaultAchievement2 = { name: "Derrotar Primer Jefe", completed: false };
            
            if (gameAchievements.length === 0) {
                gameAchievements = [defaultAchievement1, defaultAchievement2];
            } else if (gameAchievements.length === 1) {
                gameAchievements.push(defaultAchievement2);
            }
            const existingNames = new Set(gameAchievements.map(a => a.name));
            if (!existingNames.has(defaultAchievement1.name)) gameAchievements.push(defaultAchievement1);
            if (!existingNames.has(defaultAchievement2.name)) gameAchievements.push(defaultAchievement2);
            
            gameAchievements = gameAchievements.slice(0, 2);
        }

        const newGame = {
            id: newGameId,
            title: gameData.title,
            description: gameData.description || '',
            platform: gameData.platform,
            genre: gameData.genre,
            hoursPlayed: gameData.hoursPlayed || 0,
            image: gameData.image || 'https://placehold.co/400x250/374151/D1D5DB?text=No+Image',
            isFavorite: false, // Por defecto no es favorito
            played: false, // Por defecto no jugado
            achievements: gameData.achievements || [] // Lista de logros
        };
        userGames.push(newGame);
        GameService._saveUserGames(username, userGames);
        return { success: true, message: `"${newGame.title}" añadido correctamente.`, game: newGame };
    },

    // Actualizar un juego existente en la biblioteca de un usuario
    updateGame: (username, updatedGame) => {
        let userGames = GameService.getUserGames(username);
        userGames = userGames.map(game =>
            game.id === updatedGame.id ? { ...game, ...updatedGame } : game
        );
        GameService._saveUserGames(username, userGames);
    },

    // Eliminar un juego de la biblioteca de un usuario
    deleteGame: (username, gameId) => {
        let userGames = GameService.getUserGames(username);
        userGames = userGames.filter(game => game.id !== gameId);
        GameService._saveUserGames(username, userGames);
    }
};

// Exportar GameService para que esté disponible globalmente
window.GameService = GameService;