import { Table } from '../components/Table.js';
import { Modal } from '../components/Modal.js';
import { ProjectsService } from '../services/projects.service.js';
import { ClientsService } from '../services/clients.service.js';
import { SettingsService } from '../services/settings.service.js';
import { Formatters } from '../utils/formatters.js';

export const ProjectsModule = {
    currentProjectId: null,

    render: async () => {
        const [clients, availableServices] = await Promise.all([
            ClientsService.getAll(),
            SettingsService.getServices()
        ]);

        const clientOptions = clients.map(c => `<option value="${c.name}" data-phone="${c.phone || ''}">${c.name}</option>`).join('');
        const servicesCheckboxes = availableServices.map(svc => `
            <label class="service-option">
                <input type="checkbox" class="service-chk" value="${svc}">
                <span>${svc}</span>
            </label>
        `).join('');

        const content = `
            <style>
                .projects-page { min-height: 100%; }
                
                .projects-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .projects-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }

                .btn-new-project {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-new-project:hover { background: var(--primary-dark); }

                /* Project Cards Grid */
                .projects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }

                .project-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 20px;
                    position: relative;
                    transition: all 0.2s;
                }
                .project-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }

                .project-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    border-radius: 16px 16px 0 0;
                }
                .project-card.status-nuevo::before { background: #3B82F6; }
                .project-card.status-progreso::before { background: #F59E0B; }
                .project-card.status-finalizado::before { background: #10B981; }
                .project-card.status-detenido::before { background: #EF4444; }

                .project-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }

                .project-name { font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0; }
                .project-client { font-size: 0.85rem; color: var(--text-muted); }

                .project-status {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }
                .project-status.nuevo { background: rgba(59,130,246,0.15); color: #3B82F6; }
                .project-status.progreso { background: rgba(245,158,11,0.15); color: #F59E0B; }
                .project-status.finalizado { background: rgba(16,185,129,0.15); color: #10B981; }
                .project-status.detenido { background: rgba(239,68,68,0.15); color: #EF4444; }

                .project-meta {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border-color);
                }

                .meta-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); }
                .meta-item i { width: 16px; }

                .project-finance {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--bg-body);
                    border-radius: 10px;
                    margin-bottom: 12px;
                }

                .finance-label { font-size: 0.75rem; color: var(--text-muted); }
                .finance-value { font-size: 1.1rem; font-weight: 700; }
                .finance-value.positive { color: #10B981; }
                .finance-value.negative { color: #EF4444; }

                .project-actions {
                    display: flex;
                    gap: 8px;
                }

                .btn-action {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: transparent;
                    color: var(--text-main);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.15s;
                }
                .btn-action:hover { background: var(--bg-body); }
                .btn-action.primary { background: var(--primary); color: white; border-color: var(--primary); }
                .btn-action.danger:hover { color: #EF4444; border-color: #EF4444; }

                /* Form Styles */
                .form-section {
                    background: var(--bg-body);
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 16px;
                }
                .form-section-title { font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 12px; }
                .form-group { margin-bottom: 12px; }
                .form-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; display: block; }
                .form-input, .form-select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: var(--bg-input);
                    color: var(--text-main);
                    box-sizing: border-box;
                }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

                /* Services Dropdown */
                .services-dropdown { position: relative; }
                .services-trigger {
                    padding: 10px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-input);
                    color: var(--text-main);
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                }
                .services-list {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0; right: 0;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    max-height: 150px;
                    overflow-y: auto;
                    z-index: 100;
                    padding: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .services-list.active { display: block; }
                .service-option { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 6px; cursor: pointer; }
                .service-option:hover { background: var(--bg-body); }

                .btn-submit {
                    width: 100%;
                    padding: 14px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

                /* Tabs */
                .tabs-nav {
                    display: flex;
                    gap: 4px;
                    border-bottom: 2px solid var(--border-color);
                    margin-bottom: 20px;
                }
                .tab-btn {
                    padding: 12px 20px;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    font-weight: 600;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                    transition: all 0.2s;
                }
                .tab-btn:hover { color: var(--text-main); }
                .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
                .tab-content { display: none; animation: fadeIn 0.3s; }
                .tab-content.active { display: block; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                /* Task Item */
                .task-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bg-body);
                    border-radius: 10px;
                    margin-bottom: 8px;
                }
                .task-checkbox { width: 20px; height: 20px; cursor: pointer; }
                .task-text { flex: 1; font-size: 0.9rem; color: var(--text-main); }
                .task-text.completed { text-decoration: line-through; color: var(--text-muted); }
                .task-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; }
                .task-delete:hover { color: #EF4444; }

                .add-task-row {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                .add-task-row input { flex: 1; }
                .btn-add-task {
                    padding: 10px 16px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* Finance Section */
                .finance-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .finance-box {
                    background: var(--bg-body);
                    padding: 16px;
                    border-radius: 12px;
                    text-align: center;
                }
                .finance-box-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; }
                .finance-box-value { font-size: 1.2rem; font-weight: 700; }

                .payment-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--bg-body);
                    border-radius: 10px;
                    margin-bottom: 8px;
                }
                .payment-info { flex: 1; }
                .payment-concept { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
                .payment-date { font-size: 0.75rem; color: var(--text-muted); }
                .payment-amount { font-size: 1rem; font-weight: 700; }
                .payment-amount.income { color: #10B981; }
                .payment-amount.expense { color: #EF4444; }

                .add-payment-form {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr auto;
                    gap: 8px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-color);
                }

                .btn-income, .btn-expense {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-income { background: #10B981; color: white; }
                .btn-expense { background: #EF4444; color: white; }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-muted);
                }
                .empty-state i { font-size: 2.5rem; opacity: 0.3; margin-bottom: 12px; }

                @media (max-width: 640px) {
                    .projects-grid { grid-template-columns: 1fr; }
                    .form-row { grid-template-columns: 1fr; }
                    .finance-summary { grid-template-columns: 1fr; }
                    .add-payment-form { grid-template-columns: 1fr; }
                }
            </style>

            <div class="projects-page">
                <div class="projects-header">
                    <div>
                        <h2>Proyectos</h2>
                        <p style="color: var(--text-muted); margin-top: 4px; font-size: 0.875rem;">Control de ejecución y rentabilidad</p>
                    </div>
                    <button class="btn-new-project" id="btnNewProject">
                        <i class="fas fa-plus"></i>
                        Nuevo Proyecto
                    </button>
                </div>

                <div id="projectsContainer" class="projects-grid">
                    <div class="loader"></div>
                </div>
            </div>

            ${Modal.render('Nuevo Proyecto', `
                <form id="projectForm">
                    <div class="form-section">
                        <div class="form-section-title">📋 Datos del Proyecto</div>
                        <div class="form-group">
                            <label class="form-label">Nombre del proyecto *</label>
                            <input type="text" name="name" class="form-input" placeholder="Ej: Campaña de Marketing Q1" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Cliente *</label>
                                <select name="client" class="form-select" required>
                                    <option value="">Seleccionar...</option>
                                    ${clientOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Estado</label>
                                <select name="status" class="form-select">
                                    <option value="Nuevo">Nuevo</option>
                                    <option value="En Progreso">En Progreso</option>
                                    <option value="Finalizado">Finalizado</option>
                                    <option value="Detenido">Detenido</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-section-title">📅 Planificación</div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha inicio</label>
                                <input type="date" name="startDate" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fecha entrega</label>
                                <input type="date" name="endDate" class="form-input" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Objetivo del proyecto</label>
                            <textarea name="objective" class="form-input" rows="2" placeholder="¿Qué se logrará con este proyecto?"></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-section-title">🛠️ Servicios</div>
                        <div class="services-dropdown">
                            <div class="services-trigger" id="servicesTrigger">
                                <span id="servicesText">Seleccionar servicios...</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="services-list" id="servicesList">
                                ${servicesCheckboxes}
                            </div>
                        </div>
                    </div>

                    <div class="form-section" style="background: rgba(16,185,129,0.1);">
                        <div class="form-section-title" style="color: #10B981;">💰 Presupuesto y Cobro Inicial</div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Monto de venta *</label>
                                <input type="number" name="budget" class="form-input" placeholder="0.00" step="0.01" min="0" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Moneda</label>
                                <select name="currency" class="form-select">
                                    <option value="BOB">Bs. (Bolivianos)</option>
                                    <option value="USD">$ (Dólares)</option>
                                    <option value="EUR">€ (Euros)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row" style="margin-top: 12px;">
                            <div class="form-group">
                                <label class="form-label">💵 Anticipo recibido</label>
                                <input type="number" name="initialPayment" class="form-input" placeholder="Ej: 225 (50%)" step="0.01" min="0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Estado del cobro</label>
                                <select name="paymentStatus" class="form-select">
                                    <option value="pendiente">⏳ Pendiente de cobro</option>
                                    <option value="parcial">💵 Anticipo recibido</option>
                                    <option value="completo">✅ Totalmente cobrado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn-submit">Crear Proyecto</button>
                </form>
            `, 'modalNewProject')}

            ${Modal.render('Gestión de Proyecto', '<div id="manageContent"></div>', 'modalManageProject')}
        `;

        return content;
    },

    init: async () => {
        Modal.initEvents('modalNewProject');
        Modal.initEvents('modalManageProject');
        await ProjectsModule.loadProjects();

        // New project button
        document.getElementById('btnNewProject')?.addEventListener('click', () => {
            const form = document.getElementById('projectForm');
            if (form) form.reset();

            const today = new Date().toISOString().split('T')[0];
            form.querySelector('[name="startDate"]').value = today;
            form.querySelector('[name="endDate"]').value = today;

            document.getElementById('servicesText').textContent = 'Seleccionar servicios...';
            document.querySelectorAll('.service-chk').forEach(c => c.checked = false);

            Modal.open('modalNewProject');
        });

        // Services dropdown
        const trigger = document.getElementById('servicesTrigger');
        const list = document.getElementById('servicesList');
        if (trigger && list) {
            trigger.addEventListener('click', () => list.classList.toggle('active'));
            list.addEventListener('change', () => {
                const count = list.querySelectorAll('.service-chk:checked').length;
                document.getElementById('servicesText').textContent = count > 0 ? `${count} servicios` : 'Seleccionar servicios...';
            });
            document.addEventListener('click', (e) => {
                if (!trigger.contains(e.target) && !list.contains(e.target)) list.classList.remove('active');
            });
        }

        // Form submit
        const form = document.getElementById('projectForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('.btn-submit');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

                try {
                    const services = [];
                    document.querySelectorAll('.service-chk:checked').forEach(c => services.push(c.value));

                    const data = {
                        name: form.name.value.trim(),
                        client: form.client.value,
                        clientPhone: form.client.options[form.client.selectedIndex]?.dataset.phone || '',
                        status: form.status.value,
                        startDate: form.startDate.value,
                        endDate: form.endDate.value,
                        objective: form.objective.value.trim(),
                        budget: parseFloat(form.budget.value) || 0,
                        currency: form.currency.value,
                        services: services,
                        paymentStatus: form.paymentStatus.value,
                        initialPayment: parseFloat(form.initialPayment.value) || 0
                    };

                    await ProjectsService.create(data);
                    Swal.fire({ icon: 'success', title: 'Proyecto creado', timer: 1500, showConfirmButton: false });
                    Modal.close('modalNewProject');
                    await ProjectsModule.loadProjects();
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el proyecto' });
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Crear Proyecto';
                }
            });
        }
    },

    loadProjects: async () => {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        try {
            const projects = await ProjectsService.getAll();

            if (projects.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-folder-open"></i>
                        <h3 style="color: var(--text-main); margin: 0 0 8px 0;">Sin proyectos</h3>
                        <p>Crea tu primer proyecto para comenzar</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = projects.map(p => ProjectsModule.renderCard(p)).join('');

            // Events
            container.querySelectorAll('.btn-manage').forEach(btn => {
                btn.addEventListener('click', () => ProjectsModule.openManageModal(btn.dataset.id));
            });

            container.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => ProjectsModule.deleteProject(btn.dataset.id));
            });

        } catch (error) {
            console.error('Error loading projects:', error);
        }
    },

    renderCard: (p) => {
        const statusClass = {
            'Nuevo': 'nuevo',
            'En Progreso': 'progreso',
            'Finalizado': 'finalizado',
            'Detenido': 'detenido'
        }[p.status] || 'nuevo';

        const margin = (p.budget || 0) - (p.costs || 0);
        const currency = { BOB: 'Bs.', USD: '$', EUR: '€' }[p.currency] || 'Bs.';
        const tasksCount = (p.tasks || []).length;
        const completedTasks = (p.tasks || []).filter(t => t.status === 'completada').length;

        const formatDate = (d) => {
            if (!d) return '—';
            return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        };

        return `
            <div class="project-card status-${statusClass}">
                <div class="project-card-header">
                    <div>
                        <h3 class="project-name">${p.name}</h3>
                        <div class="project-client">👤 ${p.client}</div>
                    </div>
                    <span class="project-status ${statusClass}">${p.status}</span>
                </div>

                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(p.startDate)} → ${formatDate(p.endDate)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tasks"></i>
                        <span>${completedTasks}/${tasksCount} tareas</span>
                    </div>
                </div>

                <div class="project-finance">
                    <div>
                        <div class="finance-label">Presupuesto</div>
                        <div class="finance-value">${currency} ${(p.budget || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="finance-label">Margen</div>
                        <div class="finance-value ${margin >= 0 ? 'positive' : 'negative'}">${currency} ${margin.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div class="project-actions">
                    <button class="btn-action primary btn-manage" data-id="${p.id}">
                        <i class="fas fa-cog"></i> Gestionar
                    </button>
                    <button class="btn-action danger btn-delete" data-id="${p.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },

    deleteProject: async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar proyecto?',
            text: 'Se perderá todo el seguimiento',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Eliminar'
        });

        if (result.isConfirmed) {
            await ProjectsService.delete(id);
            Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
            await ProjectsModule.loadProjects();
        }
    },

    openManageModal: async (id) => {
        const project = await ProjectsService.getById(id);
        if (!project) return;

        ProjectsModule.currentProjectId = id;
        const container = document.getElementById('manageContent');

        container.innerHTML = ProjectsModule.renderManageContent(project);
        ProjectsModule.setupManageEvents(project);
        Modal.open('modalManageProject');
    },

    renderManageContent: (p) => {
        const currency = { BOB: 'Bs.', USD: '$', EUR: '€' }[p.currency] || 'Bs.';
        const budget = p.budget || 0;
        const totalPaid = p.totalPaid || 0;
        const costs = p.costs || 0;
        const balance = budget - totalPaid;
        const margin = budget - costs;

        const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

        return `
            <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main);">${p.name}</h3>
                <div style="color: var(--text-muted); font-size: 0.9rem;">👤 ${p.client}</div>
            </div>

            <div class="tabs-nav">
                <button class="tab-btn active" data-tab="resumen">📋 Resumen</button>
                <button class="tab-btn" data-tab="tareas">✅ Tareas</button>
                <button class="tab-btn" data-tab="finanzas">💰 Finanzas</button>
            </div>

            <!-- TAB RESUMEN -->
            <div id="tab-resumen" class="tab-content active">
                <div class="form-section">
                    <div class="form-section-title">Objetivo</div>
                    <p style="margin: 0; color: var(--text-main);">${p.objective || 'Sin objetivo definido'}</p>
                </div>

                <div class="form-row" style="margin-bottom: 16px;">
                    <div class="form-section" style="margin-bottom: 0;">
                        <div class="form-section-title">📅 Inicio</div>
                        <div style="font-weight: 600; color: var(--text-main);">${formatDate(p.startDate)}</div>
                    </div>
                    <div class="form-section" style="margin-bottom: 0;">
                        <div class="form-section-title">🏁 Entrega</div>
                        <div style="font-weight: 600; color: var(--text-main);">${formatDate(p.endDate)}</div>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-title">🛠️ Servicios</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${(p.services || []).length > 0
                ? p.services.map(s => `<span style="background: rgba(59,130,246,0.15); color: #3B82F6; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${s}</span>`).join('')
                : '<span style="color: var(--text-muted);">Ninguno</span>'
            }
                    </div>
                </div>
            </div>

            <!-- TAB TAREAS -->
            <div id="tab-tareas" class="tab-content">
                <div id="tasksList">
                    ${(p.tasks || []).map(t => {
                const dueDate = t.dueDate ? new Date(t.dueDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
                return `
                        <div class="task-item" data-task-id="${t.id}">
                            <input type="checkbox" class="task-checkbox" ${t.status === 'completada' ? 'checked' : ''}>
                            <div style="flex:1;">
                                <span class="task-text ${t.status === 'completada' ? 'completed' : ''}">${t.description}</span>
                                ${dueDate ? `<div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">📅 ${dueDate}</div>` : ''}
                            </div>
                            <button class="task-delete"><i class="fas fa-times"></i></button>
                        </div>
                    `}).join('') || '<div class="empty-state"><i class="fas fa-tasks"></i><p>Sin tareas</p></div>'}
                </div>
                <div class="add-task-row" style="flex-wrap: wrap;">
                    <input type="text" class="form-input" id="newTaskInput" placeholder="Descripción de la tarea..." style="flex: 2; min-width: 150px;">
                    <input type="date" class="form-input" id="newTaskDueDate" min="${p.startDate}" max="${p.endDate}" style="flex: 1; min-width: 120px;">
                    <button class="btn-add-task" id="btnAddTask"><i class="fas fa-plus"></i> Agregar</button>
                </div>
            </div>

            <!-- TAB FINANZAS -->
            <div id="tab-finanzas" class="tab-content">
                <div class="finance-summary">
                    <div class="finance-box">
                        <div class="finance-box-label">Presupuesto</div>
                        <div class="finance-box-value" style="color: var(--text-main);">${currency} ${budget.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="finance-box">
                        <div class="finance-box-label">Cobrado</div>
                        <div class="finance-box-value" style="color: #10B981;">${currency} ${totalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="finance-box">
                        <div class="finance-box-label">Por cobrar</div>
                        <div class="finance-box-value" style="color: ${balance > 0 ? '#F59E0B' : '#10B981'};">${currency} ${balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div class="finance-summary" style="grid-template-columns: 1fr 1fr;">
                    <div class="finance-box">
                        <div class="finance-box-label">Gastos</div>
                        <div class="finance-box-value" style="color: #EF4444;">${currency} ${costs.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="finance-box">
                        <div class="finance-box-label">Margen</div>
                        <div class="finance-box-value" style="color: ${margin >= 0 ? '#10B981' : '#EF4444'};">${currency} ${margin.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div id="paymentsList">
                    ${(p.payments || []).map(pay => `
                        <div class="payment-item" data-payment-id="${pay.id}">
                            <div class="payment-info">
                                <div class="payment-concept">${pay.concept}</div>
                                <div class="payment-date">${new Date(pay.date).toLocaleDateString('es-ES')}</div>
                            </div>
                            <div class="payment-amount ${pay.type}">${pay.type === 'income' ? '+' : '-'} ${currency} ${pay.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                            <button class="task-delete payment-delete"><i class="fas fa-times"></i></button>
                        </div>
                    `).join('') || ''}
                </div>

                <div class="add-payment-form">
                    <input type="text" class="form-input" id="paymentConcept" placeholder="Concepto (ej: Anticipo cliente)">
                    <input type="number" class="form-input" id="paymentAmount" placeholder="Monto" step="0.01" min="0">
                    <button class="btn-income" id="btnAddIncome"><i class="fas fa-arrow-down"></i> Cobro</button>
                    <button class="btn-expense" id="btnAddExpense"><i class="fas fa-arrow-up"></i> Gasto</button>
                </div>
            </div>
        `;
    },

    setupManageEvents: (project) => {
        const id = ProjectsModule.currentProjectId;

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            });
        });

        // Add task
        document.getElementById('btnAddTask')?.addEventListener('click', async () => {
            const input = document.getElementById('newTaskInput');
            const dueDateInput = document.getElementById('newTaskDueDate');
            const desc = input.value.trim();
            const dueDate = dueDateInput?.value || '';
            if (!desc) return;

            try {
                await ProjectsService.addTask(id, { description: desc, dueDate: dueDate });
                input.value = '';
                if (dueDateInput) dueDateInput.value = '';
                const updatedProject = await ProjectsService.getById(id);
                document.getElementById('manageContent').innerHTML = ProjectsModule.renderManageContent(updatedProject);
                document.querySelector('[data-tab="tareas"]').click();
                ProjectsModule.setupManageEvents(updatedProject);
            } catch (e) { console.error(e); }
        });

        // Task checkbox
        document.querySelectorAll('.task-checkbox').forEach(chk => {
            chk.addEventListener('change', async () => {
                const taskId = chk.closest('.task-item').dataset.taskId;
                const newStatus = chk.checked ? 'completada' : 'pendiente';
                await ProjectsService.updateTask(id, taskId, { status: newStatus });
                await ProjectsModule.loadProjects();
            });
        });

        // Delete task
        document.querySelectorAll('.task-delete:not(.payment-delete)').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.closest('.task-item').dataset.taskId;
                await ProjectsService.deleteTask(id, taskId);
                const updatedProject = await ProjectsService.getById(id);
                document.getElementById('manageContent').innerHTML = ProjectsModule.renderManageContent(updatedProject);
                document.querySelector('[data-tab="tareas"]').click();
                ProjectsModule.setupManageEvents(updatedProject);
            });
        });

        // Add payment (income)
        document.getElementById('btnAddIncome')?.addEventListener('click', async () => {
            const concept = document.getElementById('paymentConcept').value.trim();
            const amount = parseFloat(document.getElementById('paymentAmount').value);
            if (!concept || !amount) return;

            await ProjectsService.addPayment(id, { concept, amount, type: 'income' });
            await ProjectsModule.refreshManageModal();
        });

        // Add payment (expense)
        document.getElementById('btnAddExpense')?.addEventListener('click', async () => {
            const concept = document.getElementById('paymentConcept').value.trim();
            const amount = parseFloat(document.getElementById('paymentAmount').value);
            if (!concept || !amount) return;

            await ProjectsService.addPayment(id, { concept, amount, type: 'expense' });
            await ProjectsModule.refreshManageModal();
        });

        // Delete payment
        document.querySelectorAll('.payment-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const paymentId = btn.closest('.payment-item').dataset.paymentId;
                await ProjectsService.deletePayment(id, paymentId);
                await ProjectsModule.refreshManageModal();
            });
        });
    },

    refreshManageModal: async () => {
        const id = ProjectsModule.currentProjectId;
        const updatedProject = await ProjectsService.getById(id);
        document.getElementById('manageContent').innerHTML = ProjectsModule.renderManageContent(updatedProject);
        document.querySelector('[data-tab="finanzas"]').click();
        ProjectsModule.setupManageEvents(updatedProject);
        await ProjectsModule.loadProjects();
    },

    destroy: () => {
        ProjectsModule.currentProjectId = null;
    }
};
