export const PipelineService = {
    // Obtener todas las oportunidades (Próximamente desde Firebase)
    getAll: async () => {
        return []; // Retorna vacío por ahora
    },

    // Actualizar la etapa (Drag & Drop)
    updateStage: async (id, newStage) => {
        console.log(`Moviendo deal ${id} a etapa ${newStage}`);
        // Aquí irá el update a Firebase
        return true;
    }
};