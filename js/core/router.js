/**
 * Router - Manejador de Navegación SPA (Compatible con GitHub Pages)
 */
export const Router = {
    routes: {},
    currentModule: null,
    // CONFIGURACIÓN: Nombre exacto de tu repositorio
    basePath: '/magic-crm-pro-2026',

    init: function(routes) {
        this.routes = routes;
        window.addEventListener('popstate', () => this.handleLocation());
        this.handleLocation();
    },

    /**
     * Navegar a una nueva ruta de forma inteligente
     */
    navigateTo: function(path) {
        // Detectamos si estamos en GitHub (producción)
        const isProduction = window.location.hostname.includes('github.io');
        
        // Si es producción, le pegamos el nombre del repo al inicio
        const targetPath = isProduction ? this.basePath + path : path;

        window.history.pushState({}, "", targetPath);
        this.handleLocation();
    },

    /**
     * Lógica principal de renderizado
     */
    handleLocation: async function() {
        let path = window.location.pathname;

        // LIMPIEZA DE RUTA:
        // Si estamos en GitHub, la ruta viene "sucia" (ej: /magic-crm-pro-2026/dashboard)
        // Necesitamos quitarle el nombre del repo para saber qué módulo cargar.
        const isProduction = window.location.hostname.includes('github.io');
        if (isProduction && path.startsWith(this.basePath)) {
            path = path.replace(this.basePath, '') || '/';
        }

        // Si la ruta quedó vacía después de limpiar, es el home
        if (path === '') path = '/';

        console.log("Navegando a:", path); // Para depuración

        // Buscamos el módulo correspondiente
        const routeModule = this.routes[path] || this.routes['/'];

        if (!routeModule) {
            console.error('Ruta no encontrada:', path);
            // Opcional: Podrías redirigir a un 404 interno si quisieras
            return;
        }

        // 1. Limpieza del módulo anterior
        if (this.currentModule && typeof this.currentModule.destroy === 'function') {
            this.currentModule.destroy();
        }

        // 2. Renderizado
        const app = document.getElementById('app');
        app.innerHTML = await routeModule.render();

        // 3. Inicialización
        if (typeof routeModule.init === 'function') {
            routeModule.init();
        }
        
        this.currentModule = routeModule;
    }
};