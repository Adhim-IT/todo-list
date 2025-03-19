"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteTask, updateTask } from "@/lib/todo"
import { TodoListForm } from "./todolist-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MoreHorizontal, Check, Trash2, Edit, Search, Plus, ListTodo, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Task } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Swal from "sweetalert2"

// Definisi tipe untuk tugas


interface TodoListProps {
  tasks: Task[]
  onRefresh: () => void
}

export function TodoList({ tasks, onRefresh }: TodoListProps) {
  // State untuk mengelola tugas yang sedang diedit
  const [editTask, setEditTask] = useState<Task | null>(null)

  // State untuk mengelola dialog tambah/edit tugas
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState("")

  // State untuk menandai komponen sudah dimuat
  const [isMounted, setIsMounted] = useState(false)

  // State untuk filter
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Effect untuk menandai komponen sudah dimuat
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, priorityFilter, statusFilter])

  // Filter tugas berdasarkan pencarian, prioritas, dan status
  const filteredTasks = tasks.filter((task) => {
    // Filter berdasarkan pencarian
    const matchesSearch =
      task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter berdasarkan prioritas
    const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter

    // Filter berdasarkan status
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "COMPLETED" && task.status) ||
      (statusFilter === "PENDING" && !task.status)

    return matchesSearch && matchesPriority && matchesStatus
  })

  // Dapatkan tugas saat ini untuk pagination
  const indexOfLastTask = currentPage * itemsPerPage
  const indexOfFirstTask = indexOfLastTask - itemsPerPage
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)

  // Hitung total halaman
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)

  // Navigasi pagination
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Menangani penandaan tugas sebagai selesai
  const handleMarkComplete = async (task: Task) => {
    try {
      // Panggil API untuk memperbarui status tugas
      await updateTask({
        ...task,
        status: true,
      })

      // Tampilkan notifikasi sukses
      Swal.fire({
        title: "Berhasil!",
        text: "Tugas telah ditandai sebagai selesai",
        icon: "success",
        timer: 1500,
      })

      // Refresh daftar tugas
      onRefresh()
    } catch (error) {
      console.error("Error marking task as complete:", error)

      // Tampilkan notifikasi error
      Swal.fire({
        title: "Kesalahan!",
        text: "Gagal memperbarui status tugas",
        icon: "error",
      })
    }
  }

  // Menangani penghapusan tugas
  const handleDelete = async (id: number) => {
    // Konfirmasi penghapusan
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Tugas akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          // Panggil API untuk menghapus tugas
          await deleteTask(id)

          // Tampilkan notifikasi sukses
          Swal.fire({
            title: "Terhapus!",
            text: "Tugas Anda telah dihapus.",
            icon: "success",
            timer: 1500,
          })

          // Refresh daftar tugas
          onRefresh()
        } catch (error) {
          console.error("Error deleting task:", error)

          // Tampilkan notifikasi error
          Swal.fire({
            title: "Kesalahan!",
            text: "Gagal menghapus tugas",
            icon: "error",
          })
        }
      }
    })
  }

  // Menangani pengeditan tugas
  const handleEdit = (task: Task) => {
    setEditTask(task)
    setIsDialogOpen(true)
  }

  // Mendapatkan badge prioritas
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge variant="destructive">Tinggi</Badge>
      case "MEDIUM":
        return (
          <Badge variant="default" className="bg-amber-500">
            Sedang
          </Badge>
        )
      case "LOW":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Rendah
          </Badge>
        )
      default:
        return null
    }
  }

  // Mendapatkan badge status
  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        <Check className="h-3 w-3 mr-1" /> Selesai
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
        Belum Selesai
      </Badge>
    )
  }

  // Jangan render apa pun jika komponen belum dimuat
  if (!isMounted) {
    return null
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          {/* Judul kartu */}
          <CardTitle className="flex items-center text-xl font-bold">
            <ListTodo className="h-5 w-5 mr-2 text-primary" />
            Pengelola Tugas
          </CardTitle>

          {/* Dialog untuk menambah/mengedit tugas */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setEditTask(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Tugas Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editTask ? "Edit Tugas" : "Tambah Tugas Baru"}</DialogTitle>
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
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Area pencarian dan filter */}
          <div className="flex flex-col md:flex-row gap-2">
            {/* Kotak pencarian */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari tugas..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dropdown filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Tugas</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Filter prioritas */}
                <div className="p-2">
                  <p className="text-sm font-medium mb-1">Prioritas</p>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Prioritas</SelectItem>
                      <SelectItem value="HIGH">Tinggi</SelectItem>
                      <SelectItem value="MEDIUM">Sedang</SelectItem>
                      <SelectItem value="LOW">Rendah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DropdownMenuSeparator />

                {/* Filter status */}
                <div className="p-2">
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Status</SelectItem>
                      <SelectItem value="COMPLETED">Selesai</SelectItem>
                      <SelectItem value="PENDING">Belum Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabel Tugas */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Tugas</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <ListTodo className="h-8 w-8 mb-2 opacity-40" />
                        <p>Tidak ada tugas ditemukan</p>
                        <p className="text-sm">Coba sesuaikan pencarian atau filter Anda</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTasks.map((task, index) => (
                    <TableRow key={task.id} className={`${task.status ? "bg-green-50/50" : ""}`}>
                      {/* Nomor urut */}
                      <TableCell className="font-medium">{indexOfFirstTask + index + 1}</TableCell>

                      {/* Nama tugas */}
                      <TableCell>
                        <span className={task.status ? "line-through text-muted-foreground" : ""}>{task.task}</span>
                      </TableCell>

                      {/* Deskripsi tugas */}
                      <TableCell>
                        <span className={task.status ? "line-through text-muted-foreground" : ""}>
                          {task.description}
                        </span>
                      </TableCell>

                      {/* Prioritas tugas */}
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>

                      {/* Tanggal jatuh tempo */}
                      <TableCell>{format(new Date(task.due_date), "dd MMM yyyy")}</TableCell>

                      {/* Status tugas */}
                      <TableCell>{getStatusBadge(task.status)}</TableCell>

                      {/* Menu aksi */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Aksi Tugas</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!task.status && (
                              <DropdownMenuItem onClick={() => handleMarkComplete(task)} className="text-green-600">
                                <Check className="h-4 w-4 mr-2" />
                                Tandai Selesai
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEdit(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Tugas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus Tugas
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination dan Item Per Halaman */}
          {filteredTasks.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
              {/* Pengaturan jumlah item per halaman */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tampilkan</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number.parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue placeholder="5" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kontrol pagination */}
              <Pagination>
                <PaginationContent>
                  {/* Tombol halaman sebelumnya */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => goToPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {/* Nomor halaman */}
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageToShow
                    if (totalPages <= 3) {
                      pageToShow = i + 1
                    } else if (currentPage <= 2) {
                      pageToShow = i + 1
                    } else if (currentPage >= totalPages - 1) {
                      pageToShow = totalPages - 2 + i
                    } else {
                      pageToShow = currentPage - 1 + i
                    }

                    return (
                      <PaginationItem key={i}>
                        <PaginationLink onClick={() => goToPage(pageToShow)} isActive={currentPage === pageToShow}>
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {/* Tombol halaman berikutnya */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => goToPage(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

