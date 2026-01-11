import { DashboardService } from '../services/dashboard.service.js';
import { Formatters } from '../utils/formatters.js';

export const DashboardModule = {
    render: async () => {
        return `
            <style>
                .dashboard-page {
                    padding: 0;
                }

                .dashboard-header {
                    margin-bottom: 28px;
                }

                .dashboard-header h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin: 0 0 4px 0;
                    letter-spacing: -0.02em;
                }

                .dashboard-header p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 0;
                }

                /* Stats Grid - Modern Cards */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                }

                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    border-radius: 20px 20px 0 0;
                }

                .stat-card.blue::before { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
                .stat-card.purple::before { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }
                .stat-card.amber::before { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
                .stat-card.green::before { background: linear-gradient(90deg, #10B981, #34D399); }
                .stat-card.rose::before { background: linear-gradient(90deg, #F43F5E, #FB7185); }
                .stat-card.cyan::before { background: linear-gradient(90deg, #06B6D4, #22D3EE); }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    margin-bottom: 16px;
                }

                .stat-card.blue .stat-icon { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
                .stat-card.purple .stat-icon { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }
                .stat-card.amber .stat-icon { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }
                .stat-card.green .stat-icon { background: rgba(16, 185, 129, 0.12); color: #10B981; }
                .stat-card.rose .stat-icon { background: rgba(244, 63, 94, 0.12); color: #F43F5E; }
                .stat-card.cyan .stat-icon { background: rgba(6, 182, 212, 0.12); color: #06B6D4; }

                .stat-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-main);
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }

                .stat-value.money {
                    font-size: 1.5rem;
                    background: linear-gradient(135deg, #10B981, #059669);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .stat-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                /* Sections Grid */
                .sections-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                @media (max-width: 900px) {
                    .sections-grid { grid-template-columns: 1fr; }
                }

                /* Mobile Responsive */
                @media (max-width: 600px) {
                    .dashboard-page {
                        padding: 0;
                        overflow-x: hidden;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .dashboard-header {
                        margin-bottom: 20px;
                    }

                    .dashboard-header h2 {
                        font-size: 1.4rem;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                        margin-bottom: 20px;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .stat-card {
                        padding: 14px;
                        border-radius: 16px;
                        box-sizing: border-box;
                        min-width: 0;
                    }

                    .stat-card:hover {
                        transform: none;
                    }

                    .stat-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 0.9rem;
                        margin-bottom: 10px;
                    }

                    .stat-value {
                        font-size: 1.3rem;
                    }

                    .stat-value.money {
                        font-size: 1rem;
                        word-break: break-word;
                    }

                    .stat-label {
                        font-size: 0.6rem;
                    }

                    .stat-subtitle {
                        font-size: 0.65rem;
                    }

                    .sections-grid {
                        gap: 16px;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .section-card {
                        padding: 14px;
                        border-radius: 16px;
                        width: 100%;
                        box-sizing: border-box;
                        overflow: hidden;
                    }

                    .section-title {
                        font-size: 0.9rem;
                        margin-bottom: 14px;
                    }

                    .section-title i {
                        width: 26px;
                        height: 26px;
                        font-size: 0.75rem;
                        flex-shrink: 0;
                    }

                    .leads-list,
                    .goals-list {
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .lead-item {
                        padding: 12px;
                        gap: 12px;
                        width: 100%;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                    }

                    .lead-avatar {
                        width: 40px;
                        height: 40px;
                        font-size: 0.9rem;
                        flex-shrink: 0;
                    }

                    .lead-info {
                        flex: 1;
                        min-width: 0;
                        overflow: hidden;
                    }

                    .lead-name {
                        font-size: 0.85rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .lead-company {
                        font-size: 0.72rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .lead-value {
                        font-size: 0.8rem;
                        font-weight: 700;
                        white-space: nowrap;
                        flex-shrink: 0;
                        text-align: right;
                        padding-left: 8px;
                    }

                    .goal-item {
                        padding: 12px;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .goal-header {
                        flex-wrap: wrap;
                        gap: 4px;
                    }

                    .goal-name {
                        font-size: 0.8rem;
                        flex: 1;
                        min-width: 0;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .goal-percent {
                        font-size: 0.8rem;
                        flex-shrink: 0;
                    }

                    .goal-values {
                        font-size: 0.65rem;
                    }

                    .goal-values span {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 45%;
                    }
                }

                @media (max-width: 380px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .stat-value.money {
                        font-size: 0.95rem;
                    }

                    .lead-avatar {
                        width: 36px;
                        height: 36px;
                    }

                    .lead-name {
                        font-size: 0.8rem;
                    }

                    .lead-value {
                        font-size: 0.75rem;
                    }
                }

                .section-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    padding: 24px;
                }

                .section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0 0 20px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .section-title i {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                }

                .section-title.leads i { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }
                .section-title.goals i { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }

                /* Recent Leads List */
                .leads-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .lead-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px;
                    background: var(--bg-body);
                    border-radius: 14px;
                    transition: all 0.2s;
                }

                .lead-item:hover {
                    background: var(--border-color);
                }

                .lead-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #8B5CF6, #A78BFA);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .lead-info {
                    flex: 1;
                    min-width: 0;
                }

                .lead-name {
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.9rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .lead-company {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .lead-value {
                    font-weight: 700;
                    color: #10B981;
                    font-size: 0.9rem;
                    text-align: right;
                }

                /* Goals Progress */
                .goals-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .goal-item {
                    padding: 16px;
                    background: var(--bg-body);
                    border-radius: 14px;
                }

                .goal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .goal-name {
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.9rem;
                }

                .goal-percent {
                    font-weight: 700;
                    font-size: 0.9rem;
                }

                .goal-percent.low { color: #EF4444; }
                .goal-percent.mid { color: #F59E0B; }
                .goal-percent.high { color: #10B981; }

                .goal-progress-bar {
                    height: 8px;
                    background: var(--border-color);
                    border-radius: 10px;
                    overflow: hidden;
                }

                .goal-progress-fill {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 0.5s ease;
                }

                .goal-progress-fill.low { background: linear-gradient(90deg, #EF4444, #F87171); }
                .goal-progress-fill.mid { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
                .goal-progress-fill.high { background: linear-gradient(90deg, #10B981, #34D399); }

                .goal-values {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .empty-state {
                    text-align: center;
                    padding: 30px 20px;
                    color: var(--text-muted);
                }

                .empty-state i {
                    font-size: 2rem;
                    opacity: 0.3;
                    margin-bottom: 10px;
                }

                /* Dark mode adjustments */
                .theme-dark .stat-card {
                    background: var(--bg-card);
                    border-color: var(--border-color);
                }

                .theme-dark .stat-card:hover {
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }

                .theme-dark .stat-value.money {
                    background: linear-gradient(135deg, #34D399, #10B981);
                    -webkit-background-clip: text;
                    background-clip: text;
                }
            </style>

            <div class="dashboard-page">
                <div class="dashboard-header">
                    <h2>Dashboard</h2>
                    <p>Resumen de tu negocio</p>
                </div>

                <div id="dashboardContent">
                    <div class="stats-grid">
                        ${[1, 2, 3, 4, 5, 6].map(() => `
                            <div class="stat-card" style="opacity: 0.5;">
                                <div style="height: 120px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-spinner fa-spin" style="color: var(--text-muted);"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    init: async () => {
        await DashboardModule.loadData();
    },

    loadData: async () => {
        const container = document.getElementById('dashboardContent');
        if (!container) return;

        try {
            const data = await DashboardService.getData();
            const { stats, recentLeads, goalsProgress } = data;

            // Format revenue
            const revenueFormatted = Formatters.toCurrency(stats.revenue || 0, 'BOB');

            container.innerHTML = `
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card blue">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-label">Clientes</div>
                        <div class="stat-value">${stats.clients || 0}</div>
                        <div class="stat-subtitle">Cartera total</div>
                    </div>

                    <div class="stat-card purple">
                        <div class="stat-icon"><i class="fas fa-user-plus"></i></div>
                        <div class="stat-label">Leads</div>
                        <div class="stat-value">${stats.leads || 0}</div>
                        <div class="stat-subtitle">En seguimiento</div>
                    </div>

                    <div class="stat-card amber">
                        <div class="stat-icon"><i class="fas fa-briefcase"></i></div>
                        <div class="stat-label">Proyectos</div>
                        <div class="stat-value">${stats.projects || 0}</div>
                        <div class="stat-subtitle">Activos</div>
                    </div>

                    <div class="stat-card green">
                        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-label">Pipeline</div>
                        <div class="stat-value money">${revenueFormatted}</div>
                        <div class="stat-subtitle">Valor total</div>
                    </div>

                    <div class="stat-card rose">
                        <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                        <div class="stat-label">Metas</div>
                        <div class="stat-value">${stats.goalsCompleted || 0}</div>
                        <div class="stat-subtitle">Completadas</div>
                    </div>

                    <div class="stat-card cyan">
                        <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                        <div class="stat-label">Acciones</div>
                        <div class="stat-value">${stats.pendingActions || 0}</div>
                        <div class="stat-subtitle">Pendientes</div>
                    </div>
                </div>

                <!-- Sections -->
                <div class="sections-grid">
                    <!-- Recent Leads -->
                    <div class="section-card">
                        <h3 class="section-title leads">
                            <i class="fas fa-bolt"></i>
                            Leads Recientes
                        </h3>
                        <div class="leads-list">
                            ${recentLeads.length > 0 ? recentLeads.map(lead => `
                                <div class="lead-item">
                                    <div class="lead-avatar">${(lead.name || 'L')[0].toUpperCase()}</div>
                                    <div class="lead-info">
                                        <div class="lead-name">${lead.name || 'Sin nombre'}</div>
                                        <div class="lead-company">${lead.company || lead.source || 'Sin empresa'}</div>
                                    </div>
                                    <div class="lead-value">${Formatters.toCurrency(lead.total || 0, lead.currency || 'BOB')}</div>
                                </div>
                            `).join('') : `
                                <div class="empty-state">
                                    <i class="fas fa-inbox"></i>
                                    <p>Sin leads recientes</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Goals Progress -->
                    <div class="section-card">
                        <h3 class="section-title goals">
                            <i class="fas fa-bullseye"></i>
                            Progreso de Metas
                        </h3>
                        <div class="goals-list">
                            ${goalsProgress.length > 0 ? goalsProgress.map(goal => {
                const pClass = goal.percent < 40 ? 'low' : goal.percent < 75 ? 'mid' : 'high';
                const currentVal = goal.type === 'leads'
                    ? goal.current
                    : Formatters.toCurrency(goal.current, goal.currency || 'BOB');
                const targetVal = goal.type === 'leads'
                    ? goal.target
                    : Formatters.toCurrency(goal.target, goal.currency || 'BOB');
                return `
                                    <div class="goal-item">
                                        <div class="goal-header">
                                            <span class="goal-name">${goal.name || 'Meta'}</span>
                                            <span class="goal-percent ${pClass}">${goal.percent || 0}%</span>
                                        </div>
                                        <div class="goal-progress-bar">
                                            <div class="goal-progress-fill ${pClass}" style="width: ${goal.percent || 0}%"></div>
                                        </div>
                                        <div class="goal-values">
                                            <span>${currentVal}</span>
                                            <span>${targetVal}</span>
                                        </div>
                                    </div>
                                `;
            }).join('') : `
                                <div class="empty-state">
                                    <i class="fas fa-flag-checkered"></i>
                                    <p>Sin metas configuradas</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading dashboard:', error);
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Error cargando datos</p>';
        }
    },

    destroy: () => { }
};
