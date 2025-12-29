import { Router } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";

export const todosRouter = Router();

const createTodoSchema = z.object({
  title: z.string().min(1).max(200)
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional()
});

todosRouter.get("/", async (_req, res) => {
  const todos = await prisma.todo.findMany({ orderBy: { id: "desc" } });
  res.json(todos);
});

todosRouter.post("/", async (req, res) => {
  const parsed = createTodoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const todo = await prisma.todo.create({ data: parsed.data });
  res.status(201).json(todo);
});

todosRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = updateTodoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: parsed.data
    });
    res.json(todo);
  } catch {
    res.status(404).json({ error: "Todo not found" });
  }
});

todosRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Todo not found" });
  }
});
