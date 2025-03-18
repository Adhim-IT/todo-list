import { z } from "zod";

export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const TaskFormSchema = z.object({
  id: z.number().int().positive().optional(),
  task: z
    .string()
    .min(2, {
      message: "Task must be at least 2 characters.",
    })
    .max(255, "Task must be less than 255 characters"),
  priority: PriorityEnum,
  due_date: z.date(),
  status: z.boolean().default(false),
})