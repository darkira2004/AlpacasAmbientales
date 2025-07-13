/**
 * Admin Dashboard Controller - Controlador para el dashboard administrativo
 */
class AdminDashboardController {
    constructor() {
        this.dashboardService = new AdminDashboardService();
        this.charts = {};
        this.isLoading = false;
    }

    /**
     * Inicializa el controlador del dashboard
     */
    async init() {
        try {
            console.log('🎛️ Inicializando Admin Dashboard Controller...');
            
            // Verificar autenticación antes de cargar datos
            const authService = new AuthService();
            if (!authService.isAuthenticated()) {
                throw new Error('Usuario no autenticado. Redirigiendo al login...');
            }
            
            this.showLoadingState();
            await this.loadDashboardData();
            this.hideLoadingState();
            
            console.log('✅ Admin Dashboard Controller inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar Admin Dashboard Controller:', error);
            
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
     * Carga y muestra los datos del dashboard
     */
    async loadDashboardData() {
        try {
            const rawData = await this.dashboardService.getDashboardData();
            const formattedData = this.dashboardService.formatDataForCharts(rawData);
            
            this.renderOverviewCards(formattedData.overview);
            this.renderWasteCategoriesChart(formattedData.wasteCategories);
            this.renderMonthlyTrendsChart(formattedData.monthlyTrends);
            this.loadBranchesModalContent(formattedData.topBranches);
            this.loadUsersModalContent(formattedData.topUsers);
            this.loadActivitiesModalContent(formattedData.recentActivities);
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * Renderiza las tarjetas de resumen
     */
    renderOverviewCards(overview) {
        const overviewContainer = document.getElementById('overview-cards');
        if (!overviewContainer) return;

        overviewContainer.innerHTML = `
            <div class="row g-3 mb-4">
                <div class="col-md-6 col-lg-4">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-success text-white avatar">
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
                                        ${overview.total_waste_recycled.toLocaleString()} kg
                                    </div>
                                    <div class="text-muted">
                                        Total Residuos Reciclados
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 col-lg-4">
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
                                        ${overview.carbon_footprint_reduced.toLocaleString()} kg CO2
                                    </div>
                                    <div class="text-muted">
                                        Huella de Carbono Reducida
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 col-lg-4">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-primary text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-target" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                                            <path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"/>
                                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${overview.recycling_accuracy_rate.toFixed(1)}%
                                    </div>
                                    <div class="text-muted">
                                        Precisión de Reciclaje
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 col-lg-4">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-orange text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-calendar-event" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/>
                                            <path d="M16 3l0 4"/>
                                            <path d="M8 3l0 4"/>
                                            <path d="M4 11l16 0"/>
                                            <path d="M8 15h2v2h-2z"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${overview.total_recycling_events.toLocaleString()}
                                    </div>
                                    <div class="text-muted">
                                        Eventos de Reciclaje
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 col-lg-4">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-purple text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-users" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
                                            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${overview.active_users.toLocaleString()}
                                    </div>
                                    <div class="text-muted">
                                        Usuarios Activos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 col-lg-4">
                    <div class="card card-sm">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <span class="bg-warning text-white avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="col">
                                    <div class="font-weight-medium">
                                        ${overview.total_points_awarded.toLocaleString()}
                                    </div>
                                    <div class="text-muted">
                                        Puntos Totales Otorgados
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
     * Renderiza el gráfico de categorías de residuos
     */
    renderWasteCategoriesChart(wasteData) {
        const chartContainer = document.getElementById('waste-categories-chart');
        if (!chartContainer) return;

        // Limpiar contenedor antes de renderizar
        chartContainer.innerHTML = '';

        const options = {
            series: wasteData.series,
            chart: {
                type: 'donut',
                height: 350,
                fontFamily: 'inherit'
            },
            labels: wasteData.labels,
            colors: ['#FF6900', '#28a745', '#17a2b8', '#ffc107', '#6f42c1'],
            legend: {
                position: 'bottom',
                fontFamily: 'inherit'
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return Math.round(val) + "%"
                },
                style: {
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    colors: ['#ffffff']
                },
                dropShadow: {
                    enabled: false
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            name: {
                                show: false
                            },
                            value: {
                                show: true,
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                fontWeight: 'bold',
                                color: '#ffffff'
                            }
                        }
                    },
                    dataLabels: {
                        offset: 0,
                        style: {
                            colors: ['#ffffff']
                        }
                    }
                }
            }
        };

        if (this.charts.wasteCategories) {
            this.charts.wasteCategories.destroy();
        }

        this.charts.wasteCategories = new ApexCharts(chartContainer, options);
        this.charts.wasteCategories.render();
    }

    /**
     * Renderiza el gráfico de tendencias mensuales
     */
    renderMonthlyTrendsChart(trendsData) {
        const chartContainer = document.getElementById('monthly-trends-chart');
        if (!chartContainer) return;

        // Limpiar contenedor antes de renderizar
        chartContainer.innerHTML = '';

        const options = {
            series: [
                {
                    name: 'Eventos de Reciclaje',
                    type: 'column',
                    data: trendsData.recyclingEvents
                },
                {
                    name: 'Peso Reciclado (kg)',
                    type: 'line',
                    data: trendsData.weightRecycled
                },
                {
                    name: 'CO2 Reducido (kg)',
                    type: 'line',
                    data: trendsData.carbonReduced
                }
            ],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
                fontFamily: 'inherit'
            },
            stroke: {
                width: [0, 3, 3],
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            fill: {
                opacity: [0.85, 1, 1],
                gradient: {
                    inverseColors: false,
                    shade: 'light',
                    type: "vertical",
                    opacityFrom: 0.85,
                    opacityTo: 0.55,
                    stops: [0, 100, 100, 100]
                }
            },
            labels: trendsData.labels,
            markers: {
                size: 0
            },
            xaxis: {
                type: 'category',
                labels: {
                    style: {
                        fontFamily: 'inherit'
                    }
                }
            },
            yaxis: [
                {
                    title: {
                        text: 'Eventos de Reciclaje',
                        style: {
                            fontFamily: 'inherit'
                        }
                    },
                    labels: {
                        style: {
                            fontFamily: 'inherit'
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Peso (kg) / CO2 (kg)',
                        style: {
                            fontFamily: 'inherit'
                        }
                    },
                    labels: {
                        style: {
                            fontFamily: 'inherit'
                        }
                    }
                }
            ],
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (y) {
                        if (typeof y !== "undefined") {
                            return y.toFixed(0) + " units";
                        }
                        return y;
                    }
                }
            },
            colors: ['#FF6900', '#FF8533', '#FFA366'],
            legend: {
                fontFamily: 'inherit'
            }
        };

        if (this.charts.monthlyTrends) {
            this.charts.monthlyTrends.destroy();
        }

        this.charts.monthlyTrends = new ApexCharts(chartContainer, options);
        this.charts.monthlyTrends.render();
    }

    /**
     * Carga el contenido del modal de sucursales
     */
    loadBranchesModalContent(branches) {
        const modalContainer = document.getElementById('branches-modal-content');
        if (!modalContainer) return;

        let html = `
            <div class="table-responsive">
                <table class="table table-vcenter table-hover">
                    <thead style="background-color: var(--popeyes-light);">
                        <tr>
                            <th class="w-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trophy" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M8 21l8 0"/>
                                    <path d="M12 17l0 4"/>
                                    <path d="M7 4l10 0"/>
                                    <path d="M17 4v8a5 5 0 0 1 -10 0v-8"/>
                                    <path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
                                    <path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
                                </svg>
                                Rank
                            </th>
                            <th>Sucursal</th>
                            <th>Ciudad</th>
                            <th>Items Reciclados</th>
                            <th>CO2 Reducido</th>
                            <th>Precisión</th>
                            <th>Usuarios Activos</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        branches.forEach((branch, index) => {
            let badgeClass = 'bg-primary';
            let trophyIcon = '';
            
            if (index === 0) {
                badgeClass = 'bg-warning text-white';
                trophyIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trophy text-warning me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 21l8 0"/><path d="M12 17l0 4"/><path d="M7 4l10 0"/><path d="M17 4v8a5 5 0 0 1 -10 0v-8"/><path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/></svg>';
            } else if (index === 1) {
                badgeClass = 'bg-secondary text-white';
                trophyIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-award text-secondary me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"/><path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889"/><path d="M6.802 12.396l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889"/></svg>';
            } else if (index === 2) {
                badgeClass = 'bg-success text-white';
                trophyIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-medal text-success me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 4v3m-4 -3v6m8 -6v6"/><path d="M12 18.5l-3 1.5l.5 -3.5l-2 -2l3.5 -.5l1.5 -3l1.5 3l3.5 .5l-2 2l.5 3.5z"/></svg>';
            } else {
                badgeClass = 'bg-primary text-white';
            }

            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            ${trophyIcon}
                            <span class="badge badge-sm ${badgeClass}">#${branch.rank}</span>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex py-1 align-items-center">
                            <div class="flex-fill">
                                <div class="font-weight-medium">${branch.branch_name}</div>
                                <div class="text-muted text-sm">ID: ${branch.branch_id}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-map-pin me-1 text-muted" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
                                <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>
                            </svg>
                            ${branch.branch_city}
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-recycle me-1 text-success" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 17l-2 2l2 2"/>
                                <path d="M10 19h9a2 2 0 0 0 1.75 -2.75l-.55 -1"/>
                                <path d="M8.536 11l-.732 -2.732l-2.732 .732"/>
                                <path d="M7.804 8.268l4.196 4.196a2 2 0 0 1 .5 2.049l-.55 1.357"/>
                                <path d="M15.464 11l.732 -2.732l2.732 .732"/>
                                <path d="M18.196 11.732l-4.196 -4.196a2 2 0 0 0 -2.049 -.5l-1.357 .55"/>
                            </svg>
                            <strong>${branch.total_recycled_items.toLocaleString()}</strong>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-leaf me-1 text-success" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M5 21c.5 -4.5 2.5 -8 7 -10"/>
                                <path d="M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z"/>
                            </svg>
                            <strong>${branch.carbon_footprint_reduced.toLocaleString()} kg</strong>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center flex-column">
                            <div class="progress progress-xs w-100 mb-1" style="height: 6px;">
                                <div class="progress-bar" style="width: ${branch.recycling_accuracy_rate}%; background-color: var(--popeyes-primary);"></div>
                            </div>
                            <div class="text-muted text-xs">${branch.recycling_accuracy_rate.toFixed(1)}%</div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-users me-1 text-primary" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
                                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>
                            </svg>
                            ${branch.active_users_count}
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        modalContainer.innerHTML = html;
    }

    /**
     * Carga el contenido del modal de usuarios
     */
    loadUsersModalContent(users) {
        const modalContainer = document.getElementById('users-modal-content');
        if (!modalContainer) return;

        let html = `
            <div class="table-responsive">
                <table class="table table-vcenter table-hover">
                    <thead style="background-color: var(--popeyes-light);">
                        <tr>
                            <th class="w-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-award" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"/>
                                    <path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889"/>
                                    <path d="M6.802 12.396l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889"/>
                                </svg>
                                Rank
                            </th>
                            <th>Usuario</th>
                            <th>Puntos Totales</th>
                            <th>Items Reciclados</th>
                            <th>CO2 Reducido</th>
                            <th>Precisión</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        users.forEach((user, index) => {
            let badgeClass = 'bg-primary';
            let rankIcon = '';
            
            if (index === 0) {
                badgeClass = 'bg-warning text-white';
                rankIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-crown text-warning me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"/></svg>';
            } else if (index === 1) {
                badgeClass = 'bg-secondary text-white';
                rankIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-award text-secondary me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"/><path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889"/><path d="M6.802 12.396l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889"/></svg>';
            } else if (index === 2) {
                badgeClass = 'bg-success text-white';
                rankIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-medal text-success me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 4v3m-4 -3v6m8 -6v6"/><path d="M12 18.5l-3 1.5l.5 -3.5l-2 -2l3.5 -.5l1.5 -3l1.5 3l3.5 .5l-2 2l.5 3.5z"/></svg>';
            } else {
                badgeClass = 'bg-primary text-white';
            }

            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            ${rankIcon}
                            <span class="badge badge-sm ${badgeClass}">#${user.rank}</span>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex py-1 align-items-center">
                            <div class="flex-fill">
                                <div class="font-weight-medium">${user.user_name}</div>
                                <div class="text-muted text-sm">ID: ${user.user_id}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star me-1 text-warning" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>
                            </svg>
                            <span class="badge badge-lg" style="background-color: var(--popeyes-primary); color: black;">
                                ${user.total_points.toLocaleString()} pts
                            </span>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-recycle me-1 text-success" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 17l-2 2l2 2"/>
                                <path d="M10 19h9a2 2 0 0 0 1.75 -2.75l-.55 -1"/>
                                <path d="M8.536 11l-.732 -2.732l-2.732 .732"/>
                                <path d="M7.804 8.268l4.196 4.196a2 2 0 0 1 .5 2.049l-.55 1.357"/>
                                <path d="M15.464 11l.732 -2.732l2.732 .732"/>
                                <path d="M18.196 11.732l-4.196 -4.196a2 2 0 0 0 -2.049 -.5l-1.357 .55"/>
                            </svg>
                            <strong>${user.total_recycled_items.toLocaleString()}</strong>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-leaf me-1 text-success" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M5 21c.5 -4.5 2.5 -8 7 -10"/>
                                <path d="M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z"/>
                            </svg>
                            <strong>${user.carbon_footprint_reduced.toLocaleString()} kg</strong>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center flex-column">
                            <div class="progress progress-xs w-100 mb-1" style="height: 6px;">
                                <div class="progress-bar" style="width: ${user.recycling_accuracy_rate}%; background-color: var(--popeyes-primary);"></div>
                            </div>
                            <div class="text-muted text-xs">${user.recycling_accuracy_rate.toFixed(1)}%</div>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        modalContainer.innerHTML = html;
    }

    /**
     * Carga el contenido del modal de actividades recientes
     */
    loadActivitiesModalContent(activities) {
        const modalContainer = document.getElementById('activities-modal-content');
        if (!modalContainer) return;

        let html = `
            <div class="table-responsive">
                <table class="table table-vcenter table-hover">
                    <thead style="background-color: var(--popeyes-light);">
                        <tr>
                            <th class="w-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-clock" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/>
                                    <path d="M12 7v5l3 3"/>
                                </svg>
                                Tiempo
                            </th>
                            <th>Tipo de Actividad</th>
                            <th>Descripción</th>
                            <th>Usuario/Sistema</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        activities.forEach((activity, index) => {
            let activityIcon = '';
            let badgeClass = 'bg-primary';
            let activityType = activity.type || 'unknown';
            let description = activity.description || 'Sin descripción';
            let timestamp = activity.timestamp || new Date().toISOString();
            let points = activity.points || 0;
            let user = activity.user || 'Sistema';

            // Iconos y colores según tipo de actividad
            switch (activityType) {
                case 'recycling':
                    activityIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-recycle text-success me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17l-2 2l2 2"/><path d="M10 19h9a2 2 0 0 0 1.8 -2.8l-1 -1.8a2 2 0 0 0 -1.8 -1.2h-6.5"/><path d="M17 10l2 -2l-2 -2"/><path d="M19 8h-8.5a2 2 0 0 0 -1.8 1.2l-1 1.8"/><path d="M7.5 15.5l-1.8 -1.8a2 2 0 0 1 0 -2.4l1 -1.8a2 2 0 0 1 1.8 -1.2h4.5"/></svg>';
                    badgeClass = 'bg-success';
                    break;
                case 'reward_redemption':
                    activityIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-gift text-warning me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"/><path d="M12 8l0 13"/><path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.9 4.9 0 0 1 5 5a4.9 4.9 0 0 1 5 -5a2.5 2.5 0 0 1 0 5"/></svg>';
                    badgeClass = 'bg-warning';
                    break;
                case 'new_user':
                    activityIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-plus text-primary me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M16 19h6"/><path d="M19 16v6"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4"/></svg>';
                    badgeClass = 'bg-primary';
                    break;
                case 'system':
                    activityIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings text-secondary me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/></svg>';
                    badgeClass = 'bg-secondary';
                    break;
                default:
                    activityIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-activity text-primary me-1" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h4l3 8l4 -16l3 8h4"/></svg>';
                    badgeClass = 'bg-primary';
            }

            // Formatear fecha
            const date = new Date(timestamp);
            const timeString = date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const dateString = date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
            });

            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="text-center">
                                <div class="font-weight-medium">${timeString}</div>
                                <div class="text-muted text-xs">${dateString}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            ${activityIcon}
                            <span class="badge badge-sm ${badgeClass} text-white">${activityType.replace('_', ' ').toUpperCase()}</span>
                        </div>
                    </td>
                    <td>
                        <div class="text-wrap">
                            ${description}
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user me-1 text-muted" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/>
                                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                            </svg>
                            ${user}
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            ${points > 0 ? `
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star me-1 text-warning" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>
                                </svg>
                                <span class="text-warning font-weight-medium">+${points}</span>
                            ` : `
                                <span class="text-muted">-</span>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        modalContainer.innerHTML = html;
    }

    /**
     * Muestra el estado de carga
     */
    showLoadingState() {
        this.isLoading = true;
        const loadingHtml = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <div class="mt-2">Cargando datos del dashboard...</div>
            </div>
        `;
        
        const containers = ['overview-cards', 'waste-categories-chart', 'monthly-trends-chart', 'top-branches-table', 'top-users-table', 'recent-activities'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.innerHTML = loadingHtml;
        });
    }

    /**
     * Oculta el estado de carga
     */
    hideLoadingState() {
        this.isLoading = false;
        
        // Solo limpiar si realmente hay contenido de loading
        const containers = ['overview-cards', 'waste-categories-chart', 'monthly-trends-chart', 'top-branches-table', 'top-users-table', 'recent-activities'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                const loadingElement = container.querySelector('.spinner-border');
                if (loadingElement && container.innerHTML.includes('Cargando datos del dashboard')) {
                    container.innerHTML = '';
                }
            }
        });
    }

    /**
     * Muestra el estado de error
     */
    showErrorState(message) {
        const errorHtml = `
            <div class="empty">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle text-danger"></i>
                </div>
                <p class="empty-title">Error al cargar datos</p>
                <p class="empty-subtitle text-muted">${message}</p>
                <div class="empty-action">
                    <button class="btn btn-primary" onclick="adminDashboardController.loadDashboardData()">
                        <i class="fas fa-refresh me-2"></i>
                        Reintentar
                    </button>
                </div>
            </div>
        `;
        
        const containers = ['overview-cards', 'waste-categories-chart', 'monthly-trends-chart'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.innerHTML = errorHtml;
        });
    }

    /**
     * Actualiza los datos del dashboard
     */
    async refresh() {
        await this.loadDashboardData();
    }
}

// Hacer disponible globalmente
window.AdminDashboardController = AdminDashboardController;
