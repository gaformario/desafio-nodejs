"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Método para criar uma tarefa
async function createTask(userId, projectId, title, description, tags) {
    const projectWithMembers = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
    });
    if (!projectWithMembers) {
        throw new Error('Projeto não encontrado.');
    }
    if (!projectWithMembers.members.some((member) => member.id === userId)) {
        throw new Error('Você não é membro deste projeto e não pode criar tarefas.');
    }
    if (!tags || tags.length === 0) {
        throw new Error('As tarefas precisam ter pelo menos uma tag.');
    }
    const task = await prisma.task.create({
        data: {
            title,
            description,
            tags: {
                create: tags.map((tag) => ({ title: tag })),
            },
            user: { connect: { id: userId } },
            project: { connect: { id: projectId } },
            status: client_1.TaskStatus.Pending
        },
    });
    return task;
}
// Método para atualizar uma tarefa
async function updateTask(userId, taskId, title, description, tags, status) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: { include: { members: true } } },
    });
    if (!task) {
        throw new Error('Tarefa não encontrada.');
    }
    if (!task.project.members.some((member) => member.id === userId)) {
        throw new Error('Você não é membro deste projeto e não pode editar tarefas.');
    }
    if (task.status === 'Completed') {
        throw new Error('Tarefas concluídas não podem ser editadas.');
    }
    if (!tags || tags.length === 0) {
        throw new Error('As tarefas precisam ter pelo menos uma tag.');
    }
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
            title,
            description,
            tags: {
                deleteMany: {},
                create: tags.map((tag) => ({ title: tag })),
            },
            status
        },
    });
    return updatedTask;
}
// Método para atualizar o status de uma tarefa
async function updateTaskStatus(taskId, newStatus) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
    });
    if (!task) {
        throw new Error('Tarefa não encontrada.');
    }
    if (task.status === client_1.TaskStatus.Completed) {
        throw new Error('Tarefas concluídas não podem ser editadas.');
    }
    await prisma.task.update({
        where: { id: taskId },
        data: {
            status: newStatus,
        },
    });
}
// Rotas
// Rota para criar tasks e tags
router.post('/', async (req, res) => {
    const { userId, projectId, title, description, tags } = req.body;
    try {
        const newTask = await createTask(userId, projectId, title, description, tags);
        res.json(newTask);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Rota para alterar uma task
router.put('/:id', async (req, res) => {
    const { userId } = req.body;
    const { id } = req.params;
    const { title, description, tags, status } = req.body;
    try {
        const updatedTask = await updateTask(userId, Number(id), title, description, tags, status);
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Rota para atualizar o status da task
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;
    try {
        await updateTaskStatus(Number(id), newStatus);
        res.json({ message: 'Status da tarefa atualizado com sucesso.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
