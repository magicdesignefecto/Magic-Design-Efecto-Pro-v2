export const PROJECTS_MOCK = [
    { 
        id: 1, 
        name: "Web Farmacia Central", 
        client: "Farmacia Central", 
        status: "En Progreso", 
        progress: 60, // Porcentaje de avance
        budget: 1200, // Lo que cobraste (Venta)
        cost: 450,    // Lo que has gastado (Horas/Proveedores)
        deadline: "2023-11-30",
        currency: "USD"
    },
    { 
        id: 2, 
        name: "Campaña Navidad", 
        client: "Tienda Solar", 
        status: "Riesgo", 
        progress: 80, 
        budget: 5000, 
        cost: 4800, // ¡Casi te pasas del presupuesto! (Riesgo)
        deadline: "2023-12-24",
        currency: "BOB"
    },
    { 
        id: 3, 
        name: "App Delivery", 
        client: "Restaurante Sol", 
        status: "Completado", 
        progress: 100, 
        budget: 3500, 
        cost: 1200, // Muy rentable
        deadline: "2023-10-15",
        currency: "USD"
    },
    { 
        id: 4, 
        name: "Branding Corporativo", 
        client: "Constructora H", 
        status: "Pausado", 
        progress: 30, 
        budget: 800, 
        cost: 100, 
        deadline: "2023-12-01",
        currency: "USD"
    }
];