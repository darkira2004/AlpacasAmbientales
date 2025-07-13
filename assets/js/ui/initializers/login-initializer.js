/**
 * Login Initializer - Inicializador específico para la página de login
 * Maneja la inicialización completa del sistema de autenticación
 */
class LoginInitializer {
    constructor() {
        this.loginController = null;
        this.isInitialized = false;
    }

    /**
     * Inicializar el sistema de login
     */
    async init() {
        try {
            console.log('🔐 Iniciando sistema de login...');
            
            // Verificar si ya está autenticado
            if (this.checkExistingAuth()) {
                return;
            }
            
            // Inicializar controlador de login
            await this.initializeLoginController();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Aplicar configuraciones específicas del login
            this.applyLoginConfiguration();
            
            this.isInitialized = true;
            console.log('✅ Sistema de login inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar sistema de login:', error);
            this.showError('Error al cargar la página de login. Por favor, recarga el navegador.');
        }
    }

    /**
     * Verificar si el usuario ya está autenticado
     */
    checkExistingAuth() {
        const authService = new AuthService();
        
        if (authService.isAuthenticated()) {
            console.log('✅ Usuario ya autenticado, redirigiendo al dashboard...');
            this.redirectToDashboard();
            return true;
        }
        
        return false;
    }

    /**
     * Inicializar el controlador de login
     */
    async initializeLoginController() {
        console.log('🎮 Inicializando LoginController...');
        
        this.loginController = new LoginController();
        await this.loginController.init();
        
        // Hacer disponible globalmente para debugging
        window.loginController = this.loginController;
        
        console.log('✅ LoginController inicializado');
    }

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Prevenir envío accidental del formulario
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'button') {
                const form = document.getElementById('login-form');
                if (form && document.activeElement && form.contains(document.activeElement)) {
                    e.preventDefault();
                    if (this.loginController && !this.loginController.isLoading) {
                        this.loginController.handleLogin();
                    }
                }
            }
        });

        // Limpiar almacenamiento en caso de errores previos
        this.clearPreviousSession();
        
        // Configurar manejo de errores de red
        this.setupNetworkErrorHandling();
    }

    /**
     * Limpiar sesión previa si existe
     */
    clearPreviousSession() {
        try {
            // Limpiar tokens expirados o inválidos
            const authService = new AuthService();
            const token = authService.getAccessToken();
            
            if (token) {
                // Verificar si el token está realmente válido
                const tokenData = this.parseJWT(token);
                if (tokenData && tokenData.exp) {
                    const now = Math.floor(Date.now() / 1000);
                    if (tokenData.exp < now) {
                        console.log('🗑️ Limpiando token expirado...');
                        authService.clearAuthData();
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Error al verificar token previo:', error);
        }
    }

    /**
     * Parsear JWT token
     */
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }

    /**
     * Configurar manejo de errores de red
     */
    setupNetworkErrorHandling() {
        // Detectar cuando se pierde la conexión
        window.addEventListener('online', () => {
            console.log('🌐 Conexión restaurada');
            this.hideNetworkError();
        });

        window.addEventListener('offline', () => {
            console.log('📴 Conexión perdida');
            this.showNetworkError();
        });
    }

    /**
     * Aplicar configuraciones específicas del login
     */
    applyLoginConfiguration() {
        // Establecer focus inicial
        setTimeout(() => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.focus();
            }
        }, 100);

        // Configurar título de la página
        document.title = 'Iniciar Sesión - Sistema de Gestión Ambiental';
        
        // Agregar meta tag para no indexar la página de login
        const metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        metaRobots.content = 'noindex, nofollow';
        document.head.appendChild(metaRobots);
    }

    /**
     * Mostrar error de red
     */
    showNetworkError() {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-wifi me-2"></i>
                    Sin conexión a internet. Verifica tu conexión.
                </div>
            `;
        }
    }

    /**
     * Ocultar error de red
     */
    hideNetworkError() {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            const networkAlert = alertContainer.querySelector('.alert-warning');
            if (networkAlert && networkAlert.textContent.includes('Sin conexión')) {
                networkAlert.remove();
            }
        }
    }

    /**
     * Mostrar error general
     */
    showError(message) {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    ${message}
                </div>
            `;
        }
    }

    /**
     * Redirigir al dashboard
     */
    redirectToDashboard() {
        console.log('🏠 Redirigiendo al dashboard...');
        window.location.href = 'pages/Dashboard.html';
    }

    /**
     * Destruir inicializador (cleanup)
     */
    destroy() {
        if (this.loginController) {
            // Cleanup del controlador si tiene método destroy
            if (typeof this.loginController.destroy === 'function') {
                this.loginController.destroy();
            }
            this.loginController = null;
        }
        
        this.isInitialized = false;
        console.log('🗑️ LoginInitializer destruido');
    }
}

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 DOM listo, inicializando login...');
    
    const loginInitializer = new LoginInitializer();
    window.loginInitializer = loginInitializer; // Para debugging
    
    await loginInitializer.init();
});

// Exportar para uso global
window.LoginInitializer = LoginInitializer;
