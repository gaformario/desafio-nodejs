import { PrismaClient, Project } from '@prisma/client';
import express from 'express';

const router = express.Router();
const prisma = new PrismaClient();

// Método para criar um projeto
async function createProject(name: string, description: string, creatorId: number): Promise<Project> {
    try {
        const creator = await prisma.user.findUnique({
            where: { id: creatorId },
        });

        if (!creator) {
            throw new Error('Usuário criador não encontrado');
        }

        const newProject = await prisma.project.create({
            data: {
                name: name,
                description: description,
                creatorId: creatorId, 
            },
        });

        return newProject;
    } catch (error: any) {
        throw new Error('Erro ao criar projeto: ' + error.message);
    }
}

// Método para adicionar um usuário como membro a um projeto
async function addMembers(userId: number, projectId: number, creatorId: number): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
  
    if (!project) {
      throw new Error('Projeto não encontrado.');
    }

    if (!userId) {
        throw new Error('Usuário não encontrado.');
      }
  
    if (project.members[0].id !== creatorId) {
      throw new Error('Somente o criador do projeto pode adicionar membros.');
    }
  
    if (project.members.some((member) => member.id === userId)) {
      throw new Error('O usuário já é um membro deste projeto.');
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


// Método para remover um usuário de um projeto
async function removeUserFromProject(userId: number, projectId: number, creatorId: number): Promise<void> {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    if (project.creatorId !== creatorId) {
      throw new Error('Apenas o criador do projeto pode remover membros');
    }
    
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        members: {
          disconnect: {
            id: userId,
          },
        },
      },
    });
  } catch (error: any) {
    throw new Error('Erro ao remover usuário do projeto: ' + error.message);
  }
}

// Rota para criar um novo projeto
router.post('/', async (req, res) => {
  const { name, description, creatorId } = req.body;
  try {
    const newProject = await createProject(name, description, creatorId);
    res.status(201).json({message: 'Projeto criado com sucesso'});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para listar todos os projetos
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para excluir um projeto pelo ID
router.delete('/:projectId', async (req, res) => {
    const projectId = parseInt(req.params.projectId);

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        await prisma.project.delete({
            where: {
                id: projectId,
            },
        });

        res.json({ message: 'Projeto excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir projeto' });
    }
});

// Rota para adicionar um usuário como membro a um projeto
router.post('/:projectId/members/:userId', async (req, res) => {
    const { projectId, userId } = req.params;
    const { creatorId } = req.body;

    try {
        await addMembers(Number(userId), Number(projectId), Number(creatorId));
        res.status(200).json({ message: 'Usuário adicionado ao projeto com sucesso' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para deletar um usuário de um projeto
router.delete('/:projectId/members/:userId', async (req, res) => {
  const { projectId, userId } = req.params;
  const { creatorId } = req.body;
  try {
    await removeUserFromProject(Number(userId), Number(projectId), creatorId);
    res.json({ message: 'Usuário removido do projeto com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
