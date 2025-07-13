/**
 * AuthService - Servicio para manejo de autenticación
 * Maneja login, logout, tokens y gestión de sesión
 */
class AuthService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.endpoints = {
            login: '/api/v1/auth/login',
            logout: '/api/v1/auth/logout',
            refresh: '/api/v1/auth/refresh'
        };
        
        // Claves para localStorage
        this.tokenKeys = {
            access: 'access_token',
            refresh: 'refresh_token',
            user: 'user_data',
            expires: 'token_expires'
        };
    }

    /**
     * Realizar login
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @param {boolean} rememberMe - Si debe recordar la sesión
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async login(email, password, rememberMe = false) {
        try {
            console.log('🔐 Iniciando proceso de login...');
            
            const response = await fetch(`${this.baseURL}${this.endpoints.login}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Error en login:', data);
                throw new Error(data.message || 'Error en el inicio de sesión');
            }

            console.log('✅ Login exitoso');
            
            // Guardar tokens y datos del usuario
            this.saveAuthData(data, rememberMe);
            
            return {
                success: true,
                data: data,
                user: data.user
            };

        } catch (error) {
            console.error('❌ Error en AuthService.login:', error);
            
            // Manejar diferentes tipos de errores
            if (error.message.includes('fetch')) {
                throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
            }
            
            throw error;
        }
    }

    /**
     * Realizar logout
     */
    async logout() {
        try {
            console.log('🚪 Cerrando sesión...');
            
            const accessToken = this.getAccessToken();
            
            if (accessToken) {
                try {
                    await fetch(`${this.baseURL}${this.endpoints.logout}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.warn('⚠️ Error al hacer logout en servidor:', error);
                    // Continuar con logout local aunque falle el servidor
                }
            }
            
            // Limpiar datos locales
            this.clearAuthData();
            
            console.log('✅ Sesión cerrada correctamente');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error en logout:', error);
            // Aunque falle, limpiar datos locales
            this.clearAuthData();
            throw error;
        }
    }

    /**
     * Refrescar token de acceso
     */
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.refresh}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            this.saveAuthData(data, true);
            
            return data;
            
        } catch (error) {
            console.error('❌ Error refreshing token:', error);
            this.clearAuthData();
            throw error;
        }
    }

    /**
     * Guardar datos de autenticación
     * @param {Object} authData - Datos de autenticación del servidor
     * @param {boolean} rememberMe - Si debe persistir la sesión
     */
    saveAuthData(authData, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        try {
            // Guardar tokens
            if (authData.access_token) {
                storage.setItem(this.tokenKeys.access, authData.access_token);
            }
            
            if (authData.refresh_token) {
                storage.setItem(this.tokenKeys.refresh, authData.refresh_token);
            }
            
            // Guardar datos del usuario
            if (authData.user) {
                storage.setItem(this.tokenKeys.user, JSON.stringify(authData.user));
            }
            
            // Calcular fecha de expiración
            if (authData.expires_in) {
                const expiresAt = new Date().getTime() + (authData.expires_in * 1000);
                storage.setItem(this.tokenKeys.expires, expiresAt.toString());
            }
            
            console.log('💾 Datos de autenticación guardados');
            
        } catch (error) {
            console.error('❌ Error guardando datos de auth:', error);
        }
    }

    /**
     * Limpiar todos los datos de autenticación
     */
    clearAuthData() {
        // Limpiar de ambos storages
        [localStorage, sessionStorage].forEach(storage => {
            Object.values(this.tokenKeys).forEach(key => {
                storage.removeItem(key);
            });
        });
        
        console.log('🗑️ Datos de autenticación limpiados');
    }

    /**
     * Obtener token de acceso
     * @returns {string|null} Token de acceso
     */
    getAccessToken() {
        return localStorage.getItem(this.tokenKeys.access) || 
               sessionStorage.getItem(this.tokenKeys.access);
    }

    /**
     * Obtener token de refresh
     * @returns {string|null} Token de refresh
     */
    getRefreshToken() {
        return localStorage.getItem(this.tokenKeys.refresh) || 
               sessionStorage.getItem(this.tokenKeys.refresh);
    }

    /**
     * Obtener datos del usuario actual
     * @returns {Object|null} Datos del usuario
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem(this.tokenKeys.user) || 
                           sessionStorage.getItem(this.tokenKeys.user);
            
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Verificar si el usuario está autenticado
     * @returns {boolean} True si está autenticado
     */
    isAuthenticated() {
        const token = this.getAccessToken();
        const expiresAt = localStorage.getItem(this.tokenKeys.expires) || 
                         sessionStorage.getItem(this.tokenKeys.expires);
        
        if (!token) {
            return false;
        }
        
        // Verificar si el token ha expirado
        if (expiresAt) {
            const now = new Date().getTime();
            const expiry = parseInt(expiresAt);
            
            if (now >= expiry) {
                console.warn('⚠️ Token expirado');
                this.clearAuthData();
                return false;
            }
        }
        
        return true;
    }

    /**
     * Obtener headers de autorización para requests
     * @returns {Object} Headers con token de autorización
     */
    getAuthHeaders() {
        const token = this.getAccessToken();
        
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Realizar request autenticado
     * @param {string} url - URL del endpoint
     * @param {Object} options - Opciones del fetch
     * @returns {Promise<Response>} Respuesta del servidor
     */
    async authenticatedRequest(url, options = {}) {
        const headers = {
            ...this.getAuthHeaders(),
            ...(options.headers || {})
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Si es 401, intentar refresh del token
            if (response.status === 401) {
                try {
                    await this.refreshToken();
                    
                    // Reintentar request con nuevo token
                    const newHeaders = {
                        ...this.getAuthHeaders(),
                        ...(options.headers || {})
                    };
                    
                    return await fetch(url, {
                        ...options,
                        headers: newHeaders
                    });
                    
                } catch (refreshError) {
                    console.error('❌ Error refreshing token:', refreshError);
                    this.clearAuthData();
                    // Redirigir al login
                    window.location.href = '/index.html';
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }
            }

            return response;
            
        } catch (error) {
            console.error('❌ Error en authenticated request:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.AuthService = AuthService;
