import "dotenv/config"
import express from "express"
import cors from "cors"
import tasksRouter from "./routes/tasks"
import { initializeDatabase } from "./config/init-db"

const app = express()
// Parse PORT and ensure it's a valid number (Render provides PORT as a number)
const PORT = process.env.PORT 
  ? (Number.parseInt(process.env.PORT, 10) || 3001)
  : 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/tasks", tasksRouter)

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

// Initialize database and start server
async function startServer() {
  // Initialize database (creates table if it doesn't exist)
  await initializeDatabase()

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})

export default app

