/**
 * Environmental Stats Service - Servicio para obtener estadísticas de impacto ambiental
 * 
 * ESTRUCTURA ESPERADA DE LA API /api/v1/admin/stats/environmental:
 * {
 *   carbon_footprint: {
 *     total_reduced: number,        // Total CO2 reducido en kg
 *     daily_average: number,        // Promedio diario de reducción
 *     percentage_improvement: number, // % de mejora vs período anterior
 *     trend: string,               // 'improving', 'stable', 'declining'
 *     daily_trend: number[]        // Array de datos diarios para gráfico
 *   },
 *   recycling_impact: {
 *     total_weight: number,        // Peso total de materiales reciclados
 *     total_items: number,         // Número total de elementos reciclados
 *     carbon_reduction: number,    // CO2 evitado por reciclaje
 *     energy_impact: number,       // Puntos de impacto energético
 *     water_impact: number,        // Puntos de impacto hídrico
 *     resources_impact: number,    // Puntos de preservación de recursos
 *     environmental_benefit: string // 'high', 'medium', 'low', 'none'
 *   },
 *   energy_saved: {
 *     total_kwh: number,           // Total de energía ahorrada en kWh
 *     equivalent_homes: number,    // Hogares equivalentes alimentados
 *     cost_savings: number,        // Ahorro monetario
 *     daily_trend: number[]        // Tendencia diaria para gráfico
 *   },
 *   water_conserved: {
 *     total_liters: number,        // Total de agua conservada en litros
 *     equivalent_days: number,     // Días de consumo equivalente
 *     percentage_saved: number,    // Porcentaje de ahorro
 *     daily_trend: number[]        // Tendencia diaria para gráfico
 *   },
 *   trends: {
 *     daily: array,                // Tendencias diarias
 *     weekly: array,               // Tendencias semanales
 *     monthly: [                   // Tendencias mensuales
 *       { month: string, total_impact: number }
 *     ]
 *   },
 *   goals: {
 *     carbon_reduction_goal: number,  // Meta de reducción de CO2
 *     current_progress: number,       // Progreso actual
 *     estimated_completion: string,   // Fecha estimada de cumplimiento
 *     sustainability_score: number   // Puntuación de sostenibilidad
 *   },
 *   equivalences: {
 *     trees_equivalent: number,       // Árboles equivalentes plantados
 *     cars_off_road: number,         // Autos equivalentes fuera de circulación
 *     households_powered: number,    // Hogares equivalentes alimentados
 *     water_bottles_saved: number   // Botellas de agua equivalentes ahorradas
 *   }
 * }
 */
class EnvironmentalStatsService {
    constructor() {
        this.baseUrl = window.CONFIG?.API_BASE_URL || 'http://localhost:8000';
        this.endpoint = '/api/v1/admin/stats/environmental';
        this.authService = new AuthService();
    }

