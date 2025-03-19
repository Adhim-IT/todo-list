"use client"

// Import hooks and components
import { useEffect, useState } from "react"
import { TodoList } from "@/components/todolist/todolist-list" 
import { getTasks } from "@/lib/todo" 
import type { Task } from "@/types" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" 


export default function TodoPage() {
  // State untuk menyimpan daftar tugas
  const [tasks, setTasks] = useState<Task[]>([])
  // State untuk status loading saat mengambil data
  const [loading, setLoading] = useState(true)

  // Fungsi untuk mengambil tugas dari  database
  const fetchTasks = async () => {
    setLoading(true) // Set status loading menjadi true saat memulai pengambilan data
    try {
      const { tasks, error } = await getTasks() // Memanggil fungsi untuk mendapatkan daftar tugas
      if (error) { // Jika terjadi error, tampilkan di console
        console.error(error)
        return
      }
      setTasks(tasks || []) // Jika tidak ada error, update state dengan daftar tugas yang didapat
    } catch (error) {
      console.error("Error fetching tasks:", error) // Menangani error jika request gagal
    } finally {
      setLoading(false) // Set status loading menjadi false setelah selesai mengambil data
    }
  }

  // useEffect untuk memanggil fetchTasks saat komponen pertama kali dirender
  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="container mx-auto py-10">
      {/* Menggunakan Card sebagai wrapper UI */}
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle> {/* Judul halaman */}
        </CardHeader>
        <CardContent>
          {loading ? (
            // Jika data masih dimuat, tampilkan teks loading
            <div className="flex justify-center py-10">Loading...</div>
          ) : (
            // Jika data sudah siap, tampilkan daftar tugas menggunakan komponen TodoList
            <TodoList tasks={tasks} onRefresh={fetchTasks} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
