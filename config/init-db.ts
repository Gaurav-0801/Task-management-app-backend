/**
 * Database initialization utility
 * Automatically creates the tasks table if it doesn't exist
 */

import sql from "./database"

export async function initializeDatabase(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️  DATABASE_URL not set, skipping database initialization")
    return
  }

  try {
    // Check if tasks table exists
    const checkTable = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'tasks'
    `
    
    const result = await sql.query(checkTable)
    const tableExists = Array.isArray(result) && result.length > 0

    if (tableExists) {
      console.log("✅ Tasks table already exists")
      return
    }

    console.log("📝 Initializing database: Creating tasks table...")

    // Create tasks table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
    `)

    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)
    `)

    console.log("✅ Database initialized successfully!")
  } catch (error: any) {
    console.error("❌ Error initializing database:", error?.message || error)
    // Don't throw - allow server to start even if init fails
    // The error will be caught when trying to use the database
  }
}


