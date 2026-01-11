import { DashboardService } from '../services/dashboard.service.js';
import { Formatters } from '../utils/formatters.js';

export const DashboardModule = {
    render: async () => {
        const data = await DashboardService.getData();
        const { stats, recentLeads, goalsProgress } = data;

        const content = `
            <style>
                .dash-page { padding: 0; }
                
                .kpi-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 30px; 
                }
                
                .kpi-card { 
                    background: var(--bg-card); 
                    padding: 24px; 
                    border-radius: 16px; 
                    border: 1px solid var(--border-color);
                    display: flex; 
                    flex-direction: column; 
                    gap: 8px;
                }
                
                .kpi-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.3rem;
                    margin-bottom: 4px;
                }
                
                .kpi-title { 
                    font-size: 0.8rem; 
                    color: var(--text-muted); 
                    font-weight: 600; 
                    text-transform: uppercase; 
                    letter-spacing: 0.5px; 
                }
                
                .kpi-value { 
                    font-size: 1.75rem; 
                    font-weight: 800; 
                    color: var(--text-main); 
                }
                
                .kpi-trend { 
                    font-size: 0.75rem; 
                    color: var(--text-muted);
                }

                .dash-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
                    gap: 24px;
                }

                .dash-section { 
                    background: var(--bg-card); 
                    border-radius: 16px; 
                    border: 1px solid var(--border-color); 
                    padding: 24px;
                }
                
                .section-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 20px; 
                }
                
                .section-title { 
                    font-size: 1rem; 
                    font-weight: 700; 
                    color: var(--text-main); 
                    margin: 0; 
                }
                
                .activity-item { 
                    display: flex; 
                    align-items: center; 
                    padding: 12px 0; 
                    border-bottom: 1px solid var(--border-color); 
                }
                
                .activity-item:last-child { border-bottom: none; }
                
                .act-icon { 
                    width: 40px; 
                    height: 40px; 
                    border-radius: 10px; 
                    background: rgba(59, 130, 246, 0.15); 
                    color: #3B82F6; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-weight: 700; 
                    margin-right: 14px; 
                }
                
                .act-info { flex: 1; }
                .act-title { font-weight: 600; font-size: 0.9rem; color: var(--text-main); }
                .act-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
                .act-amount { font-weight: 700; color: #10B981; font-size: 0.85rem; }

                .goal-item {
                    background: var(--bg-body);
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 12px;
                }
                
                .goal-item:last-child { margin-bottom: 0; }
                
                .goal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .goal-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text-main);
                }
                
                .goal-percent {
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #10B981;
                }
                
                .goal-bar {
                    height: 8px;
                    background: var(--border-color);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .goal-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10B981, #34D399);
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }
                
                .goal-values {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 8px;
                }

                .empty-state {
                    text-align: center;
                    padding: 30px;
                    color: var(--text-muted);
                }
                
                .empty-state i {
                    font-size: 2rem;
                    opacity: 0.3;
                    margin-bottom: 10px;
                }

                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                    .dash-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="dash-page">
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin:0;">Dashboard</h2>
                    <p style="color: var(--text-muted); margin-top:4px; font-size: 0.875rem;">Resumen general de tu negocio</p>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon" style="background:rgba(59,130,246,0.15); color:#3B82F6;">👥</div>
                        <div class="kpi-title">Clientes</div>
                        <div class="kpi-value">${stats.clients}</div>
                        <div class="kpi-trend">Cartera total</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon" style="background:rgba(139,92,246,0.15); color:#8B5CF6;">📥</div>
                        <div class="kpi-title">Leads</div>
                        <div class="kpi-value">${stats.leads}</div>
                        <div class="kpi-trend">En seguimiento</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon" style="background:rgba(245,158,11,0.15); color:#F59E0B;">🔨</div>
                        <div class="kpi-title">Proyectos</div>
                        <div class="kpi-value">${stats.projects}</div>
                        <div class="kpi-trend">Activos</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon" style="background:rgba(16,185,129,0.15); color:#10B981;">💰</div>
                        <div class="kpi-title">Estimación</div>
                        <div class="kpi-value" style="color:#10B981; font-size:1.4rem;">${Formatters.toCurrency(stats.revenue, 'BOB')}</div>
                        <div class="kpi-trend">Valor en pipeline</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon" style="background:rgba(34,197,94,0.15); color:#22C55E;">🎯</div>
                        <div class="kpi-title">Metas Cumplidas</div>
                        <div class="kpi-value">${stats.goalsCompleted}</div>
                        <div class="kpi-trend">De ${goalsProgress.length} totales</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon" style="background:rgba(239,68,68,0.15); color:#EF4444;">📋</div>
                        <div class="kpi-title">Acciones Pendientes</div>
                        <div class="kpi-value">${stats.pendingActions}</div>
                        <div class="kpi-trend">En leads activos</div>
                    </div>
                </div>

                <div class="dash-grid">
                    <div class="dash-section">
                        <div class="section-header">
                            <h3 class="section-title">Últimos Leads</h3>
                            <a href="#/leads" style="color:var(--primary); font-size:0.8rem; font-weight:600; text-decoration:none;">Ver todos →</a>
                        </div>
                        <div id="recentActivityList">
                            ${recentLeads.length > 0 ? recentLeads.map(l => `
                                <div class="activity-item">
                                    <div class="act-icon">${l.name ? l.name.charAt(0).toUpperCase() : '?'}</div>
                                    <div class="act-info">
                                        <div class="act-title">${l.name || 'Sin nombre'}</div>
                                        <div class="act-meta">${l.company || 'Particular'} • ${l.status || 'Nuevo'}${l.actions && l.actions.length > 0 ? ` • ${l.actions.length} acciones` : ''}</div>
                                    </div>
                                    <div class="act-amount">${Formatters.toCurrency(l.total || 0, l.currency || 'BOB')}</div>
                                </div>
                            `).join('') : `
                                <div class="empty-state">
                                    <i class="fas fa-inbox"></i>
                                    <p>Sin leads recientes</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <div class="dash-section">
                        <div class="section-header">
                            <h3 class="section-title">Progreso de Metas</h3>
                            <a href="#/goals" style="color:var(--primary); font-size:0.8rem; font-weight:600; text-decoration:none;">Ver todas →</a>
                        </div>
                        <div>
                            ${goalsProgress.length > 0 ? goalsProgress.slice(0, 4).map(g => {
            // Determinar si es leads (cantidad) o facturación (moneda)
            const isLeads = g.type === 'leads';
            const currencySymbol = { BOB: 'Bs.', USD: '$', EUR: '€' }[g.currency] || '';

            // Formatear valores según tipo
            const formatVal = (val) => {
                if (isLeads) {
                    return Math.round(val).toLocaleString('es-ES'); // Solo número
                } else {
                    return `${currencySymbol} ${val.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`; // Con moneda
                }
            };

            return `
                                    <div class="goal-item">
                                        <div class="goal-header">
                                            <span class="goal-name">${g.name}</span>
                                            <span class="goal-percent">${g.percent}%</span>
                                        </div>
                                        <div class="goal-bar">
                                            <div class="goal-fill" style="width: ${g.percent}%;"></div>
                                        </div>
                                        <div class="goal-values">
                                            <span>${formatVal(g.current)}</span>
                                            <span>${formatVal(g.target)}</span>
                                        </div>
                                    </div>
                                `;
        }).join('') : `
                                <div class="empty-state">
                                    <i class="fas fa-bullseye"></i>
                                    <p>Sin metas definidas</p>
                                    <a href="#/goals" style="color:var(--primary); font-size:0.85rem;">Crear primera meta</a>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        return content;
    },

    init: async () => {
        // Lógica de inicialización si fuera necesaria
    }
};
