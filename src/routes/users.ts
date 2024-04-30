import { PrismaClient, User, Project } from '@prisma/client';
import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// Método para inserir um novo usuário
async function createUser(name: string, email: string, password: string): Promise<void> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  
    if (existingUser) {
      throw new Error('Este email já está em uso.');
    }
  
    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);
  
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
async function listUsers(): Promise<any[]> {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        throw new Error('Erro ao listar usuários');
    }
}

 // Método para designar o usuario responsavel pelo projeto
 async function addUserIncial(userId:number, projectId:number) {
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
    } catch (error: any) {
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
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});

// Rota para listar todos os usuários
router.get('/', async (req, res) => {
    try {
        const users = await listUsers();
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para adicionar usuario inicial a um projeto
router.post('/:projectId/members/:userId', async (req, res) => {
    try {
        const { projectId, userId} = req.params;
        await addUserIncial(Number(userId), Number(projectId));
        res.status(200).json({ message: 'Usuario adicionado com sucesso' });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  
export default router;
