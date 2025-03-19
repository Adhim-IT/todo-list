"use client" 

import { useState, useEffect } from "react" 
import { zodResolver } from "@hookform/resolvers/zod" 
import { useForm } from "react-hook-form" 
import type { z } from "zod" 
import { TaskFormSchema } from "@/lib/zod" 
import { format } from "date-fns" 
import { CalendarIcon } from 'lucide-react' 
import { Button } from "@/components/ui/button" 
import { Calendar } from "@/components/ui/calendar" 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" 
import { Input } from "@/components/ui/input" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" 
import { Checkbox } from "@/components/ui/checkbox" 
import { cn } from "@/lib/utils" 
import type { TaskFormData } from "@/types" 
import { createTask, updateTask } from "@/lib/todo" 
import Swal from 'sweetalert2'

// Properti yang diterima oleh komponen
interface TodoListFormProps {
  initialData?: TaskFormData // Data awal jika dalam mode edit
  onSuccess?: () => void // Callback saat tugas berhasil disimpan
}

export function TodoListForm({ initialData, onSuccess }: TodoListFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false) // State untuk status pengiriman form
  const [isMounted, setIsMounted] = useState(false)

  // Inisialisasi form dengan react-hook-form
  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema), // Menggunakan skema validasi Zod
    defaultValues: initialData || { // Nilai default jika tidak ada data awal
      task: "",
      priority: "MEDIUM",
      due_date: new Date(),
      status: false,
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const disablePastDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Fungsi untuk menangani submit form
  async function onSubmit(values: z.infer<typeof TaskFormSchema>) {
    setIsSubmitting(true) // Set status submitting menjadi true
    try {
      if (values.id) {
        await updateTask(values as TaskFormData) // Jika ada ID, update tugas
        
        // Show success alert for update
        Swal.fire({
          title: 'Success!',
          text: 'Task has been updated successfully',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 2000
        })
      } else {
        await createTask(values as TaskFormData) // Jika tidak, buat tugas baru
        
        // Show success alert for create
        Swal.fire({
          title: 'Success!',
          text: 'New task has been created successfully',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 2000
        })
      }
      
      form.reset() // Reset form setelah berhasil
      if (onSuccess) {
        onSuccess() // Panggil callback jika ada
      }
    } catch (error) {
      console.error("Error submitting form:", error) // Tangani error
      
      // Show error alert
      Swal.fire({
        title: 'Error!',
        text: 'There was an error processing your request',
        icon: 'error',
        confirmButtonColor: '#d33',
      })
    } finally {
      setIsSubmitting(false) // Set status submitting kembali ke false
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Input untuk nama tugas */}
        <FormField
          control={form.control}
          name="task"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task</FormLabel>
              <FormControl>
                <Input placeholder="Enter task description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Dropdown untuk memilih prioritas tugas */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Input untuk memilih tanggal jatuh tempo */}
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
            <FormLabel>Due Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                  >
                    {field.value ? format(field.value, "yyyy-MM-dd") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  disabled={disablePastDates} 
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
          )}
        />
        
        {/* Checkbox untuk menandai tugas selesai atau belum */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Completed</FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        {/* Tombol untuk submit form */}
        <Button type="submit" disabled={isSubmitting}>
          {initialData?.id ? "Update" : "Add"} Task
        </Button>
      </form>
    </Form>
  )
}
