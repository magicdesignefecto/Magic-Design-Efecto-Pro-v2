import { TASKS_MOCK } from '../mock/tasks.mock.js';

export const TasksService = {
    // Para el Dashboard: Traer todas las tareas de todos los proyectos
    getAll: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...TASKS_MOCK]);
            }, 300);
        });
    },

    getByProject: async (projectId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const tasks = TASKS_MOCK.filter(t => t.projectId == projectId);
                resolve(tasks);
            }, 300);
        });
    },

    create: async (task) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Guardamos fecha (dueDate)
                const newTask = { ...task, id: Date.now(), completed: false };
                TASKS_MOCK.push(newTask);
                resolve(newTask);
            }, 400);
        });
    },

    toggle: async (taskId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const task = TASKS_MOCK.find(t => t.id == taskId);
                if (task) task.completed = !task.completed;
                resolve(task);
            }, 200);
        });
    }
};