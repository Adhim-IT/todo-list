"use server"

import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"
import type { TaskFormData } from "@/types"

export async function getTasks() {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
    })
    return { tasks }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return { error: "Failed to fetch tasks" }
  }
}

export async function getTaskById(id: number) {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: id,
      },
    })
    return { task }
  } catch (error) {
    console.error("Error fetching task:", error)
    return { error: "Failed to fetch task" }
  }
}

export async function createTask(formData: TaskFormData) {
  try {
      if (!formData.task || !formData.priority) {
        return { error: "Task and priority are required" }
      }
    const task = await prisma.task.create({
      data: {
        task: formData.task,
        priority: formData.priority,
        due_date: formData.due_date,
        status: formData.status,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
    revalidatePath("/todo")
    return { task }
  } catch (error) {
    console.error("Error creating task:", error)
    return { error: "Failed to create task" }
  }
}

export async function updateTask(formData: TaskFormData) {
  try {
    if (!formData.id) {
      return { error: "Task ID is required for updating" }
    }
    const task = await prisma.task.update({
      where: {
        id: formData.id,
      },
      data: {
        task: formData.task,
        priority: formData.priority,
        due_date: formData.due_date,
        status: formData.status,
        updated_at: new Date(),
      },
    })
    revalidatePath("/todo")
    return { task }
  } catch (error) {
    console.error("Error updating task:", error)
    return { error: "Failed to update task" }
  }
}

export async function deleteTask(id: number) {
  try {
    const task = await prisma.task.update({
      where: {
        id: id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    })
    revalidatePath("/todo")
    return { task }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { error: "Failed to delete task" }
  }
}