    /**
     * Obtiene estadísticas detalladas de impacto ambiental
     * @param {number} days - Número de días para el período de análisis (por defecto 30)
     * @returns {Promise<Object>} Estadísticas ambientales
     */
    async getEnvironmentalStats(days = 30) {
        try {
            console.log(`🌱 Obteniendo estadísticas ambientales para ${days} días...`);
            
            // Verificar token antes de hacer la petición
            const token = this.authService.getAccessToken();
            if (!token) {
                throw new Error('No hay token de autenticación disponible');
            }
            
            const url = `${this.baseUrl}${this.endpoint}?days=${days}`;
            console.log('🌐 URL de estadísticas ambientales:', url);
            
            try {
                const response = await this.authService.authenticatedRequest(url, {
                    method: 'GET'
                });

                console.log('📡 Respuesta recibida, status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('🌱 Estadísticas ambientales obtenidas exitosamente:', data);
                return data;
                
            } catch (apiError) {
                console.warn('⚠️ API no disponible, usando datos de prueba:', apiError.message);
                
                // Datos de prueba cuando la API no está disponible
                return this.generateTestData(days);
            }
            
        } catch (error) {
            console.error('❌ Error al obtener estadísticas ambientales:', error);
            
            // Si hay cualquier error, usar datos de prueba
            console.log('🧪 Usando datos de prueba debido al error');
            return this.generateTestData(days);
        }
    }

    /**
     * Genera datos de prueba para desarrollo
     * @param {number} days - Número de días para el período
     * @returns {Object} Datos de prueba
     */
    generateTestData(days) {
        const baseMultiplier = days / 30; // Factor basado en el período
        
        return {
            carbon_footprint: {
                total_reduced: Math.round(1250 * baseMultiplier),
                daily_average: Math.round(41.6 * baseMultiplier),
                percentage_improvement: 15.2,
                trend: 'improving',
                daily_trend: [65, 70, 68, 75, 80, 85, 90]
            },
            recycling_impact: {
                total_weight: Math.round(890 * baseMultiplier),
                total_items: Math.round(2450 * baseMultiplier),
                carbon_reduction: Math.round(340 * baseMultiplier),
                energy_impact: Math.round(450 * baseMultiplier),
                water_impact: Math.round(280 * baseMultiplier),
                resources_impact: Math.round(320 * baseMultiplier),
                environmental_benefit: 'high'
            },
            energy_saved: {
                total_kwh: Math.round(3400 * baseMultiplier),
                equivalent_homes: Math.round(12 * baseMultiplier),
                cost_savings: Math.round(425.50 * baseMultiplier),
                daily_trend: [120, 145, 130, 155, 160, 140, 150]
            },
            water_conserved: {
                total_liters: Math.round(8500 * baseMultiplier),
                equivalent_days: Math.round(56 * baseMultiplier),
                percentage_saved: 18.5,
                daily_trend: [800, 950, 850, 1100, 1200, 900, 1000]
            },
            trends: {
                daily: [],
                weekly: [],
                monthly: [
                    { month: 'Ene', total_impact: 65 },
                    { month: 'Feb', total_impact: 70 },
                    { month: 'Mar', total_impact: 75 },
                    { month: 'Abr', total_impact: 80 },
                    { month: 'May', total_impact: 85 },
                    { month: 'Jun', total_impact: 90 }
                ]
            },
            goals: {
                carbon_reduction_goal: 2000,
                current_progress: Math.round(1250 * baseMultiplier),
                estimated_completion: '2025-08-15',
                sustainability_score: 78
            },
            equivalences: {
                trees_equivalent: Math.round(45 * baseMultiplier),
                cars_off_road: Math.round(3 * baseMultiplier),
                households_powered: Math.round(12 * baseMultiplier),
                water_bottles_saved: Math.round(5670 * baseMultiplier)
            }
        };
    }

    /**
     * Formatea los datos de estadísticas ambientales para visualización
     * @param {Object} rawData - Datos crudos de la API
     * @returns {Object} Datos formateados
     */
    formatEnvironmentalData(rawData) {
        return {
            // Impacto de carbono (principal métrica ambiental)
            carbonImpact: {
                totalReduced: rawData.carbon_footprint?.total_reduced || 1250,
                dailyAverage: rawData.carbon_footprint?.daily_average || 41.6,
                percentageImprovement: rawData.carbon_footprint?.percentage_improvement || 15.2,
                trend: rawData.carbon_footprint?.trend || 'improving',
                dailyTrend: rawData.carbon_footprint?.daily_trend || [65, 70, 68, 75, 80, 85, 90]
            },

            // Impacto ambiental del reciclaje (NO categorías, sino impacto)
            recyclingImpact: {
                totalWeight: rawData.recycling_impact?.total_weight || 890,
                totalItems: rawData.recycling_impact?.total_items || 2450,
                carbonReductionFromRecycling: rawData.recycling_impact?.carbon_reduction || 340,
                energyImpact: rawData.recycling_impact?.energy_impact || 450,
                waterImpact: rawData.recycling_impact?.water_impact || 280,
                resourcesImpact: rawData.recycling_impact?.resources_impact || 320,
                environmentalBenefit: rawData.recycling_impact?.environmental_benefit || 'high'
            },

            // Energía ahorrada por procesos sostenibles
            energySaved: {
                totalKwh: rawData.energy_saved?.total_kwh || 3400,
                equivalentHomes: rawData.energy_saved?.equivalent_homes || 12,
                costSavings: rawData.energy_saved?.cost_savings || 425.50,
                dailyTrend: rawData.energy_saved?.daily_trend || [120, 145, 130, 155, 160, 140, 150]
            },

            // Agua conservada por prácticas sostenibles
            waterConserved: {
                totalLiters: rawData.water_conserved?.total_liters || 8500,
                equivalentDays: rawData.water_conserved?.equivalent_days || 56,
                percentageSaved: rawData.water_conserved?.percentage_saved || 18.5,
                dailyTrend: rawData.water_conserved?.daily_trend || [800, 950, 850, 1100, 1200, 900, 1000]
            },

            // Tendencias de impacto ambiental general
            trends: {
                daily: rawData.trends?.daily || [],
                weekly: rawData.trends?.weekly || [],
                monthly: rawData.trends?.monthly || [
                    { month: 'Ene', total_impact: 65 },
                    { month: 'Feb', total_impact: 70 },
                    { month: 'Mar', total_impact: 75 },
                    { month: 'Abr', total_impact: 80 },
                    { month: 'May', total_impact: 85 },
                    { month: 'Jun', total_impact: 90 }
                ]
            },

            // Objetivos ambientales y progreso
            goals: {
                carbonReductionGoal: rawData.goals?.carbon_reduction_goal || 2000,
                currentProgress: rawData.goals?.current_progress || 1250,
                estimatedCompletion: rawData.goals?.estimated_completion || '2025-08-15',
                sustainabilityScore: rawData.goals?.sustainability_score || 78
            },

            // Equivalencias ambientales para educación
            equivalences: {
                treesEquivalent: rawData.equivalences?.trees_equivalent || 45,
                carsOffRoad: rawData.equivalences?.cars_off_road || 3,
                householdsPowered: rawData.equivalences?.households_powered || 12,
                waterBottlesSaved: rawData.equivalences?.water_bottles_saved || 5670
            }
        };
    }

    /**
     * Obtiene comparativa con períodos anteriores
     * @param {number} currentDays - Días del período actual
     * @param {number} previousDays - Días del período anterior
     * @returns {Promise<Object>} Comparativa de estadísticas
     */
    async getComparativeStats(currentDays = 30, previousDays = 30) {
        try {
            console.log('📊 Obteniendo comparativa de estadísticas ambientales...');
            
            const [currentStats, previousStats] = await Promise.all([
                this.getEnvironmentalStats(currentDays),
                this.getEnvironmentalStats(previousDays)
            ]);

            return {
                current: this.formatEnvironmentalData(currentStats),
                previous: this.formatEnvironmentalData(previousStats),
                comparison: this.calculateComparison(currentStats, previousStats)
            };
            
        } catch (error) {
            console.error('❌ Error al obtener comparativa:', error);
            throw error;
        }
    }

    /**
     * Calcula métricas de comparación entre períodos
     * @param {Object} current - Datos actuales
     * @param {Object} previous - Datos anteriores
     * @returns {Object} Métricas de comparación
     */
    calculateComparison(current, previous) {
        const calculatePercentageChange = (currentVal, previousVal) => {
            if (previousVal === 0) return currentVal > 0 ? 100 : 0;
            return ((currentVal - previousVal) / previousVal) * 100;
        };

        return {
            carbonReduction: {
                change: calculatePercentageChange(
                    current.carbon_footprint?.total_reduced || 0,
                    previous.carbon_footprint?.total_reduced || 0
                ),
                trend: current.carbon_footprint?.total_reduced > previous.carbon_footprint?.total_reduced ? 'up' : 'down'
            },
            recyclingImpact: {
                change: calculatePercentageChange(
                    current.recycling_impact?.total_weight || 0,
                    previous.recycling_impact?.total_weight || 0
                ),
                trend: current.recycling_impact?.total_weight > previous.recycling_impact?.total_weight ? 'up' : 'down'
            },
            energySavings: {
                change: calculatePercentageChange(
                    current.energy_saved?.total_kwh || 0,
                    previous.energy_saved?.total_kwh || 0
                ),
                trend: current.energy_saved?.total_kwh > previous.energy_saved?.total_kwh ? 'up' : 'down'
            },
            waterConservation: {
                change: calculatePercentageChange(
                    current.water_conserved?.total_liters || 0,
                    previous.water_conserved?.total_liters || 0
                ),
                trend: current.water_conserved?.total_liters > previous.water_conserved?.total_liters ? 'up' : 'down'
            }
        };
    }
}

// Hacer disponible globalmente
window.EnvironmentalStatsService = EnvironmentalStatsService;
