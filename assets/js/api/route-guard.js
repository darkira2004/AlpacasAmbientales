/**
 * RouteGuard - Protección de rutas y manejo de autenticación
 * Maneja la protección de páginas que requieren autenticación
 */
class RouteGuard {
    constructor(loginUrl = '../index.html') {
        this.authService = new AuthService();
        this.loginUrl = loginUrl;
        this.isProtectedPage = true;
    }

    /**
     * Verificar si el usuario está autenticado
     * Redirige al login si no lo está
     */
    checkAuth() {
        console.log('🔐 Verificando autenticación...');
        
        if (!this.authService.isAuthenticated()) {
            console.log('❌ Usuario no autenticado, redirigiendo al login...');
            this.redirectToLogin();
            return false;
        }
        
        console.log('✅ Usuario autenticado');
        return true;
    }

    /**
     * Proteger la página actual
     * Debe llamarse en cada página protegida
     */
    protect() {
        // Verificar autenticación inmediatamente
        if (!this.checkAuth()) {
            return;
        }
        
        // Configurar interceptores para futuras peticiones
        this.setupTokenInterceptor();
        
        // Verificar periódicamente el estado del token
        this.startTokenMonitoring();
    }

    /**
     * Configurar interceptor de tokens para peticiones HTTP
     */
    setupTokenInterceptor() {
        // Interceptar fetch para agregar tokens automáticamente
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            // Solo agregar token si es una petición a la API
            if (url.includes(this.authService.baseURL)) {
                const authHeaders = this.authService.getAuthHeaders();
                options.headers = {
                    ...authHeaders,
                    ...(options.headers || {})
                };
            }
            
            try {
                const response = await originalFetch(url, options);
                
                // Si es 401, intentar refresh automático
                if (response.status === 401 && url.includes(this.authService.baseURL)) {
                    console.log('🔄 Token expirado, intentando refresh...');
                    
                    try {
                        await this.authService.refreshToken();
                        
                        // Reintentar la petición original
                        const newAuthHeaders = this.authService.getAuthHeaders();
                        options.headers = {
                            ...newAuthHeaders,
                            ...(options.headers || {})
                        };
                        
                        return await originalFetch(url, options);
                        
                    } catch (refreshError) {
                        console.error('❌ Error en refresh de token:', refreshError);
                        this.handleAuthError();
                        throw new Error('Sesión expirada');
                    }
                }
                
                return response;
                
            } catch (error) {
                console.error('❌ Error en petición interceptada:', error);
                throw error;
            }
        };
    }

    /**
     * Monitorear el estado del token periódicamente
     */
    startTokenMonitoring() {
        // Verificar cada 5 minutos
        setInterval(() => {
            if (!this.authService.isAuthenticated()) {
                console.log('⚠️ Token expirado detectado en monitoreo');
                this.handleAuthError();
            }
        }, 5 * 60 * 1000); // 5 minutos
    }

    /**
     * Manejar errores de autenticación
     */
    handleAuthError() {
        console.log('🚨 Error de autenticación detectado');
        
        // Limpiar datos de sesión
        this.authService.clearAuthData();
        
        // Mostrar mensaje si existe sistema de toast/alert
        if (typeof window.showToast === 'function') {
            window.showToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
        }
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
            this.redirectToLogin();
        }, 1000);
    }

    /**
     * Redirigir al login
     */
    redirectToLogin() {
        console.log('🏠 Redirigiendo al login...');
        window.location.href = this.loginUrl;
    }

    /**
     * Realizar logout
     */
    async logout() {
        try {
            console.log('🚪 Iniciando logout...');
            
            // Intentar logout en el servidor
            await this.authService.logout();
            
            // Mostrar mensaje de éxito
            if (typeof window.showToast === 'function') {
                window.showToast('Sesión cerrada correctamente', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error en logout:', error);
            
            // Limpiar datos localmente aunque falle el servidor
            this.authService.clearAuthData();
        } finally {
            // Siempre redirigir al login
            setTimeout(() => {
                this.redirectToLogin();
            }, 500);
        }
    }

    /**
     * Obtener información del usuario actual
     * @returns {Object|null} Datos del usuario
     */
    getCurrentUser() {
        return this.authService.getCurrentUser();
    }

    /**
     * Verificar si el usuario tiene un rol específico
     * @param {string} requiredRole - Rol requerido
     * @returns {boolean} True si tiene el rol
     */
    hasRole(requiredRole) {
        const user = this.getCurrentUser();
        
        if (!user || !user.role) {
            return false;
        }
        
        // Si es array de roles
        if (Array.isArray(user.role)) {
            return user.role.includes(requiredRole);
        }
        
        // Si es string simple
        return user.role === requiredRole;
    }

    /**
     * Verificar si el usuario tiene alguno de los roles especificados
     * @param {Array<string>} roles - Array de roles permitidos
     * @returns {boolean} True si tiene alguno de los roles
     */
    hasAnyRole(roles) {
        return roles.some(role => this.hasRole(role));
    }

    /**
     * Proteger una función/acción específica por rol
     * @param {string|Array<string>} allowedRoles - Rol(es) permitidos
     * @param {Function} action - Función a ejecutar si tiene permisos
     * @param {Function} onDenied - Función a ejecutar si no tiene permisos
     */
    protectAction(allowedRoles, action, onDenied = null) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        if (this.hasAnyRole(roles)) {
            return action();
        } else {
            console.warn('⚠️ Acceso denegado. Roles requeridos:', roles);
            
            if (onDenied) {
                return onDenied();
            } else if (typeof window.showToast === 'function') {
                window.showToast('No tienes permisos para realizar esta acción', 'warning');
            }
        }
    }
}

// Exportar para uso global
window.RouteGuard = RouteGuard;

// Auto-proteger página si se incluye el script
// Solo en páginas que no sean login
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de login
    const isLoginPage = window.location.pathname.includes('index.html') || 
                       window.location.pathname === '/' ||
                       document.getElementById('login-form');
    
    if (!isLoginPage) {
        console.log('🛡️ Inicializando protección de ruta...');
        const routeGuard = new RouteGuard('../../index.html');
        window.routeGuard = routeGuard;
        routeGuard.protect();
    }
});
