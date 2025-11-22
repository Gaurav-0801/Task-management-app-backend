import express, { type Request, type Response } from "express"
import sql from "../config/database"
import type { CreateTaskInput, UpdateTaskInput } from "../types/task"

const router = express.Router()

// GET all tasks
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tasks = await sql.query("SELECT * FROM tasks ORDER BY created_at DESC")
    res.json(tasks)
  } catch (error: any) {
    console.error("Error fetching tasks:", error)
    const errorMessage = error?.message || String(error)
    // Check if it's a table doesn't exist error
    if (errorMessage.includes("does not exist") || errorMessage.includes("relation") || errorMessage.includes("table")) {
      return res.status(500).json({ 
        error: "Database table not found. Please run the migration script to create the tasks table.",
        details: errorMessage 
      })
    }
    res.status(500).json({ error: "Failed to fetch tasks", details: errorMessage })
  }
})

// GET task by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const tasks = await sql.query("SELECT * FROM tasks WHERE id = $1", [Number.parseInt(id)])

    if (tasks.length === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json(tasks[0])
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({ error: "Failed to fetch task" })
  }
})

// POST create task
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, priority = "medium" }: CreateTaskInput = req.body

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" })
    }

    const tasks = await sql.query("INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3) RETURNING *", [
      title,
      description || null,
      priority,
    ])

    res.status(201).json(tasks[0])
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({ error: "Failed to create task" })
  }
})

// PUT update task
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, status, priority }: UpdateTaskInput = req.body

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(title)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(description)
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`)
      values.push(status)
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`)
      values.push(priority)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(Number.parseInt(id))

    const query = `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`
    const tasks = await sql.query(query, values)

    if (tasks.length === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json(tasks[0])
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ error: "Failed to update task" })
  }
})

// DELETE task
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const tasks = await sql.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [Number.parseInt(id)])

    if (tasks.length === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({ message: "Task deleted successfully", task: tasks[0] })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ error: "Failed to delete task" })
  }
})

export default router

