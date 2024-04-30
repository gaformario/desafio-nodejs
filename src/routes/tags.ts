import { PrismaClient, Tag, Task } from '@prisma/client';
import express from 'express';

const router = express.Router();
const prisma = new PrismaClient();

  // Método para obter todas as tags
  async function getAllTags(): Promise<Tag[]> {
    return prisma.tag.findMany();
  }
  
  // Método para obter uma tag pelo ID
  async function getTagById(id: number): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
    });
  }
  
  // Método para atualizar uma tag
  async function updateTag(id: number, title: string): Promise<Tag | null> {
    return prisma.tag.update({
      where: { id },
      data: { title },
    });
  }
  
  // Método para excluir uma tag
  async function deleteTag(id: number): Promise<void> {
    await prisma.tag.delete({
      where: { id:id },
    });
  }
  
  // Rotas
  
  // Rota para listar as tags
  router.get('/', async (req, res) => {
    try {
      const tags = await getAllTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar as tags' });
    }
  });
  
  // Rota para listar tag por ID da tag
  router.get('/:id', async (req, res) => {
    try {
    const { id } = req.params;
      const tag = await getTagById(Number(id));
      if (!tag) {
        res.status(404).json({ error: 'Tag não encontrada' });
        return;
      }
      res.json(tag);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar a tag' });
    }
  });
  
  // Rota para alterar a tag pelo ID
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    try {
      const updatedTag = await updateTag(Number(id), title);
      if (!updatedTag) {
        res.status(404).json({ error: 'Tag não encontrada' });
        return;
      }
      res.json(updatedTag);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar a tag' });
    }
  });
  
  // Rota para deletar a tag
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await deleteTag(Number(id));
      res.json({ message: 'Tag excluída com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir a tag' });
    }
  });

export default router;
