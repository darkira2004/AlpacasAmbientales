/**
 * Dashboard Initializer - Inicializa el dashboard con carga de componentes básicos
 */
class DashboardInitializer {
    constructor() {
        this.componentLoader = new ComponentLoader();
        this.initialized = false;
    }

    /**
     * Inicializa el dashboard
     */
    async init() {
        try {
            console.log('🚀 Iniciando Dashboard...');
            
            // Cargar componentes principales
            await this.loadComponents();
            
            // Esperar un poco más para asegurar que los controladores se inicialicen
            await this.waitForControllers();
            
            // Configurar estados específicos del dashboard
            this.setupDashboardStates();
            
            // Ocultar pantalla de carga
            this.hideLoadingScreen();
            
            this.initialized = true;
            console.log('✅ Dashboard inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar dashboard:', error);
            this.showError('Error al cargar el dashboard. Por favor, recarga la página.');
        }
    }

    /**
     * Carga todos los componentes necesarios
     */
    async loadComponents() {
        console.log('📦 Iniciando carga de componentes...');
        
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
    }
    
    /**
     * Inicializa los controladores después de cargar los componentes
     */
    async initializeControllers() {
        console.log('🎮 Inicializando controladores...');
        
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
        
        console.log('🎮 Controladores inicializados exitosamente');
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
     * Configura estados específicos del dashboard
     */
    setupDashboardStates() {
        console.log('🎯 Configurando estados del dashboard...');
        
        // Establecer título específico del dashboard
        if (window.topBarControllerInstance) {
            console.log('📝 Estableciendo título "Estadísticas" via topBarController...');
            window.topBarControllerInstance.setTitle('Estadísticas', 'fas fa-chart-bar');
        } else {
            console.warn('⚠️ topBarControllerInstance no encontrado, usando método directo...');
            // Fallback directo
            setTimeout(() => {
                const titleElement = document.getElementById('page-title');
                if (titleElement) {
                    titleElement.innerHTML = '<i class="fas fa-chart-bar me-2"></i>Estadísticas';
                    console.log('✅ Título establecido directamente');
                } else {
                    console.error('❌ No se pudo encontrar elemento #page-title');
                }
            }, 200);
        }
        
        // Marcar item estadísticas como activo en el sidebar
        if (window.sidebarControllerInstance) {
            console.log('🎯 Marcando item estadísticas como activo...');
            window.sidebarControllerInstance.setActiveMenuItem('menu-estadisticas');
        } else {
            console.warn('⚠️ sidebarControllerInstance no encontrado');
        }
        
        console.log('🎯 Estados del dashboard configurados');
    }

    /**
     * Oculta la pantalla de carga
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Muestra un mensaje de error
     */
    showError(message) {
        console.error(message);
    }
}

// Inicializar cuando el DOM esté listo
// COMENTADO: Ahora se inicializa desde el HTML para evitar doble ejecución
/*
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardInitializer();
    dashboard.init();
});
*/

// Exportar para uso global
window.DashboardInitializer = DashboardInitializer;
