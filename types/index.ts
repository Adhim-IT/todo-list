export interface Task {
    id: number;
    task: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    due_date: Date;

    status: boolean;
    deleted_at?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
}

export interface TaskFormData {
    id?: number;
    task: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    due_date: Date;
    status: boolean;
}
