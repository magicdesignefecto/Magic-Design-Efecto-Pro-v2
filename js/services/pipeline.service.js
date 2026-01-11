// PipelineService - Conectado a Firebase Firestore
// El Pipeline muestra las cotizaciones (quotes) como oportunidades de venta
import { db, auth } from '../core/firebase-config.js';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { CacheManager } from '../utils/cache-manager.js';

const CACHE_KEY = 'pipeline';

export const PipelineService = {
    // Obtener todas las oportunidades (quotes del usuario)
    getAll: async (forceRefresh = false) => {
        try {
            const user = auth.currentUser;
            if (!user) return [];

            const cacheKey = `${CACHE_KEY}_${user.uid}`;

            // Verificar caché
            if (!forceRefresh) {
                const cached = CacheManager.get(cacheKey);
                if (cached) return cached;
            }

            // Obtener cotizaciones del usuario
            const quotesRef = collection(db, "quotes");
            const q = query(quotesRef, where("userId", "==", user.uid));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                CacheManager.set(cacheKey, [], 2 * 60 * 1000);
                return [];
            }

            // Mapear cotizaciones a formato de pipeline
            const deals = snapshot.docs.map(docSnap => {
                const data = docSnap.data();

                // Mapear status de cotización a stage de pipeline
                let stage = 'Nuevo';
                const status = (data.status || '').toLowerCase();

                if (status === 'pendiente' || status === 'nuevo') {
                    stage = 'Nuevo';
                } else if (status === 'enviada' || status === 'propuesta') {
                    stage = 'Propuesta';
                } else if (status === 'negociacion' || status === 'negociación' || status === 'en negociacion') {
                    stage = 'Negociación';
                } else if (status === 'aceptada' || status === 'aprobada' || status === 'cerrada' || status === 'ganada') {
                    stage = 'Cierre';
                }

                return {
                    id: docSnap.id,
                    title: data.title || `Cotización #${data.quoteNumber || docSnap.id.slice(-4)}`,
                    client: data.client || 'Sin cliente',
                    value: parseFloat(data.total) || 0,
                    currency: data.currency || 'BOB',
                    stage: data.pipelineStage || stage, // Usar stage guardado o calculado
                    status: data.status,
                    createdAt: data.createdAt
                };
            });

            // Ordenar por fecha
            deals.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            // Guardar en caché (2 minutos)
            CacheManager.set(cacheKey, deals, 2 * 60 * 1000);

            return deals;
        } catch (error) {
            console.error("Error obteniendo pipeline:", error);
            return [];
        }
    },

    // Actualizar la etapa (Drag & Drop)
    updateStage: async (id, newStage) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No autenticado");

            const docRef = doc(db, "quotes", id);

            // Mapear stage a status para mantener consistencia
            let newStatus = 'Pendiente';
            if (newStage === 'Nuevo') newStatus = 'Pendiente';
            else if (newStage === 'Propuesta') newStatus = 'Enviada';
            else if (newStage === 'Negociación') newStatus = 'Negociacion';
            else if (newStage === 'Cierre') newStatus = 'Aceptada';

            await updateDoc(docRef, {
                pipelineStage: newStage,
                status: newStatus,
                updatedAt: new Date().toISOString()
            });

            // Invalidar caché
            CacheManager.invalidate(`${CACHE_KEY}_${user.uid}`);
            CacheManager.invalidate(`quotes_${user.uid}`);

            return true;
        } catch (error) {
            console.error("Error actualizando stage:", error);
            return false;
        }
    },

    // Forzar actualización
    refresh: async () => {
        return await PipelineService.getAll(true);
    }
};
