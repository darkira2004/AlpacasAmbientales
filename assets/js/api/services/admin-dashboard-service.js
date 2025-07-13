/**
 * Admin Dashboard Service - Servicio para obtener datos del dashboard administrativo
 */
class AdminDashboardService {
    constructor() {
        this.baseUrl = window.CONFIG?.API_BASE_URL || 'http://localhost:8000';
        this.endpoint = window.CONFIG?.ENDPOINTS?.ADMIN_DASHBOARD || '/api/v1/admin/dashboard';
        this.authService = new AuthService();
    }

    /**
     * Obtiene los datos completos del dashboard administrativo
     * @returns {Promise<Object>} Datos del dashboard
     */
    async getDashboardData() {
        try {
            console.log('📊 Obteniendo datos del dashboard...');
            
            // Verificar token antes de hacer la petición
            const token = this.authService.getAccessToken();
            if (!token) {
                throw new Error('No hay token de autenticación disponible');
            }
            console.log('🔑 Token encontrado, longitud:', token.length);
            
            const url = `${this.baseUrl}${this.endpoint}`;
            console.log('🌐 URL del dashboard:', url);
            
            const response = await this.authService.authenticatedRequest(url, {
                method: 'GET'
            });

            console.log('📡 Respuesta recibida, status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error en respuesta:', errorText);
                
                // Manejar errores específicos
                if (response.status === 403) {
                    try {
                        const errorData = JSON.parse(errorText);
                        if (errorData.message === "Admin access required") {
                            throw new Error('ADMIN_ACCESS_REQUIRED');
                        }
                    } catch (parseError) {
                        // Si no se puede parsear, usar el mensaje original
                    }
                    throw new Error('INSUFFICIENT_PERMISSIONS');
                } else if (response.status === 401) {
                    throw new Error('AUTHENTICATION_REQUIRED');
                }
                
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('📊 Datos del dashboard obtenidos exitosamente:', data);
            return data;
        } catch (error) {
            console.error('❌ Error al obtener datos del dashboard:', error);
            throw error;
        }
    }

    /**
     * Formatea los datos para uso en gráficos
     * @param {Object} rawData - Datos crudos de la API
     * @returns {Object} Datos formateados para gráficos
     */
    formatDataForCharts(rawData) {
        return {
            overview: rawData.overview,
            
            // Datos para gráfico de categorías de residuos
            wasteCategories: {
                labels: rawData.waste_categories.map(cat => cat.category),
                series: rawData.waste_categories.map(cat => cat.total_items),
                weights: rawData.waste_categories.map(cat => cat.total_weight),
                carbonReduction: rawData.waste_categories.map(cat => cat.carbon_reduction)
            },

            // Datos para gráfico de tendencias mensuales
            monthlyTrends: {
                labels: rawData.monthly_trends.map(trend => trend.month),
                recyclingEvents: rawData.monthly_trends.map(trend => trend.recycling_events),
                weightRecycled: rawData.monthly_trends.map(trend => trend.weight_recycled),
                carbonReduced: rawData.monthly_trends.map(trend => trend.carbon_reduced),
                accuracyRate: rawData.monthly_trends.map(trend => trend.accuracy_rate)
            },

            // Top branches formateadas
            topBranches: rawData.top_branches,
            
            // Top users formateadas
            topUsers: rawData.top_users,
            
            // Actividades recientes
            recentActivities: rawData.recent_activities
        };
    }
}

// Hacer disponible globalmente
window.AdminDashboardService = AdminDashboardService;
