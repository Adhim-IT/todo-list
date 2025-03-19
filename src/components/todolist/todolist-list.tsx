"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task } from "@/types"
import { deleteTask, updateTask } from "@/lib/todo"
import { TodoListForm } from "./todolist-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MoreHorizontal, Check, Trash2, Edit, Search, Plus, Calendar, ListTodo, Filter, ArrowUpDown } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Swal from "sweetalert2"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TodoListProps {
  tasks: Task[]
  onRefresh: () => void
}

export function TodoList({ tasks, onRefresh }: TodoListProps) {
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isMounted, setIsMounted] = useState(false)
  const [sortField, setSortField] = useState<string>("due_date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filter tugas berdasarkan pencarian, prioritas, dan status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = 
      priorityFilter === "ALL" || task.priority === priorityFilter;
    
    const matchesStatus = 
      statusFilter === "ALL" || 
      (statusFilter === "COMPLETED" && task.status) || 
      (statusFilter === "PENDING" && !task.status);

    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "pending" && !task.status) || 
      (activeTab === "completed" && task.status);
    
    return matchesSearch && matchesPriority && matchesStatus && matchesTab;
  });

  // Urutkan tugas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === "due_date") {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "priority") {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return sortDirection === "asc" ? priorityA - priorityB : priorityB - priorityA;
    } else if (sortField === "task") {
      return sortDirection === "asc" 
        ? a.task.localeCompare(b.task) 
        : b.task.localeCompare(a.task);
    }
    return 0;
  });

  // Dapatkan tugas saat ini untuk pagination
  const indexOfLastTask = currentPage * itemsPerPage
  const indexOfFirstTask = indexOfLastTask - itemsPerPage
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask)

  // Hitung total halaman
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage)

  // Menangani penandaan tugas sebagai selesai
  const handleMarkComplete = async (task: Task) => {
    try {
      await updateTask({
        ...task,
        status: true,
      })

      Swal.fire({
        title: "Berhasil!",
        text: "Tugas telah ditandai sebagai selesai",
        icon: "success",
        confirmButtonColor: "#3085d6",
        timer: 1500,
        customClass: {
          popup: 'animated fadeInDown faster'
        }
      })

      onRefresh()
    } catch (error) {
      console.error("Error marking task as complete:", error)

      Swal.fire({
        title: "Kesalahan!",
        text: "Gagal memperbarui status tugas",
        icon: "error",
        confirmButtonColor: "#d33",
      })
    }
  }

  // Menangani penghapusan tugas
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Tindakan ini tidak dapat dibatalkan. Tugas akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      showClass: {
        popup: 'animated fadeIn faster'
      },
      hideClass: {
        popup: 'animated fadeOut faster'
      }
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          await deleteTask(id)

          Swal.fire({
            title: "Terhapus!",
            text: "Tugas Anda telah dihapus.",
            icon: "success",
            timer: 1500,
            showClass: {
              popup: 'animated fadeIn faster'
            },
            hideClass: {
              popup: 'animated fadeOut faster'
            }
          })

          onRefresh()
        } catch (error) {
          console.error("Error deleting task:", error)

          Swal.fire({
            title: "Kesalahan!",
            text: "Gagal menghapus tugas",
            icon: "error",
            confirmButtonColor: "#d33",
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
        return <Badge variant="default" className="bg-amber-500">Sedang</Badge>
      case "LOW":
        return <Badge variant="outline" className="text-green-600 border-green-600">Rendah</Badge>
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

  // Menangani toggle pengurutan
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, priorityFilter, statusFilter, activeTab])

  // Navigasi pagination
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (!isMounted) {
    return null
  }

  // Mendapatkan jumlah tugas
  const pendingCount = tasks.filter(task => !task.status).length;
  const completedCount = tasks.filter(task => task.status).length;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl font-bold">
            <ListTodo className="h-5 w-5 mr-2 text-primary" />
            Pengelola Tugas
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={() => setEditTask(null)}
              >
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
          {/* Kartu Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 dark:bg-gray-800 border-blue-100 dark:border-gray-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tugas</p>
                  <h3 className="text-2xl font-bold">{tasks.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <ListTodo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 dark:bg-gray-800 border-amber-100 dark:border-gray-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Belum Selesai</p>
                  <h3 className="text-2xl font-bold">{pendingCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-gray-700 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 dark:bg-gray-800 border-green-100 dark:border-gray-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Selesai</p>
                  <h3 className="text-2xl font-bold">{completedCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-gray-700 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab dan Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Tabs 
              defaultValue="all" 
              className="w-full md:w-auto"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Semua Tugas</TabsTrigger>
                <TabsTrigger value="pending">Belum Selesai</TabsTrigger>
                <TabsTrigger value="completed">Selesai</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari tugas..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Tugas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <p className="text-sm font-medium mb-1">Prioritas</p>
                    <Select 
                      value={priorityFilter} 
                      onValueChange={setPriorityFilter}
                    >
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
                  
                  <div className="p-2">
                    <p className="text-sm font-medium mb-1">Status</p>
                    <Select 
                      value={statusFilter} 
                      onValueChange={setStatusFilter}
                    >
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    Urutan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleSort("task")}>
                    Nama Tugas {sortField === "task" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("priority")}>
                    Prioritas {sortField === "priority" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("due_date")}>
                    Tanggal {sortField === "due_date" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabel Tugas */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Tugas</TableHead>
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
                    <TableRow 
                      key={task.id} 
                      className={`${index % 2 === 0 ? "bg-muted/30" : ""} ${task.status ? "bg-green-50/50 dark:bg-green-950/10" : ""}`}
                    >
                      <TableCell className="font-medium">{indexOfFirstTask + index + 1}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <span className={task.status ? "line-through text-muted-foreground" : ""}>
                          {task.task}
                        </span>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          {format(new Date(task.due_date), "dd MMM yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
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
                              <DropdownMenuItem 
                                onClick={() => handleMarkComplete(task)}
                                className="text-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Tandai Selesai
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEdit(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Tugas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600"
                            >
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
          {sortedTasks.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tampilkan</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue placeholder="5" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => goToPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => goToPage(pageToShow)} 
                          isActive={currentPage === pageToShow}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

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
