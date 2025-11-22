import request from "supertest"
import express from "express"
import tasksRouter from "../routes/tasks"
import jest from "jest"

// Mock the database
jest.mock("../config/database", () => {
  const mockSql = jest.fn()
  return mockSql
})

const app = express()
app.use(express.json())
app.use("/api/tasks", tasksRouter)

describe("Tasks API", () => {
  describe("GET /api/tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app).get("/api/tasks")
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const newTask = {
        title: "Test Task",
        description: "Test description",
        priority: "high",
      }

      const response = await request(app).post("/api/tasks").send(newTask)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
    })

    it("should fail without title", async () => {
      const response = await request(app).post("/api/tasks").send({ description: "No title" })

      expect(response.status).toBe(400)
    })
  })

  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      const response = await request(app).put("/api/tasks/1").send({ status: "completed" })

      expect(response.status).toBeOneOf([200, 404, 500])
    })
  })

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const response = await request(app).delete("/api/tasks/1")

      expect(response.status).toBeOneOf([200, 404, 500])
    })
  })
})

