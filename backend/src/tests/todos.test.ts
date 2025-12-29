import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../prisma.js";

const app = createApp();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.todo.deleteMany();
});

describe("Todos API", () => {
  it("GET /api/todos returns empty list initially", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/todos creates a todo", async () => {
    const res = await request(app).post("/api/todos").send({ title: "Test todo" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test todo");
    expect(res.body.completed).toBe(false);
  });

  it("PUT /api/todos/:id updates a todo", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Old" });
    const id = created.body.id;

    const updated = await request(app).put(`/api/todos/${id}`).send({ title: "New", completed: true });
    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe("New");
    expect(updated.body.completed).toBe(true);
  });

  it("DELETE /api/todos/:id deletes a todo", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Delete me" });
    const id = created.body.id;

    const del = await request(app).delete(`/api/todos/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get("/api/todos");
    expect(list.body).toEqual([]);
  });
});
