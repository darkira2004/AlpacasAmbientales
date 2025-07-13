/**
 * Environmental Stats Controller - Controlador para estadísticas de impacto ambiental
 */
class EnvironmentalStatsController {
    constructor() {
        this.environmentalService = new EnvironmentalStatsService();
        this.charts = {};
        this.isLoading = false;
        this.currentPeriod = 30; // Días por defecto
    }

    /**
     * Inicializa el controlador de estadísticas ambientales
     */
    async init() {
        try {
            console.log('🌱 Inicializando Environmental Stats Controller...');
            
            // Verificar autenticación antes de cargar datos
            const authService = new AuthService();
            if (!authService.isAuthenticated()) {
                throw new Error('Usuario no autenticado. Redirigiendo al login...');
            }
            
            this.setupEventListeners();
            this.showLoadingState();
            await this.loadEnvironmentalData();
            this.hideLoadingState();
            
            console.log('✅ Environmental Stats Controller inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar Environmental Stats Controller:', error);
            
            if (error.message.includes('autenticado')) {
                // Redirigir al login si no está autenticado
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
            }
            
            this.showErrorState(error.message);
        }
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Selector de período
        const periodSelector = document.getElementById('period-selector');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.changePeriod(parseInt(e.target.value));
            });
        }

        // Botón de actualizar
        const refreshBtn = document.getElementById('refresh-environmental-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }

        // Botón de comparar períodos
        const compareBtn = document.getElementById('compare-periods');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.showComparison();
            });
        }

        // Botón de Equivalencias
        const equivalencesBtn = document.getElementById('show-equivalences');
        if (equivalencesBtn) {
            equivalencesBtn.addEventListener('click', () => {
                this.showEquivalencesModal();
            });
        }

        // Botón de Logros
        const achievementsBtn = document.getElementById('show-achievements');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => {
                this.showAchievementsModal();
            });
        }

        // Botón de Objetivos
        const goalsBtn = document.getElementById('show-goals');
        if (goalsBtn) {
            goalsBtn.addEventListener('click', () => {
                this.showGoalsModal();
            });
        }
    }

    /**
     * Carga y muestra los datos de estadísticas ambientales
     */
    async loadEnvironmentalData() {
        try {
            const rawData = await this.environmentalService.getEnvironmentalStats(this.currentPeriod);
            const formattedData = this.environmentalService.formatEnvironmentalData(rawData);
            
            this.renderOverviewCards(formattedData);
            this.renderCarbonImpactChart(formattedData.carbonImpact);
            this.renderSustainabilityChart(formattedData.recyclingImpact);
            this.renderEnergyWaterChart(formattedData.energySaved, formattedData.waterConserved);
            this.renderTrendsChart(formattedData.trends);
            this.renderGoalsProgress(formattedData.goals);
            
            // Guardar datos ambientales para uso en modales
            this.environmentalData = formattedData;
            
        } catch (error) {
            console.error('❌ Error cargando datos de estadísticas ambientales:', error);
            throw error;
        }
    }

    /**
     * Renderiza las tarjetas de resumen ambiental
     */
    renderOverviewCards(data) {
        const container = document.getElementById('environmental-overview-cards');
        if (!container) return;

        container.innerHTML = `
            <div class="row g-3 mb-4">
                <!-- CO2 Reducido -->
                <div class="col-md-6 col-lg-3">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-success text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-leaf" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M5 21c.5 -4.5 2.5 -8 7 -10"/>
                                            <path d="M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${data.carbonImpact.totalReduced.toLocaleString()} kg
                                    </div>
                                    <div class="text-muted">
                                        CO2 Reducido
                                    </div>
                                    <div class="text-success small">
                                        <i class="fas fa-arrow-up"></i> ${data.carbonImpact.percentageImprovement}% vs período anterior
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Residuos Procesados -->
                <div class="col-md-6 col-lg-3">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-warning text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-recycle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M12 17l-2 2l2 2"/>
                                            <path d="M10 19h9a2 2 0 0 0 1.8 -2.8l-1 -1.8a2 2 0 0 0 -1.8 -1.2h-6.5"/>
                                            <path d="M17 10l2 -2l-2 -2"/>
                                            <path d="M19 8h-8.5a2 2 0 0 0 -1.8 1.2l-1 1.8"/>
                                            <path d="M7.5 15.5l-1.8 -1.8a2 2 0 0 1 0 -2.4l1 -1.8a2 2 0 0 1 1.8 -1.2h4.5"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${data.recyclingImpact.totalWeight.toLocaleString()} kg
                                    </div>
                                    <div class="text-muted">
                                        Materiales Reciclados
                                    </div>
                                    <div class="text-success small">
                                        <i class="fas fa-leaf"></i> ${data.recyclingImpact.carbonReductionFromRecycling} kg CO2 evitados
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Energía Ahorrada -->
                <div class="col-md-6 col-lg-3">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-primary text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bolt" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M13 3v7h6l-8 11v-7h-6l8 -11"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${data.energySaved.totalKwh.toLocaleString()} kWh
                                    </div>
                                    <div class="text-muted">
                                        Energía Ahorrada
                                    </div>
                                    <div class="text-primary small">
                                        ≈ ${data.energySaved.equivalentHomes} hogares
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Agua Conservada -->
                <div class="col-md-6 col-lg-3">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-info text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-droplet" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M12 3l5 5a7 7 0 1 1 -10 0l5 -5"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${data.waterConserved.totalLiters.toLocaleString()} L
                                    </div>
                                    <div class="text-muted">
                                        Agua Conservada
                                    </div>
                                    <div class="text-info small">
                                        ≈ ${data.waterConserved.equivalentDays} días persona
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza el gráfico de impacto de carbono
     */
    renderCarbonImpactChart(carbonData) {
        const chartContainer = document.getElementById('carbon-impact-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = '';

        const options = {
            series: [{
                name: 'CO2 Reducido (kg)',
                data: carbonData.dailyTrend || []
            }],
            chart: {
                type: 'area',
                height: 300,
                fontFamily: 'inherit',
                toolbar: { show: false }
            },
            colors: ['#28a745'],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100]
                }
            },
            xaxis: {
                categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
            },
            yaxis: {
                title: {
                    text: 'CO2 Reducido (kg)'
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " kg de CO2"
                    }
                }
            }
        };

        if (this.charts.carbonImpact) {
            this.charts.carbonImpact.destroy();
        }

        this.charts.carbonImpact = new ApexCharts(chartContainer, options);
        this.charts.carbonImpact.render();
    }

    /**
     * Renderiza el gráfico de impacto de sostenibilidad
     */
    renderSustainabilityChart(recyclingData) {
        const chartContainer = document.getElementById('waste-processing-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = '';

        // Datos de impacto de sostenibilidad (no categorías de residuos)
        const sustainabilityMetrics = [
            { name: 'Reducción CO2', value: recyclingData.carbonReductionFromRecycling || 0, color: '#28a745' },
            { name: 'Energía Ahorrada', value: recyclingData.energyImpact || 0, color: '#007bff' },
            { name: 'Agua Conservada', value: recyclingData.waterImpact || 0, color: '#17a2b8' },
            { name: 'Recursos Preservados', value: recyclingData.resourcesImpact || 0, color: '#ffc107' }
        ];

        const options = {
            series: sustainabilityMetrics.map(metric => metric.value),
            chart: {
                type: 'donut',
                height: 300,
                fontFamily: 'inherit'
            },
            labels: sustainabilityMetrics.map(metric => metric.name),
            colors: sustainabilityMetrics.map(metric => metric.color),
            legend: {
                position: 'bottom',
                fontFamily: 'inherit'
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Impacto Total',                            formatter: function () {
                                const total = sustainabilityMetrics.reduce((sum, metric) => sum + metric.value, 0);
                                return total.toLocaleString() + ' pts';
                            }
                            }
                        }
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " puntos de impacto"
                    }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#ffffff']
                }
            }
        };

        if (this.charts.wasteProcessing) {
            this.charts.wasteProcessing.destroy();
        }

        this.charts.wasteProcessing = new ApexCharts(chartContainer, options);
        this.charts.wasteProcessing.render();
    }

    /**
     * Renderiza el gráfico combinado de energía y agua
     */
    renderEnergyWaterChart(energyData, waterData) {
        const chartContainer = document.getElementById('energy-water-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = '';

        const options = {
            series: [{
                name: 'Energía (kWh)',
                type: 'column',
                data: energyData.dailyTrend || []
            }, {
                name: 'Agua (L)',
                type: 'line',
                data: waterData.dailyTrend || []
            }],
            chart: {
                height: 300,
                type: 'line',
                fontFamily: 'inherit',
                toolbar: { show: false }
            },
            colors: ['#007bff', '#17a2b8'],
            stroke: {
                width: [0, 4]
            },
            xaxis: {
                categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
            },
            yaxis: [{
                title: {
                    text: 'Energía (kWh)'
                }
            }, {
                opposite: true,
                title: {
                    text: 'Agua (Litros)'
                }
            }]
        };

        if (this.charts.energyWater) {
            this.charts.energyWater.destroy();
        }

        this.charts.energyWater = new ApexCharts(chartContainer, options);
        this.charts.energyWater.render();
    }

    /**
     * Renderiza el gráfico de tendencias
     */
    renderTrendsChart(trendsData) {
        const chartContainer = document.getElementById('trends-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = '';

        const options = {
            series: [{
                name: 'Impacto Ambiental',
                data: trendsData.monthly?.map(t => t.total_impact) || []
            }],
            chart: {
                type: 'line',
                height: 250,
                fontFamily: 'inherit',
                sparkline: { enabled: true }
            },
            colors: ['#28a745'],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " puntos de impacto"
                    }
                }
            }
        };

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        this.charts.trends = new ApexCharts(chartContainer, options);
        this.charts.trends.render();
    }

    /**
     * Renderiza el progreso de objetivos
     */
    renderGoalsProgress(goalsData) {
        const container = document.getElementById('goals-progress');
        if (!container) return;

        const progressPercentage = (goalsData.currentProgress / goalsData.carbonReductionGoal) * 100;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Objetivos Ambientales</h3>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <span class="avatar avatar-sm bg-success text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-target" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <circle cx="12" cy="12" r="1"/>
                                        <circle cx="12" cy="12" r="5"/>
                                        <circle cx="12" cy="12" r="9"/>
                                    </svg>
                                </span>
                            </div>
                            <div class="col">
                                <div class="font-weight-medium">Reducción de CO2</div>
                                <div class="text-muted">Meta: ${goalsData.carbonReductionGoal.toLocaleString()} kg</div>
                            </div>
                            <div class="col-auto">
                                <div class="text-end">
                                    <div class="text-success font-weight-medium">${progressPercentage.toFixed(1)}%</div>
                                    <div class="text-muted">${goalsData.currentProgress.toLocaleString()} kg</div>
                                </div>
                            </div>
                        </div>
                        <div class="progress mt-2">
                            <div class="progress-bar bg-success" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                    ${goalsData.estimatedCompletion ? `
                    <div class="text-muted small">
                        <i class="fas fa-calendar"></i> Estimación de cumplimiento: ${new Date(goalsData.estimatedCompletion).toLocaleDateString()}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Cambia el período de análisis
     */
    async changePeriod(days) {
        this.currentPeriod = days;
        this.showLoadingState();
        try {
            await this.loadEnvironmentalData();
        } catch (error) {
            this.showErrorState(error.message);
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Muestra comparación entre períodos
     */
    async showComparison() {
        try {
            this.showLoadingState();
            const comparison = await this.environmentalService.getComparativeStats(this.currentPeriod, this.currentPeriod);
            this.renderComparisonModal(comparison);
        } catch (error) {
            this.showErrorState(error.message);
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Renderiza el modal de comparación
     */
    renderComparisonModal(comparisonData) {
        // Implementar modal de comparación
        console.log('Datos de comparación:', comparisonData);
        // TODO: Crear modal con gráficos comparativos
    }

    /**
     * Actualiza todos los datos
     */
    async refresh() {
        this.showLoadingState();
        try {
            await this.loadEnvironmentalData();
            console.log('🔄 Datos de estadísticas ambientales actualizados');
        } catch (error) {
            this.showErrorState(error.message);
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Muestra estado de carga
     */
    showLoadingState() {
        this.isLoading = true;
        const containers = [
            'environmental-overview-cards', 
            'carbon-impact-chart', 
            'waste-processing-chart', 
            'energy-water-chart', 
            'trends-chart', 
            'goals-progress'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
                        <div class="spinner-border text-success" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                `;
            }
        });
    }

    /**
     * Oculta estado de carga
     */
    hideLoadingState() {
        this.isLoading = false;
    }

    /**
     * Muestra estado de error
     */
    showErrorState(message) {
        const containers = [
            'environmental-overview-cards', 
            'carbon-impact-chart', 
            'waste-processing-chart', 
            'energy-water-chart', 
            'trends-chart', 
            'goals-progress'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <div class="d-flex">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <circle cx="12" cy="12" r="9"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="alert-title">Error al cargar estadísticas ambientales</h4>
                                <div class="text-muted">${message}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }

    /**
     * Muestra el modal de equivalencias e impacto
     */
    showEquivalencesModal() {
        // Actualizar datos dinámicamente
        this.updateEquivalencesData();
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('equivalences-modal'));
        modal.show();
    }

    /**
     * Muestra el modal de logros ambientales
     */
    showAchievementsModal() {
        // Actualizar datos dinámicamente
        this.updateAchievementsData();
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('achievements-modal'));
        modal.show();
    }

    /**
     * Muestra el modal de objetivos ambientales
     */
    showGoalsModal() {
        // Actualizar datos dinámicamente si es necesario
        this.updateGoalsData();
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('goals-modal'));
        modal.show();
    }

    /**
     * Actualiza los datos de equivalencias en el modal
     */
    updateEquivalencesData() {
        if (!this.environmentalData) return;

        const equivalences = this.environmentalData.equivalences;
        
        // Actualizar equivalencias en el modal
        const treesEl = document.getElementById('trees-equivalent');
        const homesEl = document.getElementById('homes-powered');
        const carsEl = document.getElementById('cars-off-road');
        const waterEl = document.getElementById('water-bottles-saved');

        if (treesEl) treesEl.textContent = `Plantar ${equivalences.treesEquivalent} árboles`;
        if (homesEl) homesEl.textContent = `Alimentar ${equivalences.householdsPowered} hogares por un día`;
        if (carsEl) carsEl.textContent = `${equivalences.carsOffRoad} autos menos en circulación`;
        if (waterEl) waterEl.textContent = `${equivalences.waterBottlesSaved.toLocaleString()} botellas de agua ahorradas`;
    }

    /**
     * Actualiza los datos de logros en el modal
     */
    updateAchievementsData() {
        if (!this.environmentalData) return;

        const goals = this.environmentalData.goals;
        const equivalences = this.environmentalData.equivalences;
        
        // Actualizar progreso de CO2
        const currentProgress = goals.currentProgress || 1250;
        const goalTarget = goals.carbonReductionGoal || 2000;
        const progressPercentage = Math.round((currentProgress / goalTarget) * 100);
        
        // Elementos del progreso de CO2
        const currentProgressEl = document.getElementById('co2-current-progress');
        const goalTargetEl = document.getElementById('co2-goal-target');
        const progressBarEl = document.getElementById('co2-progress-bar');
        const progressPercentageEl = document.getElementById('co2-progress-percentage');
        const goalTextEl = document.getElementById('co2-goal-text');
        const estimatedCompletionEl = document.getElementById('estimated-completion');
        
        if (currentProgressEl) currentProgressEl.textContent = `${currentProgress.toLocaleString()} kg de CO2 reducidos`;
        if (goalTargetEl) goalTargetEl.textContent = `${goalTarget.toLocaleString()} kg de CO2`;
        if (progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;
        if (progressPercentageEl) progressPercentageEl.textContent = `${progressPercentage}%`;
        if (goalTextEl) goalTextEl.textContent = `${goalTarget.toLocaleString()} kg`;
        if (estimatedCompletionEl) {
            const completionDate = new Date(goals.estimatedCompletion || '2025-08-15');
            estimatedCompletionEl.textContent = completionDate.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        // Actualizar equivalencias
        const treesEquivEl = document.getElementById('trees-equiv-count');
        const sustainabilityScoreEl = document.getElementById('sustainability-score');
        const homesPoweredEl = document.getElementById('homes-powered-count');
        
        if (treesEquivEl) treesEquivEl.textContent = equivalences.treesEquivalent || 45;
        if (sustainabilityScoreEl) sustainabilityScoreEl.textContent = goals.sustainabilityScore || 78;
        if (homesPoweredEl) homesPoweredEl.textContent = equivalences.householdsPowered || 12;
    }

    /**
     * Actualiza los datos de objetivos en el modal
     */
    updateGoalsData() {
        // Los datos están estáticos en el HTML por ahora
        // En el futuro se pueden actualizar dinámicamente desde la API
        console.log('📊 Datos de objetivos actualizados');
    }
}

// Hacer disponible globalmente
window.EnvironmentalStatsController = EnvironmentalStatsController;
