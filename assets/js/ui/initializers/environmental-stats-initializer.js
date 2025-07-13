/**
 * Environmental Stats Initializer - Inicializador para la página de estadísticas ambientales
 */
class EnvironmentalStatsInitializer {
    constructor() {
        this.componentLoader = new ComponentLoader();
        this.authService = new AuthService();
    }

    /**
     * Inicializa la página de estadísticas ambientales
     */
    async init() {
        try {
            console.log('🌱 Inicializando página de Estadísticas Ambientales...');
            
            // Verificar autenticación
            if (!this.authService.isAuthenticated()) {
                console.warn('⚠️ Usuario no autenticado, redirigiendo al login...');
                window.location.href = '/index.html';
                return;
            }

            // Cargar componentes básicos
            await this.loadComponents();
            
            // Inicializar controladores
            await this.initializeControllers();
            
            console.log('✅ Página de Estadísticas Ambientales inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar página de Estadísticas Ambientales:', error);
            this.showErrorMessage(error.message);
        }
    }

    /**
     * Carga los componentes necesarios
     */
    async loadComponents() {
        try {
            console.log('📦 Cargando componentes...');
            
            const componentPromises = [
                this.componentLoader.loadComponent('sidebar', '#sidebar-container'),
                this.componentLoader.loadComponent('topbar', '#topbar-container'),
                this.componentLoader.loadComponent('profile-modal', '#profile-modal-container')
            ];

            await Promise.all(componentPromises);
            console.log('📦 Componentes HTML cargados exitosamente');
            
            // Crear instancias de los controladores después de cargar los componentes
            await this.initializeControllers();
            
            // Configurar el botón hamburguesa directamente
            this.setupHamburgerButton();
            
        } catch (error) {
            console.error('❌ Error al cargar componentes:', error);
            throw new Error('Error al cargar componentes de la interfaz');
        }
    }

    /**
     * Inicializa los controladores necesarios
     */
    async initializeControllers() {
        console.log('� Inicializando controladores...');
        
        // Crear instancia del SidebarController si no existe
        if (!window.sidebarControllerInstance) {
            window.sidebarControllerInstance = new SidebarController();
            console.log('✅ SidebarController creado');
        }
        
        // Crear instancia del TopBarController si no existe
        if (!window.topBarControllerInstance) {
            window.topBarControllerInstance = new TopBarController();
            console.log('✅ TopBarController creado');
        }
        
        // Esperar un poco más para asegurar que los controladores se inicialicen
        await this.waitForControllers();
        
        // Configurar estados específicos de la página
        this.setupPageStates();
        
        console.log('🎮 Controladores inicializados exitosamente');
    }

    /**
     * Muestra un mensaje de error al usuario
     */
    showErrorMessage(message) {
        const errorHtml = `
            <div class="page">
                <div class="page-wrapper">
                    <div class="page-body d-flex align-items-center">
                        <div class="container-slim">
                            <div class="row justify-content-center">
                                <div class="col-md-8 col-lg-6">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="text-center">
                                                <div class="mb-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-lg text-danger" width="64" height="64" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <circle cx="12" cy="12" r="9"/>
                                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                                    </svg>
                                                </div>
                                                <h3>Error al cargar las estadísticas ambientales</h3>
                                                <p class="text-muted">${message}</p>
                                                <div class="mt-4">
                                                    <button class="btn btn-primary" onclick="location.reload()">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-refresh me-2" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/>
                                                            <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>
                                                        </svg>
                                                        Reintentar
                                                    </button>
                                                    <a href="../pages/Dashboard.html" class="btn btn-link">Volver al Dashboard</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
    }

    /**
     * Configura el guard de ruta para autenticación
     */
    setupRouteGuard() {
        const routeGuard = new RouteGuard();
        routeGuard.init();
    }
    
    /**
     * Configura el botón hamburguesa directamente para asegurar que funcione
     */
    setupHamburgerButton() {
        const hamburgerBtn = document.getElementById('open-sidebar');
        const sidebar = document.getElementById('sidebar');
        const pageWrapper = document.querySelector('.page-wrapper');
        
        if (hamburgerBtn && sidebar) {
            // Remover listeners existentes
            hamburgerBtn.removeEventListener('click', this.handleHamburgerClick);
            
            // Agregar nuevo listener
            hamburgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (window.innerWidth <= 991.98) {
                    // Móvil: toggle clase show
                    sidebar.classList.toggle('show');
                } else {
                    // Desktop: toggle clase hidden
                    sidebar.classList.toggle('hidden');
                    if (pageWrapper) {
                        pageWrapper.classList.toggle('sidebar-hidden');
                    }
                }
            });
            
            console.log('✅ Botón hamburguesa configurado directamente');
        }
    }

    /**
     * Espera a que los controladores se inicialicen completamente
     */
    async waitForControllers() {
        return new Promise(resolve => {
            // Verificar que los controladores estén listos
            const checkControllers = () => {
                if (window.sidebarControllerInstance && window.topBarControllerInstance) {
                    console.log('🎯 Controladores verificados y listos');
                    resolve();
                } else {
                    console.log('⏳ Esperando controladores...');
                    setTimeout(checkControllers, 100);
                }
            };
            checkControllers();
        });
    }

    /**
     * Configura estados específicos de la página
     */
    setupPageStates() {
        console.log('🎯 Configurando estados de la página...');
        
        // Establecer título específico de estadísticas ambientales
        if (window.topBarControllerInstance) {
            console.log('📝 Estableciendo título "Impacto Ambiental" via topBarController...');
            window.topBarControllerInstance.setTitle('Impacto Ambiental', 'fas fa-leaf');
        } else {
            console.warn('⚠️ topBarControllerInstance no encontrado, usando método directo...');
            // Fallback directo
            setTimeout(() => {
                const titleElement = document.getElementById('page-title');
                if (titleElement) {
                    titleElement.innerHTML = '<i class="fas fa-leaf me-2"></i>Impacto Ambiental';
                    console.log('✅ Título establecido directamente');
                } else {
                    console.error('❌ No se pudo encontrar elemento #page-title');
                }
            }, 200);
        }
        
        // Marcar item estadísticas ambientales como activo en el sidebar
        if (window.sidebarControllerInstance) {
            console.log('🎯 Marcando item estadísticas ambientales como activo...');
            window.sidebarControllerInstance.setActiveMenuItem('menu-estadisticas-ambientales');
        } else {
            console.warn('⚠️ sidebarControllerInstance no encontrado');
        }
        
        console.log('🎯 Estados de la página configurados');
    }
}

// Hacer disponible globalmente
window.EnvironmentalStatsInitializer = EnvironmentalStatsInitializer;
