/**
 * ComponentLoader - Carga componentes HTML reutilizables
 */
class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.baseComponentPath = '../assets/components/';
    }

    /**
     * Carga un componente HTML
     * @param {string} componentName - Nombre del componente (sin .html)
     * @param {string} targetSelector - Selector donde insertar el componente
     * @param {object} options - Opciones adicionales
     */
    async loadComponent(componentName, targetSelector, options = {}) {
        try {
            // Verificar si ya está cargado en cache
            if (!this.components.has(componentName)) {
                const response = await fetch(`${this.baseComponentPath}${componentName}.html`);
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el componente: ${componentName}`);
                }
                const html = await response.text();
                this.components.set(componentName, html);
            }

            // Insertar el componente en el DOM
            const targetElement = document.querySelector(targetSelector);
            if (!targetElement) {
                throw new Error(`Elemento objetivo no encontrado: ${targetSelector}`);
            }

            const componentHtml = this.components.get(componentName);
            
            if (options.prepend) {
                targetElement.insertAdjacentHTML('afterbegin', componentHtml);
            } else if (options.append) {
                targetElement.insertAdjacentHTML('beforeend', componentHtml);
            } else {
                targetElement.innerHTML = componentHtml;
            }

            // Actualizar título de página si es el topbar
            if (componentName === 'topbar' && options.pageTitle) {
                this.updatePageTitle(options.pageTitle);
            }

            // Marcar sección activa si es el sidebar
            if (componentName === 'sidebar' && options.activeSection) {
                this.markActiveSection(options.activeSection);
            }

            console.log(`✅ Componente "${componentName}" cargado correctamente`);
            return true;

        } catch (error) {
            console.error(`❌ Error cargando componente "${componentName}":`, error);
            return false;
        }
    }

    /**
     * Actualiza el título de la página en el topbar
     */
    updatePageTitle(title) {
        const titleElement = document.getElementById('page-title');
        if (titleElement && title.text) {
            titleElement.innerHTML = `
                <i class="${title.icon || 'fas fa-home'} me-2"></i>
                ${title.text}
            `;
        }
    }

    /**
     * Marca la sección activa en el sidebar
     */
    markActiveSection(activeSection) {
        // Remover clases activas existentes
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });

        // Agregar clase activa a la sección actual
        const activeItem = document.getElementById(`menu-${activeSection}`);
        if (activeItem) {
            activeItem.classList.add('active');
            
            // Si es un item de dropdown, abrir el dropdown padre
            const dropdownMenu = activeItem.closest('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.add('show');
                const parentDropdown = dropdownMenu.closest('.nav-item');
                if (parentDropdown) {
                    parentDropdown.classList.add('active');
                }
            }
        }
    }

    /**
     * Carga todos los componentes básicos de la aplicación
     */
    async loadBasicLayout(options = {}) {
        const sidebar = document.getElementById('sidebar-container');
        const topbar = document.getElementById('topbar-container');
        const modal = document.getElementById('modal-container');

        // Cargar sidebar
        if (sidebar) {
            await this.loadComponent('sidebar', '#sidebar-container', {
                activeSection: options.activeSection
            });
        }

        // Cargar topbar
        if (topbar) {
            await this.loadComponent('topbar', '#topbar-container', {
                pageTitle: options.pageTitle
            });
        }

        // Cargar modal de perfil
        if (modal) {
            await this.loadComponent('profile-modal', '#modal-container');
        }

        // Inicializar comportamiento del sidebar
        this.initializeSidebarBehavior();

        console.log('🎯 Layout básico cargado completamente');

        // Ejecutar callback si se proporciona
        if (options.onComplete && typeof options.onComplete === 'function') {
            console.log('🔄 Ejecutando callback de completado...');
            options.onComplete();
        }
    }

    /**
     * Inicializa el comportamiento responsive del sidebar
     */
    initializeSidebarBehavior() {
        const sidebarToggler = document.getElementById('open-sidebar');
        const sidebar = document.getElementById('sidebar');
        const pageWrapper = document.querySelector('.page-wrapper');
        
        if (sidebarToggler && sidebar && pageWrapper) {
            sidebarToggler.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    // Comportamiento en móviles: mostrar/ocultar con backdrop
                    sidebar.classList.toggle('show');
                    
                    // Cerrar sidebar al hacer click fuera
                    const backdrop = document.querySelector('.sidebar-backdrop');
                    if (sidebar.classList.contains('show') && !backdrop) {
                        const sidebarBackdrop = document.createElement('div');
                        sidebarBackdrop.className = 'sidebar-backdrop';
                        sidebarBackdrop.addEventListener('click', () => {
                            sidebar.classList.remove('show');
                            sidebarBackdrop.remove();
                        });
                        document.body.appendChild(sidebarBackdrop);
                    } else if (!sidebar.classList.contains('show') && backdrop) {
                        backdrop.remove();
                    }
                } else {
                    // Comportamiento en desktop: ocultar/mostrar sidebar completamente
                    sidebar.classList.toggle('hidden');
                    pageWrapper.classList.toggle('sidebar-hidden');
                }
            });

            // Ajustar comportamiento al cambiar tamaño de ventana
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 992) {
                    // Limpiar estado móvil
                    sidebar.classList.remove('show');
                    const backdrop = document.querySelector('.sidebar-backdrop');
                    if (backdrop) backdrop.remove();
                } else {
                    // Limpiar estado desktop
                    sidebar.classList.remove('hidden');
                    pageWrapper.classList.remove('sidebar-hidden');
                }
            });
        }
    }
}

// Crear instancia global
window.ComponentLoader = ComponentLoader;

// Auto-inicializar cuando el DOM esté listo - COMENTADO para evitar conflictos
// Ahora se maneja desde el dashboard-initializer específico
/*
document.addEventListener('DOMContentLoaded', async () => {
    const loader = new ComponentLoader();
    
    // Verificar si existe configuración de página
    if (window.pageConfig) {
        await loader.loadBasicLayout(window.pageConfig);
    }
});
*/
