const AUTH_STORAGE_KEY = 'my_game_library_users';
const CURRENT_USER_KEY = 'my_game_library_currentUser';

const AuthService = {
    // Inicializa algunos usuarios de prueba
    init: () => {
        if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([
                {
                    fullName: "Oscar Sanzana",
                    username: 'admin',
                    email: "oscar.sanzana.97@gmail.com",
                    birthDay: "",
                    password: 'Admin123!',
                    role: 'admin'
                }
            ]));
        }
    },

    // Obtener usuario actual
    getCurrentUser: () => {
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Iniciar sesión
    login: (username, password) => {
        console.log(username, password)
        const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Nombre de usuario o contraseña incorrectos.' };
    },

    // Registrar usuario
    register: (newUser) => {
        const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
        if (users.some(u => u.username === newUser.username)) {
            return { success: false, message: 'El nombre de usuario ya existe.' };
        }
        users.push(newUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
        // No loguear automáticamente aquí, la página de registro redirige al login
        return { success: true, message: 'Registro exitoso. ¡Ahora puedes iniciar sesión!' };
    },

    // Función para actualizar la contrasena de un usuario
    updatePassword: (userEmail, newPassword) => {
        let users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
        const userIndex = users.findIndex(u => u.email === userEmail);

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        users[userIndex].password = newPassword;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.username === username) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        }

        return { success: true, message: 'Contraseña actualizada correctamente. Redirigiendo a Login...' };
    },

    // Función para actualizar el perfil de un usuario
    updateProfile: (originalUsername, newData) => {
        let users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
        const userIndex = users.findIndex(u => u.username === originalUsername);

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        // Si el nuevo nombre de usuario es diferente y ya existe
        if (newData.username && newData.username !== originalUsername && users.some(u => u.username === newData.username)) {
            return { success: false, message: 'El nuevo nombre de usuario ya está en uso.' };
        }

        users[userIndex] = { ...users[userIndex], ...newData };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.username === originalUsername) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        }

        return { success: true, message: 'Perfil actualizado correctamente.' };
    },

    // Cerrar sesión
    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
};

// Exportar AuthService para que esté disponible globalmente
window.AuthService = AuthService;