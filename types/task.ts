export interface Task {
  id: number
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  created_at: Date
  updated_at: Date
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: "low" | "medium" | "high"
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: "pending" | "in-progress" | "completed"
  priority?: "low" | "medium" | "high"
}

