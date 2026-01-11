import { AuthService } from './services/auth.service.js';
import { Layout } from './components/Layout.js';
import { db } from './core/firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Módulos
import { LoginModule } from './modules/login.js';
import { DashboardModule } from './modules/dashboard.js';
import { LeadsModule } from './modules/leads.js';
import { ClientsModule } from './modules/clients.js';
import { PipelineModule } from './modules/pipeline.js';
import { QuotesModule } from './modules/quotes.js';
import { ProjectsModule } from './modules/projects.js';
import { CalendarModule } from './modules/calendar.js';
import { ReportsModule } from './modules/reports.js';
import { GoalsModule } from './modules/goals.js';
import { SettingsModule } from './modules/settings.js';

const routes = {
    '/': DashboardModule,
    '/dashboard': DashboardModule,
    '/leads': LeadsModule,
    '/clients': ClientsModule,
    '/pipeline': PipelineModule,
    '/quotes': QuotesModule,
    '/projects': ProjectsModule,
    '/calendar': CalendarModule,
    '/reports': ReportsModule,
    '/goals': GoalsModule,
    '/settings': SettingsModule
};

const router = async () => {
    const contentDiv = document.getElementById('app');
    let path = window.location.hash.replace('#', '') || '/';
    if (path === '') path = '/';

    console.log("📍 Navegando a:", path);

    if (path === '/login' || path === '/register') {
        contentDiv.innerHTML = await LoginModule.render();
        if (LoginModule.init) await LoginModule.init();
        return;
    }

    const module = routes[path] || DashboardModule;

    try {
        const moduleContent = await module.render();
        const pageTitle = path.replace('/', '').toUpperCase() || 'DASHBOARD';
        contentDiv.innerHTML = Layout.render(moduleContent, pageTitle);
        if (Layout.init) await Layout.init();
        if (module.init) await module.init();
    } catch (error) {
        console.error("❌ Error cargando módulo:", error);
        contentDiv.innerHTML = `<div style="padding:20px; text-align:center;"><h2>Error cargando la página</h2><p>${error.message}</p></div>`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Iniciando Magic CRM...");

    // ========== APLICAR TEMA GUARDADO AL INICIO ==========
    const savedTheme = localStorage.getItem('crm-theme') || 'light';
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${savedTheme}`);
    console.log("🎨 Tema aplicado:", savedTheme);

    AuthService.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("✅ Usuario detectado:", user.email);

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    if (userData.status === 'pending') {
                        console.warn("⛔ Usuario PENDIENTE detectado.");

                        // --- SOLUCIÓN AL CONFLICTO DE ALERTAS ---
                        // Verificamos si estamos en flujo de registro (bandera global)
                        // o si ya hay una alerta en pantalla. Si es así, NO lanzamos la alerta azul.
                        const isAlertOpen = document.querySelector('.swal2-container');
                        const isRegisterFlow = window.isRegisterFlow === true;

                        if (!isAlertOpen && !isRegisterFlow) {
                            if (typeof Swal !== 'undefined') {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Cuenta en Revisión',
                                    text: 'Tu solicitud ha sido recibida pero aún no ha sido aprobada por el administrador.',
                                    confirmButtonColor: '#2563EB'
                                });
                            } else {
                                alert("Cuenta en revisión.");
                            }
                        }

                        // Limpiamos la bandera después de usarla
                        window.isRegisterFlow = false;

                        // Cerramos sesión igual por seguridad, pero respetamos el mensaje visual
                        await AuthService.logout();
                        window.location.hash = '#/login';
                        return; // Detenemos todo aquí
                    }
                }
            } catch (error) {
                console.error("Error verificando estado:", error);
            }

            if (window.location.hash === '#/login' || window.location.hash === '' || !window.location.hash) {
                window.location.hash = '#/dashboard';
            }
            router();

        } else {
            console.log("⚠️ No hay sesión, redirigiendo a Login");
            if (window.location.hash !== '#/register') {
                window.location.hash = '#/login';
            }
            router();
        }
    });

    window.addEventListener('popstate', router);
    window.addEventListener('hashchange', router);
});
