/**
 * LoginController - Controlador para la página de login
 * Maneja la UI de login, validación de formularios y autenticación
 */
class LoginController {
    constructor() {
        this.authService = new AuthService();
        this.form = null;
        this.emailInput = null;
        this.passwordInput = null;
        this.rememberMeCheckbox = null;
        this.submitButton = null;
        this.loadingOverlay = null;
        this.alertContainer = null;
        
        // Estado del controlador
        this.isLoading = false;
        this.isInitialized = false;
    }

    /**
     * Inicializar el controlador
     */
    init() {
        console.log('🔐 Inicializando LoginController...');
        
        try {
            // Verificar si ya está autenticado
            if (this.authService.isAuthenticated()) {
                console.log('✅ Usuario ya autenticado, redirigiendo...');
                this.redirectToDashboard();
                return;
            }
            
            // Buscar elementos del DOM
            this.findDOMElements();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Configurar validación en tiempo real
            this.setupRealTimeValidation();
            
            // Focus en el campo email
            if (this.emailInput) {
                this.emailInput.focus();
            }
            
            this.isInitialized = true;
            console.log('✅ LoginController inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar LoginController:', error);
            this.showAlert('Error al cargar la página. Por favor, recarga el navegador.', 'danger');
        }
    }

    /**
     * Buscar y almacenar referencias a elementos del DOM
     */
    findDOMElements() {
        this.form = document.getElementById('login-form');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.rememberMeCheckbox = document.getElementById('remember-me');
        this.submitButton = document.getElementById('login-btn');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.alertContainer = document.getElementById('alert-container');
        this.passwordToggleBtn = document.getElementById('toggle-password');
        this.passwordIcon = document.getElementById('password-icon');
        
        // Verificar elementos críticos
        if (!this.form) throw new Error('Formulario de login no encontrado');
        if (!this.emailInput) throw new Error('Campo email no encontrado');
        if (!this.passwordInput) throw new Error('Campo password no encontrado');
        if (!this.submitButton) throw new Error('Botón de submit no encontrado');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Submit del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Enter en los campos
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.isLoading) {
                    this.handleLogin();
                }
            });
        });
        
        // Limpiar errores al escribir
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
        
        // Toggle de mostrar/ocultar contraseña
        if (this.passwordToggleBtn) {
            this.passwordToggleBtn.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }
    }

    /**
     * Configurar validación en tiempo real
     */
    setupRealTimeValidation() {
        // Validación del email
        this.emailInput.addEventListener('blur', () => {
            this.validateEmail();
        });
        
        // Validación de la contraseña
        this.passwordInput.addEventListener('blur', () => {
            this.validatePassword();
        });
    }

    /**
     * Manejar el proceso de login
     */
    async handleLogin() {
        if (this.isLoading) return;
        
        try {
            console.log('🔄 Iniciando proceso de login...');
            
            // Validar formulario
            if (!this.validateForm()) {
                return;
            }
            
            // Mostrar loading
            this.setLoading(true);
            this.clearAlert();
            
            // Obtener datos del formulario
            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value;
            const rememberMe = this.rememberMeCheckbox.checked;
            
            // Realizar login
            const result = await this.authService.login(email, password, rememberMe);
            
            if (result.success) {
                console.log('✅ Login exitoso');
                this.showAlert('¡Bienvenido! Redirigiendo...', 'success');
                
                // Pequeño delay para mostrar el mensaje de éxito
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            } else {
                throw new Error('Login fallido');
            }
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.handleLoginError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Manejar errores de login
     * @param {Error} error - Error ocurrido
     */
    handleLoginError(error) {
        let message = 'Error al iniciar sesión. Inténtalo nuevamente.';
        
        // Mensajes específicos según el tipo de error
        if (error.message.includes('email') || error.message.includes('password')) {
            message = 'Email o contraseña incorrectos.';
        } else if (error.message.includes('conexión') || error.message.includes('servidor')) {
            message = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else if (error.message.includes('Incorrect email or password')) {
            message = 'Email o contraseña incorrectos.';
        }
        
        this.showAlert(message, 'danger');
        
        // Focus en el campo email para reintentar
        this.emailInput.focus();
        this.emailInput.select();
    }

    /**
     * Validar todo el formulario
     * @returns {boolean} True si es válido
     */
    validateForm() {
        let isValid = true;
        
        // Validar email
        if (!this.validateEmail()) {
            isValid = false;
        }
        
        // Validar contraseña
        if (!this.validatePassword()) {
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Validar campo email
     * @returns {boolean} True si es válido
     */
    validateEmail() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.setFieldError(this.emailInput, 'El email es requerido.');
            return false;
        }
        
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.setFieldError(this.emailInput, 'Ingresa un email válido.');
            return false;
        }
        
        this.clearFieldError(this.emailInput);
        return true;
    }

    /**
     * Validar campo contraseña
     * @returns {boolean} True si es válido
     */
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.setFieldError(this.passwordInput, 'La contraseña es requerida.');
            return false;
        }
        
        if (password.length < 3) {
            this.setFieldError(this.passwordInput, 'La contraseña debe tener al menos 3 caracteres.');
            return false;
        }
        
        this.clearFieldError(this.passwordInput);
        return true;
    }

    /**
     * Establecer error en un campo
     * @param {HTMLElement} field - Campo del formulario
     * @param {string} message - Mensaje de error
     */
    setFieldError(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        const feedback = field.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = message;
        }
    }

    /**
     * Limpiar error de un campo
     * @param {HTMLElement} field - Campo del formulario
     */
    clearFieldError(field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        
        const feedback = field.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = '';
        }
    }

    /**
     * Mostrar/ocultar estado de carga
     * @param {boolean} loading - Si debe mostrar loading
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...';
            
            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = 'flex';
            }
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión';
            
            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = 'none';
            }
        }
    }

    /**
     * Mostrar alerta
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de alerta (success, danger, warning, info)
     */
    showAlert(message, type = 'info') {
        if (!this.alertContainer) return;
        
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <div class="d-flex">
                    <div>
                        ${type === 'danger' ? '<i class="fas fa-exclamation-circle me-2"></i>' : ''}
                        ${type === 'success' ? '<i class="fas fa-check-circle me-2"></i>' : ''}
                        ${type === 'warning' ? '<i class="fas fa-exclamation-triangle me-2"></i>' : ''}
                        ${type === 'info' ? '<i class="fas fa-info-circle me-2"></i>' : ''}
                        ${message}
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        this.alertContainer.innerHTML = alertHtml;
        
        // Auto-ocultar después de 5 segundos (excepto errores)
        if (type !== 'danger') {
            setTimeout(() => {
                this.clearAlert();
            }, 5000);
        }
    }

    /**
     * Limpiar alertas
     */
    clearAlert() {
        if (this.alertContainer) {
            this.alertContainer.innerHTML = '';
        }
    }

    /**
     * Alternar visibilidad de la contraseña
     */
    togglePasswordVisibility() {
        if (!this.passwordInput || !this.passwordIcon) return;
        
        const isPassword = this.passwordInput.type === 'password';
        
        if (isPassword) {
            // Mostrar contraseña
            this.passwordInput.type = 'text';
            this.passwordIcon.className = 'fas fa-eye-slash';
            this.passwordToggleBtn.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
            // Ocultar contraseña
            this.passwordInput.type = 'password';
            this.passwordIcon.className = 'fas fa-eye';
            this.passwordToggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
        }
    }

    /**
     * Redirigir al dashboard
     */
    redirectToDashboard() {
        console.log('🏠 Redirigiendo al dashboard...');
        window.location.href = 'pages/Dashboard.html';
    }
}

// Exportar para uso global
window.LoginController = LoginController;
