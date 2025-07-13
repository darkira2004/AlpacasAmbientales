/**
 * API Configuration - Configuración global para las APIs
 */
window.CONFIG = {
    // URL base del backend
    API_BASE_URL: 'http://localhost:8000',
    
    // Versión de la API
    API_VERSION: 'v1',
    
    // Endpoints principales
    ENDPOINTS: {
        ADMIN_DASHBOARD: '/api/v1/admin/dashboard',
        AUTH_LOGIN: '/api/v1/auth/login',
        AUTH_LOGOUT: '/api/v1/auth/logout',
        AUTH_REFRESH: '/api/v1/auth/refresh'
    },
    
    // Headers por defecto
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Timeout para requests (en milisegundos)
    TIMEOUT: 30000,
    
    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'access_token',
        REFRESH_TOKEN_KEY: 'refresh_token',
        USER_KEY: 'user_data',
        EXPIRES_KEY: 'token_expires'
    }
};

// Mantener compatibilidad con código existente
window.API_CONFIG = window.CONFIG;
