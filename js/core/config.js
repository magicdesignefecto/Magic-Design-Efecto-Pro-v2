export const Config = {
    // Detecta automáticamente si estamos en GitHub y devuelve el nombre del repo
    getBasePath() {
        const hostname = window.location.hostname;
        // Si es GitHub Pages, devuelve el nombre del repositorio
        if (hostname.includes('github.io')) {
            return '/CRM-Magic-Design-Efecto-Pro-2026';
        }
        // Si es Localhost, devuelve vacío
        return '';
    }
};