/**
 * PullToRefresh - Utilidad para gesto de "deslizar para actualizar"
 * Funciona en móviles con efecto visual nativo
 */
export const PullToRefresh = {
    isEnabled: false,
    startY: 0,
    currentY: 0,
    pullDistance: 0,
    threshold: 80, // Distancia mínima para activar refresh
    maxPull: 120,
    isRefreshing: false,
    indicator: null,
    onRefresh: null,

    /**
     * Inicializar Pull-to-Refresh en un contenedor
     * @param {Function} refreshCallback - Función async a ejecutar al hacer refresh
     */
    init: (refreshCallback) => {
        if (PullToRefresh.isEnabled) return;

        PullToRefresh.onRefresh = refreshCallback;
        PullToRefresh.createIndicator();
        PullToRefresh.bindEvents();
        PullToRefresh.isEnabled = true;
    },

    /**
     * Crear el indicador visual
     */
    createIndicator: () => {
        // Remover si ya existe
        const existing = document.getElementById('ptr-indicator');
        if (existing) existing.remove();

        const indicator = document.createElement('div');
        indicator.id = 'ptr-indicator';
        indicator.innerHTML = `
            <style>
                #ptr-indicator {
                    position: fixed;
                    top: -60px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 50px;
                    height: 50px;
                    background: var(--bg-card, #fff);
                    border-radius: 50%;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    transition: top 0.2s ease-out;
                }
                #ptr-indicator.pulling {
                    transition: none;
                }
                #ptr-indicator.refreshing {
                    top: 20px !important;
                }
                #ptr-indicator .ptr-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid var(--border-color, #e5e7eb);
                    border-top-color: #3B82F6;
                    border-radius: 50%;
                    animation: none;
                }
                #ptr-indicator.refreshing .ptr-spinner {
                    animation: ptr-spin 0.8s linear infinite;
                }
                #ptr-indicator .ptr-arrow {
                    font-size: 20px;
                    color: #3B82F6;
                    transition: transform 0.2s;
                }
                #ptr-indicator.ready .ptr-arrow {
                    transform: rotate(180deg);
                }
                @keyframes ptr-spin {
                    to { transform: rotate(360deg); }
                }
            </style>
            <div class="ptr-spinner" style="display: none;"></div>
            <div class="ptr-arrow">↓</div>
        `;
        document.body.appendChild(indicator);
        PullToRefresh.indicator = indicator;
    },

    /**
     * Vincular eventos táctiles
     */
    bindEvents: () => {
        const mainContent = document.getElementById('app') || document.body;

        mainContent.addEventListener('touchstart', PullToRefresh.handleTouchStart, { passive: true });
        mainContent.addEventListener('touchmove', PullToRefresh.handleTouchMove, { passive: false });
        mainContent.addEventListener('touchend', PullToRefresh.handleTouchEnd, { passive: true });
    },

    /**
     * Manejar inicio del toque
     */
    handleTouchStart: (e) => {
        // Solo activar si estamos en el tope de la página
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 5 || PullToRefresh.isRefreshing) return;

        PullToRefresh.startY = e.touches[0].clientY;
        PullToRefresh.indicator?.classList.add('pulling');
    },

    /**
     * Manejar movimiento del dedo
     */
    handleTouchMove: (e) => {
        if (PullToRefresh.startY === 0 || PullToRefresh.isRefreshing) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 5) {
            PullToRefresh.reset();
            return;
        }

        PullToRefresh.currentY = e.touches[0].clientY;
        PullToRefresh.pullDistance = Math.max(0, PullToRefresh.currentY - PullToRefresh.startY);

        // Limitar la distancia
        if (PullToRefresh.pullDistance > PullToRefresh.maxPull) {
            PullToRefresh.pullDistance = PullToRefresh.maxPull;
        }

        // Mover indicador
        if (PullToRefresh.pullDistance > 0 && PullToRefresh.indicator) {
            e.preventDefault(); // Prevenir scroll nativo

            const progress = Math.min(PullToRefresh.pullDistance / PullToRefresh.threshold, 1);
            const indicatorY = -60 + (PullToRefresh.pullDistance * 0.6);
            PullToRefresh.indicator.style.top = `${indicatorY}px`;

            // Rotar flecha según progreso
            const arrow = PullToRefresh.indicator.querySelector('.ptr-arrow');
            if (arrow) {
                arrow.style.transform = `rotate(${progress * 180}deg)`;
            }

            // Marcar como listo si pasa el umbral
            if (PullToRefresh.pullDistance >= PullToRefresh.threshold) {
                PullToRefresh.indicator.classList.add('ready');
            } else {
                PullToRefresh.indicator.classList.remove('ready');
            }
        }
    },

    /**
     * Manejar fin del toque
     */
    handleTouchEnd: async () => {
        if (PullToRefresh.startY === 0) return;

        PullToRefresh.indicator?.classList.remove('pulling');

        // Si pasó el umbral, ejecutar refresh
        if (PullToRefresh.pullDistance >= PullToRefresh.threshold && !PullToRefresh.isRefreshing) {
            PullToRefresh.isRefreshing = true;

            // Mostrar spinner
            const spinner = PullToRefresh.indicator?.querySelector('.ptr-spinner');
            const arrow = PullToRefresh.indicator?.querySelector('.ptr-arrow');
            if (spinner) spinner.style.display = 'block';
            if (arrow) arrow.style.display = 'none';
            PullToRefresh.indicator?.classList.add('refreshing');

            try {
                if (PullToRefresh.onRefresh) {
                    await PullToRefresh.onRefresh();
                }
            } catch (error) {
                console.error('Error en refresh:', error);
            }

            // Esperar un momento para que se vea el spinner
            await new Promise(r => setTimeout(r, 500));

            // Ocultar spinner
            if (spinner) spinner.style.display = 'none';
            if (arrow) arrow.style.display = 'block';
            PullToRefresh.indicator?.classList.remove('refreshing');
            PullToRefresh.isRefreshing = false;
        }

        PullToRefresh.reset();
    },

    /**
     * Resetear estado
     */
    reset: () => {
        PullToRefresh.startY = 0;
        PullToRefresh.currentY = 0;
        PullToRefresh.pullDistance = 0;

        if (PullToRefresh.indicator) {
            PullToRefresh.indicator.style.top = '-60px';
            PullToRefresh.indicator.classList.remove('pulling', 'ready');
            const arrow = PullToRefresh.indicator.querySelector('.ptr-arrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    },

    /**
     * Destruir instancia
     */
    destroy: () => {
        const mainContent = document.getElementById('app') || document.body;
        mainContent.removeEventListener('touchstart', PullToRefresh.handleTouchStart);
        mainContent.removeEventListener('touchmove', PullToRefresh.handleTouchMove);
        mainContent.removeEventListener('touchend', PullToRefresh.handleTouchEnd);

        PullToRefresh.indicator?.remove();
        PullToRefresh.isEnabled = false;
    }
};
