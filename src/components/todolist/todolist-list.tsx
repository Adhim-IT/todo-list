"use client" // Menandakan bahwa komponen ini berjalan di sisi klien

import { useState } from "react" 
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" 
import { Button } from "@/components/ui/button" 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" 
import type { Task } from "@/types" // Menggunakan tipe data Task untuk TypeScript
import { deleteTask, updateTask } from "@/lib/todo" 
import { TodoListForm } from "./todolist-form" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog" 
import { Trash2, Check } from "lucide-react"

// Mendefinisikan properti yang diterima oleh komponen
interface TodoListProps {
  tasks: Task[] // Array daftar tugas
  onRefresh: () => void // Fungsi callback untuk memperbarui daftar tugas setelah perubahan
}

export function TodoList({ tasks, onRefresh }: TodoListProps) {
  // State untuk menyimpan tugas yang sedang diedit
  const [editTask, setEditTask] = useState<Task | null>(null)
  // State untuk mengontrol apakah modal dialog terbuka
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fungsi untuk menandai tugas sebagai selesai
  const handleMarkComplete = async (task: Task) => {
    await updateTask({
      ...task,
      status: true, // Mengubah status tugas menjadi selesai
    })
    onRefresh() // Memperbarui daftar tugas setelah perubahan
  }

  // Fungsi untuk menghapus tugas berdasarkan ID
  const handleDelete = async (id: number) => {
    await deleteTask(id) // Menghapus tugas dari database
    onRefresh() // Memperbarui daftar tugas setelah penghapusan
  }

  // Fungsi untuk menentukan warna prioritas tugas
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 font-medium"
      case "MEDIUM":
        return "text-amber-600 font-medium"
      case "LOW":
        return "text-green-600 font-medium"
      default:
        return ""
    }
  }

  // Fungsi untuk menampilkan status tugas dalam teks berwarna
  const getStatusText = (status: boolean) => {
    return status ? (
      <span className="text-green-600">Selesai</span>
    ) : (
      <span className="text-red-600">Belum Selesai</span>
    )
  }

  return (
    <>
      {/* Tabel daftar tugas */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Jika tidak ada tugas, tampilkan pesan */}
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            // Menampilkan daftar tugas dalam tabel
            tasks.map((task, index) => (
              <TableRow key={task.id} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{task.task}</TableCell>
                <TableCell className={getPriorityColor(task.priority)}>
                  {task.priority === "HIGH" ? "High" : task.priority === "MEDIUM" ? "Medium" : "Low"}
                </TableCell>
                <TableCell>{format(new Date(task.due_date), "yyyy-MM-dd")}</TableCell>
                <TableCell>{getStatusText(task.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Tombol untuk menandai tugas sebagai selesai */}
                    {!task.status && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleMarkComplete(task)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Selesai
                      </Button>
                    )}
                    {/* Tombol untuk menghapus tugas dengan konfirmasi */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                          <Trash2 className="h-4 w-4 mr-1" /> Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(task.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal untuk menambah atau mengedit tugas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4" onClick={() => setEditTask(null)}>
            Add New Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <TodoListForm
            initialData={editTask || undefined}
            onSuccess={() => {
              setIsDialogOpen(false)
              onRefresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
