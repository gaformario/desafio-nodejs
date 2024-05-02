"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Método para inserir um novo usuário
async function createUser(name, email, password) {
    const usuarioExistente = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    if (usuarioExistente) {
        throw new Error('Este email já está em uso.');
    }
    // Hash da senha
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    // Insere o novo usuário no banco de dados, incluindo a hash da senha
    await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: passwordHash,
        },
    });
}
// Método para listar todos os usuários
async function listUsers(page, pageSize) {
    try {
        const users = await prisma.user.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return users;
    }
    catch (error) {
        throw new Error('Erro ao listar usuários');
    }
}
// Método para designar o usuario responsavel pelo projeto
async function addUserIncial(userId, projectId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error('Usuário não encontrado na plataforma.');
    }
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        throw new Error('Projeto não encontrado.');
    }
    await prisma.project.update({
        where: { id: projectId },
        data: {
            members: {
                connect: { id: userId },
            },
        },
    });
}
// ROTAS
// Rota para criar um novo usuário
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        await createUser(name, email, password);
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Rota para excluir um usuário pelo ID
router.delete('/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        // Verifica se o usuário existe
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        // Remove o usuário do banco de dados
        await prisma.user.delete({
            where: {
                id: userId,
            },
        });
        res.json({ message: 'Usuário excluído com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});
// Rota para listagem de usuários com paginação
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    try {
        const users = await listUsers(page, pageSize);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Rota para adicionar usuario inicial a um projeto
router.post('/:projectId/add-members/:userId', async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        await addUserIncial(Number(userId), Number(projectId));
        res.status(200).json({ message: 'Usuario adicionado com sucesso' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
