// Controlador para manejar el perfil del usuario
class ProfileController {
    constructor() {
        // Inicializar ProfileService de forma segura
        this.profileService = window.ProfileService || new ProfileService();
        this.profileImageElement = null;
        this.userDisplayElement = null;
        this.currentUserId = null;
        this.imageCache = new Map(); // Cache para las imágenes
        
        // Elementos del modal de perfil (se inicializarán después)
        this.profileModal = null;
        this.profileContainer = null;
        
        // Inicializar de forma asíncrona sin bloquear el constructor
        this.init().catch(error => {
            console.warn('⚠️ Error en inicialización automática de ProfileController:', error);
        });
    }

    /**
     * Inicializa el controlador del perfil
     */
    async init() {
        console.log('🎯 Inicializando ProfileController...');
        
        try {
            // Buscar elementos del perfil en el DOM
            this.findProfileElements();
            
            // Cargar información del usuario
            await this.loadUserProfile();
            
            // Configurar modal cuando el DOM esté completamente cargado
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupModalElements();
                });
            } else {
                // El DOM ya está cargado
                setTimeout(() => {
                    this.setupModalElements();
                }, 100);
            }
            
            console.log('✅ ProfileController inicializado');
        } catch (error) {
            console.warn('⚠️ Error durante inicialización del ProfileController:', error);
            // No lanzar el error para no bloquear la aplicación
        }
    }

    /**
     * Busca los elementos del perfil en el DOM
     */
    findProfileElements() {
        // Buscar imagen de perfil (puede tener diferentes IDs o clases)
        this.profileImageElement = document.getElementById('profile-image') ||
                                 document.querySelector('.profile-image') ||
                                 document.querySelector('[data-profile="image"]');
        
        // Buscar elemento de display del usuario
        this.userDisplayElement = document.getElementById('user-display') ||
                                document.querySelector('.user-display') ||
                                document.querySelector('[data-profile="name"]');

        console.log('🔍 Elementos encontrados:', {
            profileImage: !!this.profileImageElement,
            userDisplay: !!this.userDisplayElement
        });
    }

    /**
     * Carga el perfil completo del usuario
     */
    async loadUserProfile() {
        try {
            // Obtener ID del usuario de sessionStorage
            this.currentUserId = sessionStorage.getItem("userId");
            
            if (!this.currentUserId) {
                console.warn('⚠️ No se encontró ID de usuario en sessionStorage');
                this.setDefaultProfile();
                return;
            }

            console.log(`👤 Cargando perfil para usuario ${this.currentUserId}`);

            // Cargar nombre del usuario INMEDIATAMENTE (no depende de API)
            this.updateUserName();

            // Cargar foto de perfil EN PARALELO (no bloquea)
            // NO usar await aquí para que sea completamente independiente
            this.loadProfileImage().catch(error => {
                console.warn('⚠️ Error cargando imagen de perfil (no crítico):', error);
                this.setDefaultProfileImage();
            });

            console.log('✅ Perfil básico cargado (imagen en segundo plano)');

        } catch (error) {
            console.error('❌ Error al cargar perfil:', error);
            this.setDefaultProfile();
        }
    }    /**
     * Actualiza el nombre del usuario en la interfaz
     */
    updateUserName() {
        if (!this.userDisplayElement) {
            return;
        }

        const fullName = sessionStorage.getItem("userFullName");
        const firstName = sessionStorage.getItem("firstName");
        const lastName = sessionStorage.getItem("lastName");
        const documentValue = sessionStorage.getItem("documentValue");

        let displayName = "Admin";

        // Prioridad 1: Nombre completo
        if (fullName && fullName.trim() !== "") {
            displayName = fullName.trim();
        }
        // Prioridad 2: Nombre y apellido por separado
        else if (firstName || lastName) {
            displayName = `${firstName || ""} ${lastName || ""}`.trim() || "Admin";
        }
        // Prioridad 3: Documento
        else if (documentValue) {
            displayName = `Doc. ${documentValue}`;
        }

        this.userDisplayElement.textContent = displayName;
        console.log(`📝 Nombre actualizado: ${displayName}`);
    }

    /**
     * Carga la imagen de perfil del usuario
     */
    async loadProfileImage() {
        if (!this.profileImageElement || !this.currentUserId) {
            return;
        }

        try {
            // Verificar si ya está en cache
            if (this.imageCache.has(this.currentUserId)) {
                console.log('📸 Usando imagen desde cache');
                this.setProfileImage(this.imageCache.get(this.currentUserId));
                return;
            }            // Mostrar loading state
            this.setImageLoading(true);

            // Verificar que ProfileService esté disponible
            if (!this.profileService) {
                console.warn('⚠️ ProfileService no disponible, usando imagen por defecto');
                this.setDefaultProfileImage();
                this.setImageLoading(false);
                return;
            }

            // Obtener imagen del servicio
            const base64Image = await this.profileService.getProfilePhoto(this.currentUserId);

            if (base64Image) {
                const imageUrl = this.profileService.base64ToImageUrl(base64Image);
                
                // Guardar en cache
                this.imageCache.set(this.currentUserId, imageUrl);
                
                // Establecer imagen
                this.setProfileImage(imageUrl);
                console.log('✅ Foto de perfil cargada exitosamente');
            } else {
                // No hay foto, usar avatar por defecto
                this.setDefaultProfileImage();
                console.log('📸 Usando avatar por defecto');
            }

        } catch (error) {
            console.error('❌ Error al cargar imagen de perfil:', error);
            this.setDefaultProfileImage();
        } finally {
            this.setImageLoading(false);
        }
    }

    /**
     * Establece la imagen de perfil
     * @param {string} imageUrl - URL de la imagen
     */
    setProfileImage(imageUrl) {
        if (!this.profileImageElement || !imageUrl) {
            return;
        }

        // Si es un elemento img
        if (this.profileImageElement.tagName === 'IMG') {
            this.profileImageElement.src = imageUrl;
            this.profileImageElement.alt = 'Foto de perfil';
        }
        // Si es un div u otro elemento, usar background-image
        else {
            this.profileImageElement.style.backgroundImage = `url(${imageUrl})`;
            this.profileImageElement.style.backgroundSize = 'cover';
            this.profileImageElement.style.backgroundPosition = 'center';
        }

        // Agregar clases de estilo si no las tiene
        this.profileImageElement.classList.add('profile-loaded');
    }    /**
     * Establece la imagen por defecto
     */
    setDefaultProfileImage() {
        try {
            // Verificar que ProfileService esté disponible
            if (!this.profileService) {
                console.warn('⚠️ ProfileService no disponible, usando URL por defecto hardcoded');
                const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzczZDAiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDMyYzAtNS41MjMgNC40NzctMTAgMTAtMTBzMTAgNC40NzcgMTAgMTAiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
                this.setProfileImage(fallbackUrl);
                return;
            }

            // Verificar que el método exista
            if (typeof this.profileService.getDefaultAvatarUrl !== 'function') {
                console.warn('⚠️ Método getDefaultAvatarUrl no disponible en ProfileService');
                const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzczZDAiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDMyYzAtNS41MjMgNC40NzctMTAgMTAtMTBzMTAgNC40NzcgMTAgMTAiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
                this.setProfileImage(fallbackUrl);
                return;
            }

            const defaultUrl = this.profileService.getDefaultAvatarUrl();
            this.setProfileImage(defaultUrl);
        } catch (error) {
            console.error('❌ Error al establecer imagen por defecto:', error);
            // Fallback de emergencia
            const emergencyUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzczZDAiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDMyYzAtNS41MjMgNC40NzctMTAgMTAtMTBzMTAgNC40NzcgMTAgMTAiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
            this.setProfileImage(emergencyUrl);
        }
    }

    /**
     * Establece el perfil por defecto completo
     */
    setDefaultProfile() {
        this.setDefaultProfileImage();
        
        if (this.userDisplayElement) {
            this.userDisplayElement.textContent = 'Admin';
        }
        
        console.log('🎭 Perfil por defecto establecido');
    }

    /**
     * Muestra/oculta el estado de carga de la imagen
     * @param {boolean} isLoading - Si está cargando
     */
    setImageLoading(isLoading) {
        if (!this.profileImageElement) {
            return;
        }

        if (isLoading) {
            this.profileImageElement.classList.add('profile-loading');
            // Agregar un spinner si es necesario
        } else {
            this.profileImageElement.classList.remove('profile-loading');
        }
    }

    /**
     * Refresca el perfil completo
     */
    async refreshProfile() {
        console.log('🔄 Refrescando perfil...');
        
        // Limpiar cache
        this.imageCache.clear();
        
        // Recargar perfil
        await this.loadUserProfile();
    }

    /**
     * Limpia los datos del perfil (para logout)
     */
    clearProfile() {
        console.log('🧹 Limpiando perfil...');
        
        // Limpiar cache
        this.imageCache.clear();
        
        // Establecer perfil por defecto
        this.setDefaultProfile();
        
        // Limpiar ID actual
        this.currentUserId = null;
    }

    /**
     * Actualiza solo el nombre del usuario
     */
    updateUserDisplayOnly() {
        this.updateUserName();
    }

    /**
     * Verifica si hay una imagen de perfil cargada
     * @returns {boolean}
     */
    hasProfileImage() {
        return this.imageCache.has(this.currentUserId);
    }

    /**
     * Obtiene la URL de la imagen actual
     * @returns {string|null}
     */
    getCurrentImageUrl() {
        return this.imageCache.get(this.currentUserId) || null;
    }    /**
     * Configura los elementos del modal de perfil
     */
    setupModalElements() {
        console.log('🔧 Configurando elementos del modal de perfil...');
        
        // Elementos del modal
        this.profileModal = document.getElementById('profile-modal');
        this.profileContainer = document.getElementById('profile-container');
        
        // Elementos del modal de perfil
        this.modalName = document.getElementById('profile-modal-name');
        this.modalAvatar = document.getElementById('profile-modal-avatar');
        this.modalFirstName = document.getElementById('profile-modal-firstname');
        this.modalLastName = document.getElementById('profile-modal-lastname');
        this.modalDocType = document.getElementById('profile-modal-doctype');
        this.modalDocument = document.getElementById('profile-modal-document');
        this.modalArea = document.getElementById('profile-modal-area');
        this.modalPosition = document.getElementById('profile-modal-position');
        this.modalEmail = document.getElementById('profile-modal-email');
        this.modalPhone = document.getElementById('profile-modal-phone');
        
        // Elementos para cambio de foto
        this.changePhotoBtn = document.getElementById('change-photo-btn');
        this.photoInput = document.getElementById('photo-input');
        this.avatarLarge = document.querySelector('.avatar-large');
        
        console.log('📋 Elementos encontrados:', {
            profileModal: !!this.profileModal,
            profileContainer: !!this.profileContainer,
            changePhotoBtn: !!this.changePhotoBtn,
            photoInput: !!this.photoInput
        });
        
        if (!this.profileModal) {
            console.warn('⚠️ Modal de perfil no encontrado en el DOM');
            return;
        }
        
        if (!this.profileContainer) {
            console.warn('⚠️ Contenedor de perfil no encontrado en el DOM');
            return;
        }

        // Event listeners para el modal
        this.setupModalEventListeners();
        
        // Event listeners para cambio de foto
        this.setupPhotoChangeListeners();
        
        // Event listeners para cambio de correo
        this.setupEmailChangeListeners();
        
        // Event listeners para cambio de teléfono
        this.setupPhoneChangeListeners();
        
        // Debug de elementos configurados
        this.debugModalElements();
    }

    /**
     * Configura los event listeners del modal
     */
    setupModalEventListeners() {
        // NO abrir modal automáticamente - se maneja desde topbar-controller
        // Solo el botón "Ver Perfil" del dropdown debe abrir el modal

        // Cerrar modal
        const closeButtons = [
            document.getElementById('close-profile-modal'),
            document.getElementById('profile-modal-close')
        ];

        closeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.hideProfileModal();
                });
            }
        });

        // Cerrar modal al hacer clic fuera de él
        if (this.profileModal) {
            this.profileModal.addEventListener('click', (e) => {
                if (e.target === this.profileModal) {
                    this.hideProfileModal();
                }
            });
        }

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.profileModal && this.profileModal.style.display === 'block') {
                this.hideProfileModal();
            }
        });
    }

    /**
     * Configura los event listeners para cambio de foto
     */
    setupPhotoChangeListeners() {
        console.log('🔧 Configurando listeners para cambio de foto...');
        console.log('📋 Elementos disponibles:', {
            changePhotoBtn: !!this.changePhotoBtn,
            photoInput: !!this.photoInput,
            changePhotoBtnId: this.changePhotoBtn?.id,
            photoInputId: this.photoInput?.id
        });
        
        if (this.changePhotoBtn && this.photoInput) {
            // Botón para abrir selector de archivo
            this.changePhotoBtn.addEventListener('click', (e) => {
                console.log('🖱️ Click en botón cambiar foto');
                e.preventDefault();
                e.stopPropagation();
                this.photoInput.click();
            });

            // Manejar selección de archivo
            this.photoInput.addEventListener('change', (e) => {
                console.log('📁 Archivo seleccionado:', e.target.files[0]?.name);
                const file = e.target.files[0];
                if (file) {
                    this.handlePhotoSelection(file);
                }
            });

            console.log('📸 Event listeners para cambio de foto configurados exitosamente');
        } else {
            console.warn('⚠️ No se pudieron configurar listeners - elementos faltantes');
        }
    }

    /**
     * Inicializa los event listeners para el cambio de correo
     */
    setupEmailChangeListeners() {
        // Verificar que el elemento existe antes de proceder
        if (!this.modalEmail) {
            console.warn('⚠️ Elemento modalEmail no encontrado, saltando configuración de cambio de correo');
            return;
        }

        try {
            // Agregar clase CSS para indicar que es clickeable
            this.modalEmail.classList.add('email-clickable');
            
            // Listener para abrir/cerrar el formulario de cambio de correo
            this.modalEmail.addEventListener('click', () => {
                console.log('📧 Click en email - abriendo formulario de cambio');
                // Crear contenedor si no existe
                if (!this.emailChangeContainer) {
                    this.createEmailChangeContainer();
                }
                // Alternar el modo de cambio
                this.toggleEmailChangeMode();
            });
            
            console.log('✅ Event listeners para cambio de correo configurados');
        } catch (error) {
            console.error('❌ Error al configurar listeners de cambio de correo:', error);
        }
    }

    /**
     * Inicializa los event listeners para el cambio de teléfono
     */
    setupPhoneChangeListeners() {
        // Verificar que el elemento existe antes de proceder
        if (!this.modalPhone) {
            console.warn('⚠️ Elemento modalPhone no encontrado, saltando configuración de cambio de teléfono');
            return;
        }

        try {
            // Agregar clase CSS para indicar que es clickeable
            this.modalPhone.classList.add('phone-clickable');
            
            // Listener para abrir/cerrar el formulario de cambio de teléfono
            this.modalPhone.addEventListener('click', () => {
                console.log('📱 Click en teléfono - abriendo formulario de cambio');
                // Crear contenedor si no existe
                if (!this.phoneChangeContainer) {
                    this.createPhoneChangeContainer();
                }
                // Alternar el modo de cambio
                this.togglePhoneChangeMode();
            });
            
            console.log('✅ Event listeners para cambio de teléfono configurados');
        } catch (error) {
            console.error('❌ Error al configurar listeners de cambio de teléfono:', error);
        }
    }

    /**
     * Crea el contenedor expandible para cambiar correo
     */
    createEmailChangeContainer() {
        if (!this.modalEmail) {
            console.warn('⚠️ modalEmail no disponible para crear contenedor de cambio');
            return;
        }

        const emailInfoItem = this.modalEmail.closest('.info-item');
        if (!emailInfoItem) {
            console.warn('⚠️ No se encontró el info-item parent del correo');
            return;
        }

        try {
            // Crear contenedor expandible si no existe
            let emailChangeContainer = emailInfoItem.querySelector('.email-change-container');
            if (!emailChangeContainer) {
                emailChangeContainer = document.createElement('div');
                emailChangeContainer.className = 'email-change-container';
                emailChangeContainer.style.display = 'none';
                emailChangeContainer.innerHTML = `
                    <div class="email-change-form">
                        <div class="form-group">
                            <label for="new-email-input">Nuevo correo electrónico:</label>
                            <input type="email" id="new-email-input" class="form-input" placeholder="ejemplo@correo.com">
                        </div>
                        <div class="form-actions">
                            <button type="button" id="send-email-code-btn" class="btn-primary">Enviar código</button>
                            <button type="button" id="cancel-email-change-btn" class="btn-secondary">Cancelar</button>
                        </div>
                        <div class="email-status-message" style="display: none;"></div>
                    </div>
                    
                    <div class="email-verify-form" style="display: none;">
                        <div class="verify-info">
                            <p>Se ha enviado un código de verificación a tu nuevo correo electrónico.</p>
                            <p>Por favor, ingresa el código de 6 dígitos:</p>
                        </div>
                        <div class="form-group">
                            <label for="verify-code-input">Código de verificación:</label>
                            <input type="text" id="verify-code-input" class="form-input" placeholder="123456" maxlength="6">
                        </div>
                        <div class="form-actions">
                            <button type="button" id="verify-email-code-btn" class="btn-primary">Verificar código</button>
                            <button type="button" id="cancel-verify-btn" class="btn-secondary">Cancelar</button>
                        </div>
                        <div class="verify-status-message" style="display: none;"></div>
                    </div>
                `;
                
                emailInfoItem.appendChild(emailChangeContainer);
                
                // Configurar event listeners para los botones
                this.setupEmailChangeButtons(emailChangeContainer);
                
                console.log('✅ Contenedor de cambio de correo creado');
            }

            this.emailChangeContainer = emailChangeContainer;
        } catch (error) {
            console.error('❌ Error al crear contenedor de cambio de correo:', error);
        }
    }

    /**
     * Crea el contenedor expandible para cambiar teléfono
     */
    createPhoneChangeContainer() {
        if (!this.modalPhone) {
            console.warn('⚠️ modalPhone no disponible para crear contenedor de cambio');
            return;
        }

        const phoneInfoItem = this.modalPhone.closest('.info-item');
        if (!phoneInfoItem) {
            console.warn('⚠️ No se encontró el info-item parent del teléfono');
            return;
        }

        try {
            // Crear contenedor expandible si no existe
            let phoneChangeContainer = phoneInfoItem.querySelector('.phone-change-container');
            if (!phoneChangeContainer) {
                phoneChangeContainer = document.createElement('div');
                phoneChangeContainer.className = 'phone-change-container';
                phoneChangeContainer.style.display = 'none';
                phoneChangeContainer.innerHTML = `
                    <div class="phone-change-form">
                        <div class="form-group">
                            <label for="new-phone-input">Nuevo número de teléfono:</label>
                            <input type="tel" id="new-phone-input" class="form-input" placeholder="593987654321">
                        </div>
                        <div class="form-actions">
                            <button type="button" id="send-phone-code-btn" class="btn-primary">Enviar código</button>
                            <button type="button" id="cancel-phone-change-btn" class="btn-secondary">Cancelar</button>
                        </div>
                        <div class="phone-status-message" style="display: none;"></div>
                    </div>
                    
                    <div class="phone-verify-form" style="display: none;">
                        <div class="verify-info">
                            <p>Se ha enviado un código de verificación a tu nuevo número de teléfono.</p>
                            <p>Por favor, ingresa el código de 6 dígitos:</p>
                        </div>
                        <div class="form-group">
                            <label for="verify-phone-code-input">Código de verificación:</label>
                            <input type="text" id="verify-phone-code-input" class="form-input" placeholder="123456" maxlength="6">
                        </div>
                        <div class="form-actions">
                            <button type="button" id="verify-phone-code-btn" class="btn-primary">Verificar código</button>
                            <button type="button" id="cancel-phone-verify-btn" class="btn-secondary">Cancelar</button>
                        </div>
                        <div class="verify-phone-status-message" style="display: none;"></div>
                    </div>
                `;
                
                phoneInfoItem.appendChild(phoneChangeContainer);
                
                // Configurar event listeners para los botones
                this.setupPhoneChangeButtons(phoneChangeContainer);
                
                console.log('✅ Contenedor de cambio de teléfono creado');
            }

            this.phoneChangeContainer = phoneChangeContainer;
        } catch (error) {
            console.error('❌ Error al crear contenedor de cambio de teléfono:', error);
        }
    }

    /**
     * Configura los event listeners para los botones de cambio de correo
     */
    setupEmailChangeButtons(container) {
        // Botón enviar código
        const sendCodeBtn = container.querySelector('#send-email-code-btn');
        if (sendCodeBtn) {
            sendCodeBtn.addEventListener('click', () => {
                this.handleSendEmailCode();
            });
        }

        // Botón cancelar cambio
        const cancelBtn = container.querySelector('#cancel-email-change-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.toggleEmailChangeMode(false);
            });
        }

        // Botón verificar código
        const verifyBtn = container.querySelector('#verify-email-code-btn');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => {
                this.handleVerifyEmailCode();
            });
        }

        // Botón cancelar verificación
        const cancelVerifyBtn = container.querySelector('#cancel-verify-btn');
        if (cancelVerifyBtn) {
            cancelVerifyBtn.addEventListener('click', () => {
                this.resetEmailChangeForm();
            });
        }

        // Enter key en input de nuevo correo
        const newEmailInput = container.querySelector('#new-email-input');
        if (newEmailInput) {
            newEmailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendEmailCode();
                }
            });
        }

        // Enter key en input de código
        const verifyCodeInput = container.querySelector('#verify-code-input');
        if (verifyCodeInput) {
            verifyCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleVerifyEmailCode();
                }
            });
        }
    }

    /**
     * Configura los event listeners para los botones de cambio de teléfono
     */
    setupPhoneChangeButtons(container) {
        // Botón enviar código
        const sendCodeBtn = container.querySelector('#send-phone-code-btn');
        if (sendCodeBtn) {
            sendCodeBtn.addEventListener('click', () => {
                this.handleSendPhoneCode();
            });
        }

        // Botón cancelar cambio
        const cancelBtn = container.querySelector('#cancel-phone-change-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.togglePhoneChangeMode(false);
            });
        }

        // Botón verificar código
        const verifyBtn = container.querySelector('#verify-phone-code-btn');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => {
                this.handleVerifyPhoneCode();
            });
        }

        // Botón cancelar verificación
        const cancelVerifyBtn = container.querySelector('#cancel-phone-verify-btn');
        if (cancelVerifyBtn) {
            cancelVerifyBtn.addEventListener('click', () => {
                this.resetPhoneChangeForm();
            });
        }

        // Enter key en input de nuevo teléfono
        const newPhoneInput = container.querySelector('#new-phone-input');
        if (newPhoneInput) {
            newPhoneInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendPhoneCode();
                }
            });
        }

        // Enter key en input de código
        const verifyPhoneCodeInput = container.querySelector('#verify-phone-code-input');
        if (verifyPhoneCodeInput) {
            verifyPhoneCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleVerifyPhoneCode();
                }
            });
        }
    }

    /**
     * Alterna el modo de cambio de correo
     */
    toggleEmailChangeMode(show = null) {
        if (!this.emailChangeContainer) return;

        const emailInfoItem = this.modalEmail.closest('.info-item');
        const isCurrentlyExpanded = this.emailChangeContainer.style.display !== 'none';
        
        if (show === null) {
            show = !isCurrentlyExpanded;
        }

        if (show) {
            // Expandir contenedor
            this.emailChangeContainer.style.display = 'block';
            emailInfoItem.classList.add('expanded');
            
            // Resetear formulario
            this.resetEmailChangeForm();
            
            // Hacer focus en el input
            const newEmailInput = this.emailChangeContainer.querySelector('#new-email-input');
            if (newEmailInput) {
                setTimeout(() => newEmailInput.focus(), 100);
            }
        } else {
            // Contraer contenedor
            this.emailChangeContainer.style.display = 'none';
            emailInfoItem.classList.remove('expanded');
            
            // Resetear formulario
            this.resetEmailChangeForm();
        }
    }

    /**
     * Alterna el modo de cambio de teléfono
     */
    togglePhoneChangeMode(show = null) {
        if (!this.phoneChangeContainer) return;

        const phoneInfoItem = this.modalPhone.closest('.info-item');
        const isCurrentlyExpanded = this.phoneChangeContainer.style.display !== 'none';
        
        if (show === null) {
            show = !isCurrentlyExpanded;
        }

        if (show) {
            // Expandir contenedor
            this.phoneChangeContainer.style.display = 'block';
            phoneInfoItem.classList.add('expanded');
            
            // Resetear formulario
            this.resetPhoneChangeForm();
            
            // Hacer focus en el input
            const newPhoneInput = this.phoneChangeContainer.querySelector('#new-phone-input');
            if (newPhoneInput) {
                setTimeout(() => newPhoneInput.focus(), 100);
            }
        } else {
            // Contraer contenedor
            this.phoneChangeContainer.style.display = 'none';
            phoneInfoItem.classList.remove('expanded');
            
            // Resetear formulario
            this.resetPhoneChangeForm();
        }
    }

    /**
     * Resetea el formulario de cambio de correo
     */
    resetEmailChangeForm() {
        if (!this.emailChangeContainer) return;

        // Mostrar formulario de cambio, ocultar verificación
        const changeForm = this.emailChangeContainer.querySelector('.email-change-form');
        const verifyForm = this.emailChangeContainer.querySelector('.email-verify-form');
        
        if (changeForm) changeForm.style.display = 'block';
        if (verifyForm) verifyForm.style.display = 'none';

        // Limpiar inputs
        const newEmailInput = this.emailChangeContainer.querySelector('#new-email-input');
        const verifyCodeInput = this.emailChangeContainer.querySelector('#verify-code-input');
        
        if (newEmailInput) newEmailInput.value = '';
        if (verifyCodeInput) verifyCodeInput.value = '';

        // Limpiar mensajes
        this.clearEmailStatusMessage();
        this.clearVerifyStatusMessage();

        // Habilitar botones
        this.setEmailButtonsEnabled(true);
    }

    /**
     * Resetea el formulario de cambio de teléfono
     */
    resetPhoneChangeForm() {
        if (!this.phoneChangeContainer) return;

        // Mostrar formulario de cambio, ocultar verificación
        const changeForm = this.phoneChangeContainer.querySelector('.phone-change-form');
        const verifyForm = this.phoneChangeContainer.querySelector('.phone-verify-form');
        
        if (changeForm) changeForm.style.display = 'block';
        if (verifyForm) verifyForm.style.display = 'none';

        // Limpiar inputs
        const newPhoneInput = this.phoneChangeContainer.querySelector('#new-phone-input');
        const verifyPhoneCodeInput = this.phoneChangeContainer.querySelector('#verify-phone-code-input');
        
        if (newPhoneInput) newPhoneInput.value = '';
        if (verifyPhoneCodeInput) verifyPhoneCodeInput.value = '';

        // Limpiar mensajes
        this.clearPhoneStatusMessage();
        this.clearVerifyPhoneStatusMessage();

        // Habilitar botones
        this.setPhoneButtonsEnabled(true);
    }

    /**
     * Maneja el envío del código de verificación
     */
    async handleSendEmailCode() {
        const newEmailInput = this.emailChangeContainer.querySelector('#new-email-input');
        if (!newEmailInput) return;

        const newEmail = newEmailInput.value.trim();
        if (!newEmail) {
            this.showEmailStatusMessage('Por favor, ingresa un correo electrónico válido', 'error');
            return;
        }

        // Validar formato básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            this.showEmailStatusMessage('El formato del correo electrónico es inválido', 'error');
            return;
        }

        // Verificar que no sea el mismo correo actual
        const currentEmail = this.modalEmail.textContent;
        if (newEmail === currentEmail) {
            this.showEmailStatusMessage('El nuevo correo debe ser diferente al actual', 'error');
            return;
        }

        try {
            // Deshabilitar botones durante la solicitud
            this.setEmailButtonsEnabled(false);
            this.showEmailStatusMessage('Enviando código de verificación...', 'loading');

            // Enviar solicitud de cambio
            const result = await this.profileService.requestEmailChange(this.currentUserId, newEmail);
            
            console.log('📧 Resultado de requestEmailChange:', result);

            if (result.success) {
                // Mostrar formulario de verificación
                this.showEmailVerificationForm();
                this.showVerifyStatusMessage(result.message, 'success');
            } else {
                console.log(`❌ Error en cambio de email: ${result.message}`);
                this.showEmailStatusMessage(result.message, 'error');
                this.setEmailButtonsEnabled(true);
            }

        } catch (error) {
            console.error('Error al enviar código de verificación:', error);
            this.showEmailStatusMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            this.setEmailButtonsEnabled(true);
        }
    }

    /**
     * Maneja la verificación del código
     */
    async handleVerifyEmailCode() {
        const verifyCodeInput = this.emailChangeContainer.querySelector('#verify-code-input');
        if (!verifyCodeInput) return;

        const code = verifyCodeInput.value.trim();
        if (!code) {
            this.showVerifyStatusMessage('Por favor, ingresa el código de verificación', 'error');
            return;
        }

        if (code.length !== 6) {
            this.showVerifyStatusMessage('El código debe tener 6 dígitos', 'error');
            return;
        }

        try {
            // Deshabilitar botones durante la verificación
            this.setVerifyButtonsEnabled(false);
            this.showVerifyStatusMessage('Verificando código...', 'loading');

            // Verificar código
            const result = await this.profileService.verifyEmailChange(this.currentUserId, code);

            if (result.success) {
                this.showVerifyStatusMessage(result.message, 'success');
                
                // Actualizar el correo en la interfaz
                const newEmailInput = this.emailChangeContainer.querySelector('#new-email-input');
                if (newEmailInput && newEmailInput.value) {
                    this.modalEmail.textContent = newEmailInput.value;
                    
                    // Actualizar sessionStorage
                    sessionStorage.setItem('email', newEmailInput.value);
                    sessionStorage.setItem('userEmail', newEmailInput.value);
                }

                // Cerrar formulario después de un delay
                setTimeout(() => {
                    this.toggleEmailChangeMode(false);
                    this.showSuccessToast('Correo electrónico actualizado correctamente');
                }, 2000);

            } else {
                this.showVerifyStatusMessage(result.message, 'error');
                this.setVerifyButtonsEnabled(true);
            }

        } catch (error) {
            console.error('Error al verificar código:', error);
            this.showVerifyStatusMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            this.setVerifyButtonsEnabled(true);
        }
    }

    /**
     * Maneja el envío del código de verificación para teléfono
     */
    async handleSendPhoneCode() {
        const newPhoneInput = this.phoneChangeContainer.querySelector('#new-phone-input');
        if (!newPhoneInput) return;

        const newPhone = newPhoneInput.value.trim();
        if (!newPhone) {
            this.showPhoneStatusMessage('Por favor, ingresa un número de teléfono válido', 'error');
            return;
        }

        // Validar formato básico
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(newPhone) || newPhone.length < 10) {
            this.showPhoneStatusMessage('El formato del número de teléfono es inválido', 'error');
            return;
        }

        // Verificar que no sea el mismo teléfono actual
        const currentPhone = this.modalPhone.textContent;
        if (newPhone === currentPhone) {
            this.showPhoneStatusMessage('El nuevo número debe ser diferente al actual', 'error');
            return;
        }

        try {
            // Deshabilitar botones durante la solicitud
            this.setPhoneButtonsEnabled(false);
            this.showPhoneStatusMessage('Enviando código de verificación...', 'loading');

            // Enviar solicitud de cambio
            const result = await this.profileService.requestPhoneChange(this.currentUserId, newPhone);

            if (result.success) {
                // Mostrar formulario de verificación
                this.showPhoneVerificationForm();
                this.showVerifyPhoneStatusMessage(result.message, 'success');
            } else {
                this.showPhoneStatusMessage(result.message, 'error');
                this.setPhoneButtonsEnabled(true);
            }

        } catch (error) {
            console.error('Error al enviar código de verificación de teléfono:', error);
            this.showPhoneStatusMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            this.setPhoneButtonsEnabled(true);
        }
    }

    /**
     * Maneja la verificación del código de teléfono
     */
    async handleVerifyPhoneCode() {
        const verifyCodeInput = this.phoneChangeContainer.querySelector('#verify-phone-code-input');
        if (!verifyCodeInput) return;

        const code = verifyCodeInput.value.trim();
        if (!code) {
            this.showVerifyPhoneStatusMessage('Por favor, ingresa el código de verificación', 'error');
            return;
        }

        if (code.length !== 6) {
            this.showVerifyPhoneStatusMessage('El código debe tener 6 dígitos', 'error');
            return;
        }

        try {
            // Deshabilitar botones durante la verificación
            this.setVerifyPhoneButtonsEnabled(false);
            this.showVerifyPhoneStatusMessage('Verificando código...', 'loading');

            // Verificar código
            const result = await this.profileService.verifyPhoneChange(this.currentUserId, code);

            if (result.success) {
                this.showVerifyPhoneStatusMessage(result.message, 'success');
                
                // Actualizar el teléfono en la interfaz
                const newPhoneInput = this.phoneChangeContainer.querySelector('#new-phone-input');
                if (newPhoneInput && newPhoneInput.value) {
                    this.modalPhone.textContent = newPhoneInput.value;
                    
                    // Actualizar sessionStorage
                    sessionStorage.setItem('phone', newPhoneInput.value);
                    sessionStorage.setItem('userPhone', newPhoneInput.value);
                }

                // Cerrar formulario después de un delay
                setTimeout(() => {
                    this.togglePhoneChangeMode(false);
                    this.showSuccessToast('Número de teléfono actualizado correctamente');
                }, 2000);

            } else {
                this.showVerifyPhoneStatusMessage(result.message, 'error');
                this.setVerifyPhoneButtonsEnabled(true);
            }

        } catch (error) {
            console.error('Error al verificar código de teléfono:', error);
            this.showVerifyPhoneStatusMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            this.setVerifyPhoneButtonsEnabled(true);
        }
    }

    /**
     * Muestra el formulario de verificación de teléfono
     */
    showPhoneVerificationForm() {
        if (!this.phoneChangeContainer) return;

        const changeForm = this.phoneChangeContainer.querySelector('.phone-change-form');
        const verifyForm = this.phoneChangeContainer.querySelector('.phone-verify-form');
        
        if (changeForm) changeForm.style.display = 'none';
        if (verifyForm) verifyForm.style.display = 'block';

        // Hacer focus en el input de código
        const verifyCodeInput = this.phoneChangeContainer.querySelector('#verify-phone-code-input');
        if (verifyCodeInput) {
            setTimeout(() => verifyCodeInput.focus(), 100);
        }
    }

    /**
     * Muestra el formulario de verificación de correo electrónico
     */
    showEmailVerificationForm() {
        if (!this.emailChangeContainer) return;

        const changeForm = this.emailChangeContainer.querySelector('.email-change-form');
        const verifyForm = this.emailChangeContainer.querySelector('.email-verify-form');
        
        if (changeForm) changeForm.style.display = 'none';
        if (verifyForm) verifyForm.style.display = 'block';

        // Hacer focus en el input de código
        const verifyCodeInput = this.emailChangeContainer.querySelector('#verify-code-input');
        if (verifyCodeInput) {
            setTimeout(() => verifyCodeInput.focus(), 100);
        }
    }

    /**
     * Muestra mensaje de estado para el cambio de correo
     */
    showEmailStatusMessage(message, type = 'info') {
        console.log(`📧 Mostrando mensaje de estado de email: "${message}" (tipo: ${type})`);
        
        if (!this.emailChangeContainer) {
            console.error('❌ emailChangeContainer no está disponible');
            return;
        }
        
        const statusElement = this.emailChangeContainer.querySelector('.email-status-message');
        if (!statusElement) {
            console.error('❌ Elemento .email-status-message no encontrado');
            return;
        }

        statusElement.textContent = message;
        statusElement.className = `email-status-message ${type}`;
        statusElement.style.display = 'block';
        
        console.log(`✅ Mensaje de estado mostrado exitosamente`);
        
        // Auto-ocultar mensaje después de 10 segundos para mensajes de éxito/error
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                if (statusElement.style.display === 'block') {
                    statusElement.style.display = 'none';
                }
            }, 10000);
        }
    }

    /**
     * Muestra mensaje de estado para la verificación
     */
    showVerifyStatusMessage(message, type = 'info') {
        const statusElement = this.emailChangeContainer.querySelector('.verify-status-message');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `verify-status-message ${type}`;
        statusElement.style.display = 'block';
    }

    /**
     * Muestra mensaje de estado para el cambio de teléfono
     */
    showPhoneStatusMessage(message, type = 'info') {
        const statusElement = this.phoneChangeContainer.querySelector('.phone-status-message');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `phone-status-message ${type}`;
        statusElement.style.display = 'block';
    }

    /**
     * Muestra mensaje de estado para la verificación de teléfono
     */
    showVerifyPhoneStatusMessage(message, type = 'info') {
        const statusElement = this.phoneChangeContainer.querySelector('.verify-phone-status-message');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `verify-phone-status-message ${type}`;
        statusElement.style.display = 'block';
    }

    /**
     * Limpia el mensaje de estado del cambio de correo
     */
    clearEmailStatusMessage() {
        const statusElement = this.emailChangeContainer.querySelector('.email-status-message');
        if (statusElement) {
            statusElement.style.display = 'none';
            statusElement.textContent = '';
        }
    }

    /**
     * Limpia el mensaje de estado de la verificación
     */
    clearVerifyStatusMessage() {
        const statusElement = this.emailChangeContainer.querySelector('.verify-status-message');
        if (statusElement) {
            statusElement.style.display = 'none';
            statusElement.textContent = '';
        }
    }

    /**
     * Limpia el mensaje de estado del cambio de teléfono
     */
    clearPhoneStatusMessage() {
        const statusElement = this.phoneChangeContainer.querySelector('.phone-status-message');
        if (statusElement) {
            statusElement.style.display = 'none';
            statusElement.textContent = '';
        }
    }

    /**
     * Limpia el mensaje de estado de la verificación de teléfono
     */
    clearVerifyPhoneStatusMessage() {
        const statusElement = this.phoneChangeContainer.querySelector('.verify-phone-status-message');
        if (statusElement) {
            statusElement.style.display = 'none';
            statusElement.textContent = '';
        }
    }

    /**
     * Habilita/deshabilita los botones del formulario de cambio
     */
    setEmailButtonsEnabled(enabled) {
        const sendBtn = this.emailChangeContainer.querySelector('#send-email-code-btn');
        const cancelBtn = this.emailChangeContainer.querySelector('#cancel-email-change-btn');
        
        if (sendBtn) sendBtn.disabled = !enabled;
        if (cancelBtn) cancelBtn.disabled = !enabled;
    }

    /**
     * Habilita/deshabilita los botones del formulario de verificación
     */
    setVerifyButtonsEnabled(enabled) {
        const verifyBtn = this.emailChangeContainer.querySelector('#verify-email-code-btn');
        const cancelBtn = this.emailChangeContainer.querySelector('#cancel-verify-btn');
        
        if (verifyBtn) verifyBtn.disabled = !enabled;
        if (cancelBtn) cancelBtn.disabled = !enabled;
    }

    /**
     * Habilita/deshabilita los botones del formulario de cambio de teléfono
     */
    setPhoneButtonsEnabled(enabled) {
        const sendBtn = this.phoneChangeContainer.querySelector('#send-phone-code-btn');
        const cancelBtn = this.phoneChangeContainer.querySelector('#cancel-phone-change-btn');
        
        if (sendBtn) sendBtn.disabled = !enabled;
        if (cancelBtn) cancelBtn.disabled = !enabled;
    }

    /**
     * Habilita/deshabilita los botones del formulario de verificación de teléfono
     */
    setVerifyPhoneButtonsEnabled(enabled) {
        const verifyBtn = this.phoneChangeContainer.querySelector('#verify-phone-code-btn');
        const cancelBtn = this.phoneChangeContainer.querySelector('#cancel-phone-verify-btn');
        
        if (verifyBtn) verifyBtn.disabled = !enabled;
        if (cancelBtn) cancelBtn.disabled = !enabled;
    }

    /**
     * Muestra un toast de éxito
     */
    showSuccessToast(message) {
        console.log(`🎯 ProfileController.showSuccessToast: ${message}`);
        // Usar el sistema global de toast
        this.showToast(message, 'success');
    }

    /**
     * Muestra el modal de perfil
     */
    async showProfileModal() {
        if (!this.profileModal) {
            console.warn('⚠️ Modal de perfil no encontrado');
            this.debugModalElements();
            return;
        }

        try {
            console.log('📋 Abriendo modal de perfil...');
            
            // Usar datos de sessionStorage como fuente base
            let userData = this.getUserDataFromSession();
            
            // Intentar obtener datos actualizados de la API
            if (this.currentUserId && this.profileService) {
                try {
                    console.log('🌐 Obteniendo datos del perfil desde API...');
                    const apiData = await this.profileService.getUserProfile(this.currentUserId);
                    
                    if (apiData) {
                        console.log('✅ Datos del perfil obtenidos de la API:', apiData);
                        
                        // Combinar datos de API con sessionStorage (API tiene prioridad)
                        userData = {
                            ...userData,
                            firstName: apiData.firstName || userData.firstName,
                            lastName: apiData.lastName || userData.lastName,
                            documentType: apiData.documentType || userData.documentType,
                            document: apiData.document || userData.documentValue,
                            area: apiData.area || userData.area,
                            position: apiData.position || userData.position,
                            email: apiData.email || userData.email,
                            phone: apiData.phone || userData.phone
                        };
                        
                        // Actualizar sessionStorage con los datos más recientes
                        this.updateSessionStorageWithApiData(apiData);
                        
                    } else {
                        console.log('ℹ️ API no devolvió datos, usando sessionStorage');
                    }
                } catch (error) {
                    console.log('ℹ️ Error al obtener datos de API, usando sessionStorage:', error.message);
                }
            }
              
            // Poblar el modal con los datos
            await this.populateProfileModal(userData);
            
            // Mostrar el modal
            this.profileModal.style.display = 'block';
            
            console.log('✅ Modal de perfil abierto');
            
        } catch (error) {
            console.error('❌ Error al abrir modal de perfil:', error);
            
            // Fallback: usar solo datos de sessionStorage
            const userData = this.getUserDataFromSession();
            this.populateProfileModal(userData);
            this.profileModal.style.display = 'block';
        }
    }

    /**
     * Oculta el modal de perfil
     */
    hideProfileModal() {
        if (this.profileModal) {
            this.profileModal.style.display = 'none';
            console.log('✅ Modal de perfil cerrado');
        }
    }

    /**
     * Obtiene los datos del usuario desde sessionStorage
     */
    getUserDataFromSession() {
        return {
            userId: sessionStorage.getItem("userId"),
            firstName: sessionStorage.getItem("firstName"),
            lastName: sessionStorage.getItem("lastName"),
            fullName: sessionStorage.getItem("userFullName"),
            documentType: sessionStorage.getItem("documentType") || sessionStorage.getItem("typeDocument"),
            documentValue: sessionStorage.getItem("documentValue"),
            email: sessionStorage.getItem("email") || sessionStorage.getItem("userEmail"),
            phone: sessionStorage.getItem("phone") || sessionStorage.getItem("userPhone"),
            area: sessionStorage.getItem("area") || sessionStorage.getItem("userArea"),
            position: sessionStorage.getItem("position") || sessionStorage.getItem("userPosition") || sessionStorage.getItem("userRole"),
            roles: sessionStorage.getItem("userRoles")
        };
    }

    /**
     * Puebla el modal con los datos del usuario
     */
    async populateProfileModal(userData) {
        // Nombre completo en el header
        if (this.modalName) {
            const fullName = userData.fullName || 
                           `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
                           'Usuario';
            this.modalName.textContent = fullName;
        }

        // Avatar/foto de perfil - cargar desde API igual que en pantalla principal
        if (this.modalAvatar) {
            await this.loadModalProfileImage();
        }

        // Datos personales
        if (this.modalFirstName) {
            this.modalFirstName.textContent = userData.firstName || 'No disponible';
        }
        
        if (this.modalLastName) {
            this.modalLastName.textContent = userData.lastName || 'No disponible';
        }
        
        if (this.modalDocType) {
            const docType = this.getDocumentTypeName(userData.documentType);
            this.modalDocType.textContent = docType;
        }
        
        if (this.modalDocument) {
            this.modalDocument.textContent = userData.documentValue || 'No disponible';
        }
        
        if (this.modalArea) {
            this.modalArea.textContent = userData.area || 'No disponible';
        }
        
        if (this.modalPosition) {
            this.modalPosition.textContent = userData.position || 'No disponible';
        }

        // Datos de contacto
        if (this.modalEmail) {
            this.modalEmail.textContent = userData.email || 'No disponible';
        }
        
        if (this.modalPhone) {
            this.modalPhone.textContent = userData.phone || 'No disponible';
        }

        console.log('📋 Modal poblado con datos:', userData);
    }

    /**
     * Convierte el código de tipo de documento a nombre legible
     */
    getDocumentTypeName(typeCode) {
        const documentTypes = {
            'DNI': 'Documento Nacional de Identidad',
            'CE': 'Carné de Extranjería',
            'PASSPORT': 'Pasaporte',
            'RUC': 'Registro Único de Contribuyentes',
            '1': 'DNI',
            '2': 'Carné de Extranjería',
            '3': 'Pasaporte',
            '4': 'RUC'
        };
        
        return documentTypes[typeCode] || typeCode || 'No disponible';
    }

    /**
     * Carga la imagen de perfil específicamente para el modal
     */
    async loadModalProfileImage() {
        if (!this.modalAvatar || !this.currentUserId) {
            return;
        }

        try {
            // Verificar cache primero
            if (this.imageCache.has(this.currentUserId)) {
                console.log('📸 Usando imagen desde cache para modal');
                this.setModalProfileImage(this.imageCache.get(this.currentUserId));
                return;
            }

            // Si no hay cache, obtener la imagen
            if (this.profileService) {
                const base64Image = await this.profileService.getProfilePhoto(this.currentUserId);
                
                if (base64Image) {
                    const imageUrl = this.profileService.base64ToImageUrl(base64Image);
                    
                    // Guardar en cache
                    this.imageCache.set(this.currentUserId, imageUrl);
                    
                    // Establecer imagen en el modal
                    this.setModalProfileImage(imageUrl);
                } else {
                    // No hay foto, usar avatar por defecto
                    this.setModalDefaultImage();
                }
            } else {
                this.setModalDefaultImage();
            }

        } catch (error) {
            console.error('❌ Error al cargar imagen de perfil del modal:', error);
            this.setModalDefaultImage();
        }
    }

    /**
     * Establece la imagen de perfil en el modal
     */
    setModalProfileImage(imageUrl) {
        if (this.modalAvatar && imageUrl) {
            this.modalAvatar.src = imageUrl;
            this.modalAvatar.alt = 'Foto de perfil';
        }
    }

    /**
     * Establece la imagen por defecto en el modal
     */
    setModalDefaultImage() {
        if (this.modalAvatar && this.profileService) {
            const defaultUrl = this.profileService.getDefaultAvatarUrl();
            this.modalAvatar.src = defaultUrl;
            this.modalAvatar.alt = 'Avatar por defecto';
        }
    }

    /**
     * Método de debug para verificar el estado de los elementos del modal
     */
    debugModalElements() {
        console.log('🔍 Debug - Estado de elementos del modal:', {
            profileModal: {
                element: !!this.profileModal,
                display: this.profileModal?.style.display,
                id: this.profileModal?.id
            },
            profileContainer: {
                element: !!this.profileContainer,
                id: this.profileContainer?.id
            },
            modalElements: {
                modalName: !!this.modalName,
                modalEmail: !!this.modalEmail,
                modalAvatar: !!this.modalAvatar,
                modalFirstName: !!this.modalFirstName,
                modalLastName: !!this.modalLastName
            },
            currentUserId: this.currentUserId,
            profileService: !!this.profileService
        });
    }

    /**
     * Actualiza sessionStorage con datos de la API
     */
    updateSessionStorageWithApiData(apiData) {
        if (!apiData) return;
        
        try {
            // Actualizar solo los campos que vienen de la API y no están vacíos
            if (apiData.firstName) {
                sessionStorage.setItem("firstName", apiData.firstName);
            }
            if (apiData.lastName) {
                sessionStorage.setItem("lastName", apiData.lastName);
            }
            if (apiData.documentType) {
                sessionStorage.setItem("documentType", apiData.documentType);
            }
            if (apiData.document) {
                sessionStorage.setItem("documentValue", apiData.document);
            }
            if (apiData.area) {
                sessionStorage.setItem("area", apiData.area);
            }
            if (apiData.position) {
                sessionStorage.setItem("position", apiData.position);
            }
            if (apiData.email) {
                sessionStorage.setItem("email", apiData.email);
                sessionStorage.setItem("userEmail", apiData.email);
            }
            if (apiData.phone) {
                sessionStorage.setItem("phone", apiData.phone);
                sessionStorage.setItem("userPhone", apiData.phone);
            }
            
            // Actualizar nombre completo si tenemos firstName y lastName
            if (apiData.firstName && apiData.lastName) {
                const fullName = `${apiData.firstName} ${apiData.lastName}`;
                sessionStorage.setItem("userFullName", fullName);
            }
            
            console.log('✅ SessionStorage actualizado con datos de la API');
            
        } catch (error) {
            console.warn('⚠️ Error al actualizar sessionStorage:', error);
        }
    }
    
    /**
     * Refresca los datos del perfil desde la API y actualiza la interfaz
     */
    async refreshProfileFromApi() {
        if (!this.currentUserId || !this.profileService) {
            console.warn('⚠️ No se puede refrescar: sin userId o ProfileService');
            return false;
        }

        try {
            console.log('🔄 Refrescando datos del perfil desde API...');
            
            const apiData = await this.profileService.getUserProfile(this.currentUserId);
            
            if (apiData) {
                // Actualizar sessionStorage con los nuevos datos
                this.updateSessionStorageWithApiData(apiData);
                
                // Actualizar el nombre en la interfaz
                this.updateUserName();
                
                console.log('✅ Perfil refrescado desde API exitosamente');
                return true;
            } else {
                console.log('ℹ️ No se obtuvieron datos de la API');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error al refrescar perfil desde API:', error);
            return false;
        }
    }

    /**
     * Maneja la selección de una nueva foto de perfil
     */
    async handlePhotoSelection(file) {
        console.log('🚀 Iniciando handlePhotoSelection:', file?.name);
        
        if (!file) {
            console.warn('⚠️ No se seleccionó ningún archivo');
            return;
        }

        // Validaciones básicas
        if (!this.currentUserId) {
            console.error('❌ currentUserId no disponible');
            this.showToast('Error: Usuario no identificado', 'error');
            return;
        }

        if (!this.profileService) {
            console.error('❌ ProfileService no disponible');
            this.showToast('Error: Servicio no disponible', 'error');
            return;
        }

        try {
            // Validar archivo
            if (!this.validateImageFile(file)) {
                return; // validateImageFile ya muestra el error
            }

            // Mostrar loading
            this.setAvatarLoading(true);

            // Procesar imagen
            const processedImage = await this.processImageForUpload(file);
            if (!processedImage) {
                this.showToast('Error al procesar la imagen', 'error');
                return;
            }

            // Subir imagen
            console.log('☁️ Subiendo imagen al servidor...');
            const result = await this.profileService.uploadProfilePhoto(this.currentUserId, processedImage);
            console.log('📤 Resultado del upload:', result);

            if (result && result.success) {
                // Actualizar imagen en la interfaz
                await this.updateProfileImageAfterUpload(processedImage);
                console.log('🎯 ProfileController: Llamando showToast con éxito');
                this.showToast('Foto actualizada correctamente', 'success');
            } else {
                const errorMsg = result?.message || 'Error al subir la foto';
                console.error('❌ Error en upload:', errorMsg);
                console.log('🎯 ProfileController: Llamando showToast con error');
                this.showToast(errorMsg, 'error');
            }

        } catch (error) {
            console.error('❌ Error en handlePhotoSelection:', error);
            this.showToast('Error inesperado: ' + error.message, 'error');
        } finally {
            this.setAvatarLoading(false);
            // Limpiar input
            if (this.photoInput) {
                this.photoInput.value = '';
            }
        }
    }

    /**
     * Valida el archivo de imagen
     */
    validateImageFile(file) {
        if (!file) {
            this.showToast('No se seleccionó ningún archivo', 'error');
            return false;
        }

        // Verificar tipo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Formato no válido. Use JPG, PNG, GIF o WebP', 'error');
            return false;
        }

        // Verificar tamaño (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('Archivo muy grande. Máximo 5MB', 'error');
            return false;
        }

        return true;
    }

    /**
     * Procesa la imagen para upload
     */
    async processImageForUpload(file) {
        try {
            // Convertir a base64
            const base64 = await this.fileToBase64(file);
            
            // Crear imagen para redimensionar
            const img = new Image();
            
            return new Promise((resolve) => {
                img.onload = () => {
                    try {
                        // Calcular dimensiones (max 800px)
                        const maxSize = 800;
                        let { width, height } = img;
                        
                        if (width > height && width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        } else if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }

                        // Crear canvas
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;

                        // Redimensionar
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convertir a JPEG 85%
                        const resized = canvas.toDataURL('image/jpeg', 0.85);
                        console.log(`📏 Redimensionado: ${img.width}x${img.height} -> ${width}x${height}`);
                        resolve(resized);
                        
                    } catch (error) {
                        console.error('Error al redimensionar:', error);
                        resolve(base64); // Fallback al original
                    }
                };
                
                img.onerror = () => {
                    console.error('Error al cargar imagen');
                    resolve(base64); // Fallback al original
                };
                
                img.src = base64;
            });
            
        } catch (error) {
            console.error('Error en processImageForUpload:', error);
            return null;
        }
    }

    /**
     * Convierte archivo a base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Actualiza la imagen en la interfaz después del upload
     */
    async updateProfileImageAfterUpload(base64Image) {
        try {
            const imageUrl = this.profileService.base64ToImageUrl(base64Image);
            
            // Actualizar cache
            this.imageCache.set(this.currentUserId, imageUrl);
            
            // Actualizar imagen principal
            this.setProfileImage(imageUrl);
            
            // Actualizar modal si está abierto
            if (this.modalAvatar) {
                this.modalAvatar.src = imageUrl;
            }
            
        } catch (error) {
            console.error('Error al actualizar imagen en interfaz:', error);
        }
    }

    /**
     * Establece estado de carga del avatar
     */
    setAvatarLoading(isLoading) {
        // Avatar principal
        if (this.profileImageElement) {
            if (isLoading) {
                this.profileImageElement.classList.add('profile-loading');
            } else {
                this.profileImageElement.classList.remove('profile-loading');
            }
        }

        // Avatar del modal
        if (this.modalAvatar) {
            if (isLoading) {
                this.modalAvatar.classList.add('avatar-loading');
            } else {
                this.modalAvatar.classList.remove('avatar-loading');
            }
        }

        // Botón de cambio
        if (this.changePhotoBtn) {
            this.changePhotoBtn.disabled = isLoading;
            this.changePhotoBtn.textContent = isLoading ? 'Subiendo...' : 'Cambiar foto';
        }
    }

    /**
     * Muestra mensaje toast (mismo estilo que recuperación de contraseña)
     */
    /**
     * Muestra mensaje toast (utiliza la función global)
     */
    showToast(message, type = 'success') {
        console.log(`🎯 ProfileController.showToast: ${type} - ${message}`);
        
        // Intentar usar el sistema de toast global en orden de preferencia
        if (typeof window.showRecoveryToast === 'function') {
            console.log('✅ Usando window.showRecoveryToast');
            window.showRecoveryToast(message, type);
        } else if (typeof window.showToast === 'function') {
            console.log('✅ Usando window.showToast');
            window.showToast(message, type);
        } else if (typeof window.GlobalToast !== 'undefined' && window.GlobalToast.show) {
            console.log('✅ Usando window.GlobalToast');
            window.GlobalToast.show(message, type);
        } else {
            console.warn('⚠️ No se encontró sistema de toast, usando alert como fallback');
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Exportar la clase para que esté disponible en otros archivos
if (typeof module !== "undefined" && module.exports) {
    module.exports = ProfileController;
} else {
    // Para navegadores sin soporte de módulos
    window.ProfileController = ProfileController;
}
