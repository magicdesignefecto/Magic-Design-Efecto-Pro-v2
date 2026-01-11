import { Store } from '../core/store.js';
import { auth, db } from '../core/firebase-config.js';
import { PullToRefresh } from '../utils/pull-to-refresh.js';
import { CacheManager } from '../utils/cache-manager.js';

// Cache para datos del usuario (evita múltiples consultas a Firestore)
let cachedUserData = null;

export const Layout = {
    render: (content, title = 'CRM') => {
        // 1. Intentamos obtener el usuario de Firebase directamente
        const fbUser = auth.currentUser;
        const storeUser = Store.getState().user;

        // Prioridad: Firebase > Store > Default
        const displayName = fbUser?.displayName || storeUser?.name || 'Usuario';

        // Usamos el rol cacheado o el default
        const role = cachedUserData?.role || storeUser?.role || 'Usuario';
        const email = fbUser?.email || '';

        // Iniciales
        const initials = displayName.substring(0, 2).toUpperCase();

        // Detectar ruta activa (usando Hash)
        const currentHash = window.location.hash || '#/dashboard';

        return `
        <div class="app-layout">
            <aside class="sidebar" id="sidebar">
                <div class="logo-area">
                    <div class="logo-circle">
                        <img src="https://raw.githubusercontent.com/magicdesignefecto/Magic-Design-Efecto-Servicios-Gestion-de-Redes-Sociales/77cbcdf9e5992cc519ac102d1182d9397f23f12a/logo%20svg%20magic%20design%20efecto.svg" alt="Logo" style="width:45px; height:45px; object-fit:contain;">
                    </div>
                    <span class="logo-text">Magic CRM</span>
                </div>
                
                <nav class="nav-links">
                    <a href="#/dashboard" class="nav-item ${currentHash.includes('dashboard') ? 'active' : ''}">
                        <span>Dashboard</span>
                    </a>
                    <a href="#/leads" class="nav-item ${currentHash.includes('leads') ? 'active' : ''}">
                        <span>Leads</span>
                    </a>
                    <a href="#/clients" class="nav-item ${currentHash.includes('clients') ? 'active' : ''}">
                        <span>Clientes</span>
                    </a>
                    <a href="#/pipeline" class="nav-item ${currentHash.includes('pipeline') ? 'active' : ''}">
                        <span>Pipeline</span>
                    </a>
                    <a href="#/quotes" class="nav-item ${currentHash.includes('quotes') ? 'active' : ''}">
                        <span>Cotizaciones</span>
                    </a>
                    <a href="#/projects" class="nav-item ${currentHash.includes('projects') ? 'active' : ''}">
                        <span>Proyectos</span>
                    </a>
                    <a href="#/calendar" class="nav-item ${currentHash.includes('calendar') ? 'active' : ''}">
                        <span>Calendario</span>
                    </a>
                    <a href="#/reports" class="nav-item ${currentHash.includes('reports') ? 'active' : ''}">
                        <span>Reportes</span>
                    </a>
                    <a href="#/goals" class="nav-item ${currentHash.includes('goals') ? 'active' : ''}">
                        <span>Metas</span>
                    </a>
                    <a href="#/settings" class="nav-item ${currentHash.includes('settings') ? 'active' : ''}">
                        <span>Configuración</span>
                    </a>
                </nav>
            </aside>

            <div class="main-wrapper">
                <header class="top-bar">
                    <div class="header-left">
                        <button id="menuToggle" class="menu-toggle">☰</button>
                        <h2 class="page-title">${title}</h2>
                    </div>
                    
                    <div class="header-right" style="display:flex; align-items:center; gap:15px;">
                        <div class="user-capsule">
                            <div class="user-meta">
                                <span class="u-name">${displayName}</span>
                                <span class="u-divider">|</span>
                                <span class="u-role">${role}</span>
                            </div>
                            <div class="user-avatar">
                                ${initials}
                            </div>
                        </div>

                        <button id="btnLogout" class="btn-logout" title="Cerrar Sesión">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </header>

                <main class="content-scroll-area">
                    <div class="content-container">
                        ${content}
                    </div>
                </main>
            </div>
        </div>

        <style>
            /* REUTILIZAMOS TU CSS ORIGINAL, SOLO AGREGAMOS ICONOS SI FALTAN */
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif; background-color: #F8F9FA; }
            .app-layout { display: flex; width: 100vw; height: 100dvh; }
            
            /* Sidebar Styles */
            .sidebar { width: 260px; background: white; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; flex-shrink: 0; z-index: 50; transition: transform 0.3s ease; }
            .logo-area { height: 64px; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid #F3F4F6; gap: 10px; }
            .logo-text { font-weight: 800; font-size: 1.1rem; color: #111; }
            .nav-links { padding: 20px 16px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
            .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; color: #64748B; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 0.95rem; transition: all 0.2s; }
            .nav-item:hover { background: #F1F5F9; color: #0F172A; }
            .nav-item.active { background: #EFF6FF; color: #2563EB; font-weight: 600; }

            /* Main Content Styles */
            .main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; }
            .top-bar { height: 64px; width: 100%; background: white; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; flex-shrink: 0; }
            .header-left { display: flex; align-items: center; gap: 16px; }
            .menu-toggle { display: none; background: none; border: none; cursor: pointer; font-size: 1.5rem; }
            .page-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1E293B; }
            
            /* User Capsule */
            .user-capsule { display: flex; align-items: center; gap: 12px; background: white; padding: 4px 4px 4px 16px; border: 1px solid #E2E8F0; border-radius: 50px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
            .user-meta { display: flex; align-items: center; gap: 8px; }
            .u-name { font-weight: 700; color: #1E293B; font-size: 0.9rem; }
            .u-divider { color: #CBD5E1; }
            .u-role { font-size: 0.75rem; color: #2563EB; font-weight: 700; text-transform: uppercase; }
            .user-avatar { width: 34px; height: 34px; background: #2563EB; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
            
            .btn-logout { background: #FEE2E2; color: #EF4444; border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
            .btn-logout:hover { background: #EF4444; color: white; }

            .content-scroll-area { flex: 1; overflow-y: auto; padding-bottom: 200px; }
            .content-container { padding: 24px; max-width: 100%; margin: 0 auto; }

            @media (max-width: 768px) {
                .sidebar { position: fixed; height: 100%; top: 0; left: 0; transform: translateX(-100%); box-shadow: 0 0 25px rgba(0,0,0,0.15); }
                .sidebar.active { transform: translateX(0); }
                .menu-toggle { display: block; }
                .user-meta { display: none; }
                .user-capsule { padding: 0; border: none; box-shadow: none; background: transparent; }
            }
        </style>
        `;
    },

    init: async () => {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        // --- CARGAR DATOS DEL USUARIO DESDE FIRESTORE ---
        const fbUser = auth.currentUser;
        if (fbUser && !cachedUserData) {
            try {
                const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                const userDoc = await getDoc(doc(db, "users", fbUser.uid));
                if (userDoc.exists()) {
                    cachedUserData = userDoc.data();
                    // Actualizar el UI con los datos reales
                    const nameEl = document.querySelector('.u-name');
                    const roleEl = document.querySelector('.u-role');
                    const avatarEl = document.querySelector('.user-avatar');
                    if (nameEl) nameEl.innerText = cachedUserData.name || fbUser.displayName || 'Usuario';
                    if (roleEl) roleEl.innerText = cachedUserData.role || 'Usuario';
                    if (avatarEl && cachedUserData.name) {
                        avatarEl.innerText = cachedUserData.name.substring(0, 2).toUpperCase();
                    }
                }
            } catch (error) {
                console.warn("No se pudieron cargar datos del usuario:", error);
            }
        }

        // Cierre de menú móvil al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) sidebar.classList.remove('active');
            }
        });

        if (menuToggle) menuToggle.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('active'); });

        // LOGOUT - Diálogo moderno con SweetAlert2
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', async () => {
                const result = await Swal.fire({
                    title: '¿Cerrar sesión?',
                    text: 'Tu sesión actual se cerrará de forma segura.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#EF4444',
                    cancelButtonColor: '#64748B',
                    confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Sí, salir',
                    cancelButtonText: 'Cancelar',
                    reverseButtons: true,
                    customClass: {
                        popup: 'swal-logout-popup',
                        title: 'swal-logout-title'
                    }
                });

                if (result.isConfirmed) {
                    try {
                        // Mostrar loader mientras cierra
                        Swal.fire({
                            title: 'Cerrando sesión...',
                            allowOutsideClick: false,
                            didOpen: () => Swal.showLoading()
                        });

                        const { AuthService } = await import('../services/auth.service.js');
                        await AuthService.logout();
                        cachedUserData = null; // Limpiar cache

                        Swal.close();
                        window.location.hash = '#/login';
                    } catch (error) {
                        console.error("Error logout:", error);
                        Swal.close();
                        window.location.hash = '#/login';
                    }
                }
            });
        }

        // Inicializar Pull-to-Refresh para móviles
        PullToRefresh.init(async () => {
            // Limpiar todo el caché
            CacheManager.clearAll();

            // Recargar la página actual
            const currentHash = window.location.hash || '#/dashboard';
            window.location.hash = '';
            setTimeout(() => {
                window.location.hash = currentHash;
            }, 50);
        });
    },

    // Función para limpiar el cache (útil cuando cambia el usuario)
    clearCache: () => {
        cachedUserData = null;
    }
};
