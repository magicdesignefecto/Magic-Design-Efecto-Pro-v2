// DashboardService - Optimizado con Caché
import { db, auth } from '../core/firebase-config.js';
import { collection, getCountFromServer, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { CacheManager } from '../utils/cache-manager.js';

const CACHE_KEY = 'dashboard';

export const DashboardService = {
    getData: async (forceRefresh = false) => {
        try {
            const user = auth.currentUser;
            if (!user) return {
                stats: { clients: 0, leads: 0, projects: 0, revenue: 0, goalsCompleted: 0, pendingActions: 0 },
                recentLeads: [],
                goalsProgress: []
            };

            const cacheKey = `${CACHE_KEY}_${user.uid}`;

            // Verificar caché (1 minuto TTL para dashboard - se actualiza frecuentemente)
            if (!forceRefresh) {
                const cached = CacheManager.get(cacheKey);
                if (cached) return cached;
            }

            // ========== OBTENER DATOS ==========

            // Usar caché de otros servicios si disponible
            let clients = CacheManager.get(`clients_${user.uid}`);
            let leads = CacheManager.get(`leads_${user.uid}`);
            let projects = CacheManager.get(`projects_${user.uid}`);
            let quotes = CacheManager.get(`quotes_${user.uid}`);
            let goals = CacheManager.get(`goals_${user.uid}`);

            // Solo ir a Firebase para lo que no está en caché
            const promises = [];

            if (!clients) {
                const clientsColl = collection(db, "clients");
                const qClients = query(clientsColl, where("userId", "==", user.uid));
                promises.push(
                    getCountFromServer(qClients).then(snap => ({ type: 'clients', count: snap.data().count }))
                );
            }

            if (!leads) {
                const leadsColl = collection(db, "leads");
                const qLeads = query(leadsColl, where("userId", "==", user.uid));
                promises.push(
                    getDocs(qLeads).then(snap => ({
                        type: 'leads',
                        data: snap.docs.map(d => ({ id: d.id, ...d.data() }))
                    }))
                );
            }

            if (!projects) {
                const projectsColl = collection(db, "projects");
                const qProjects = query(projectsColl, where("userId", "==", user.uid));
                promises.push(
                    getCountFromServer(qProjects).then(snap => ({ type: 'projects', count: snap.data().count })).catch(() => ({ type: 'projects', count: 0 }))
                );
            }

            if (!quotes) {
                const quotesRef = collection(db, "quotes");
                const qQuotes = query(quotesRef, where("userId", "==", user.uid));
                promises.push(
                    getDocs(qQuotes).then(snap => ({
                        type: 'quotes',
                        data: snap.docs.map(d => d.data())
                    })).catch(() => ({ type: 'quotes', data: [] }))
                );
            }

            if (!goals) {
                const goalsColl = collection(db, "goals");
                const qGoals = query(goalsColl, where("userId", "==", user.uid));
                promises.push(
                    getDocs(qGoals).then(snap => ({
                        type: 'goals',
                        data: snap.docs.map(d => ({ id: d.id, ...d.data() }))
                    })).catch(() => ({ type: 'goals', data: [] }))
                );
            }

            // Ejecutar todas las queries en paralelo
            const results = await Promise.all(promises);

            // Procesar resultados
            let totalClients = clients ? clients.length : 0;
            let allLeads = leads || [];
            let totalProjects = projects ? projects.length : 0;
            let allQuotes = quotes || [];
            let allGoals = goals || [];

            results.forEach(r => {
                if (r.type === 'clients') totalClients = r.count;
                if (r.type === 'leads') allLeads = r.data;
                if (r.type === 'projects') totalProjects = r.count;
                if (r.type === 'quotes') allQuotes = r.data;
                if (r.type === 'goals') allGoals = r.data;
            });

            // ========== CALCULAR ESTADÍSTICAS ==========

            const totalLeads = allLeads.length;
            const revenue = allLeads.reduce((acc, lead) => acc + (Number(lead.total) || 0), 0);
            const pendingActions = allLeads.reduce((acc, lead) => acc + (lead.actions ? lead.actions.length : 0), 0);

            // Recent leads (del caché o de los datos frescos)
            const recentLeads = [...allLeads]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 5);

            // ========== CALCULAR PROGRESO DE METAS ==========

            let goalsProgress = [];
            let goalsCompleted = 0;

            for (const data of allGoals) {
                const goalType = data.type || 'sales';
                let current = 0;

                if (data.startDate && data.targetDate) {
                    const startDate = new Date(data.startDate).toISOString();
                    const endDate = new Date(data.targetDate + 'T23:59:59').toISOString();

                    if (goalType === 'leads') {
                        allLeads.forEach(lead => {
                            const createdAt = lead.createdAt || '';
                            if (createdAt >= startDate && createdAt <= endDate) current++;
                        });
                    } else {
                        allQuotes.forEach(qData => {
                            const createdAt = qData.createdAt || '';
                            const status = (qData.status || '').toLowerCase();
                            const currency = qData.currency || 'BOB';

                            if (createdAt >= startDate && createdAt <= endDate && currency === (data.currency || 'BOB')) {
                                if (['aceptada', 'aprobada', 'cerrada', 'accepted', 'closed'].includes(status)) {
                                    current += parseFloat(qData.total) || 0;
                                }
                            }
                        });
                    }
                }

                const target = data.target || 0;
                const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                if (percent >= 100) goalsCompleted++;

                goalsProgress.push({
                    id: data.id,
                    name: data.name || 'Meta',
                    type: goalType,
                    currency: data.currency || null,
                    target: target,
                    current: current,
                    percent: percent
                });
            }

            // ========== RESULTADO FINAL ==========

            const result = {
                stats: {
                    clients: totalClients,
                    leads: totalLeads,
                    projects: totalProjects,
                    revenue: revenue,
                    goalsCompleted: goalsCompleted,
                    pendingActions: pendingActions
                },
                recentLeads: recentLeads,
                goalsProgress: goalsProgress
            };

            // Guardar en caché (1 minuto)
            CacheManager.set(cacheKey, result, 60 * 1000);

            return result;

        } catch (error) {
            console.error("Error cargando Dashboard:", error);
            return {
                stats: { clients: 0, leads: 0, projects: 0, revenue: 0, goalsCompleted: 0, pendingActions: 0 },
                recentLeads: [],
                goalsProgress: []
            };
        }
    },

    // Forzar actualización
    refresh: async () => {
        return await DashboardService.getData(true);
    }
};
