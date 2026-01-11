/**
 * PubSub (Publisher/Subscriber)
 * Sistema de eventos centralizado para comunicación entre módulos.
 */
export const PubSub = {
    events: {},

    /**
     * Suscribirse a un evento
     * @param {string} eventName - Nombre del evento (ej: 'AUTH_CHANGED')
     * @param {function} fn - Función a ejecutar cuando ocurra el evento
     */
    subscribe: function (eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },

    /**
     * Publicar un evento (avisar a los suscriptores)
     * @param {string} eventName - Nombre del evento
     * @param {any} data - Datos a enviar
     */
    publish: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(fn => {
                fn(data);
            });
        }
    }
};