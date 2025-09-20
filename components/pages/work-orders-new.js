"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Search, Plus, Clock, MapPin, Calendar, AlertCircle, CheckCircle, Pause, Play, RefreshCw } from "lucide-react"
import { apiClient } from "../../lib/api"

const columns = [
  { id: "PENDING", title: "Pending", icon: Clock, color: "text-blue-600" },
  { id: "STARTED", title: "Started", icon: Play, color: "text-amber-600" },
  { id: "PAUSED", title: "Paused", icon: Pause, color: "text-red-600" },
  { id: "COMPLETED", title: "Completed", icon: CheckCircle, color: "text-green-600" },
]

const getPriorityBadge = (priority) => {
  const variants = {
    HIGH: "bg-red-100 text-red-700 border-red-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200", 
    LOW: "bg-green-100 text-green-700 border-green-200",
    URGENT: "bg-purple-100 text-purple-700 border-purple-200",
  }

  return (
    <Badge variant="outline" className={variants[priority] || "bg-gray-100"}>
      {priority}
    </Badge>
  )
}

export function WorkOrders() {
  const [workOrders, setWorkOrders] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadWorkOrders()
  }, [])

  const loadWorkOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getWorkOrders()
      
      // Group work orders by status
      const grouped = {
        PENDING: [],
        STARTED: [],
        PAUSED: [],
        COMPLETED: []
      }
      
      if (response.data?.workOrders) {
        response.data.workOrders.forEach(order => {
          const status = order.status || 'PENDING'
          if (grouped[status]) {
            grouped[status].push(order)
          }
        })
      }
      
      setWorkOrders(grouped)
    } catch (err) {
      console.error('Failed to load work orders:', err)
      setError(err)
      // Use empty state instead of mock data
      setWorkOrders({
        PENDING: [],
        STARTED: [],
        PAUSED: [],
        COMPLETED: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (workOrderId, newStatus) => {
    try {
      await apiClient.updateWorkOrder(workOrderId, { status: newStatus })
      loadWorkOrders() // Reload data
    } catch (err) {
      console.error('Failed to update work order:', err)
      setError(err)
    }
  }

  const filteredWorkOrders = Object.keys(workOrders).reduce((acc, status) => {
    acc[status] = workOrders[status]?.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.workCenter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedTo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted/50 rounded w-48" />
          <div className="h-10 bg-muted/50 rounded w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-16 bg-muted/50 rounded" />
              <div className="h-32 bg-muted/50 rounded" />
              <div className="h-32 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={loadWorkOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Create Work Order Button */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Work Order</DialogTitle>
              <DialogDescription>Add a new work order to the production workflow.</DialogDescription>
            </DialogHeader>
            <CreateWorkOrderForm onClose={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              ⚠️ API connection error. {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const Icon = column.icon
          const columnItems = filteredWorkOrders[column.id] || []

          return (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 text-lg ${column.color}`}>
                    <Icon className="h-5 w-5" />
                    {column.title}
                    <Badge variant="secondary" className="ml-auto">
                      {columnItems.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Column Items */}
              <div className="space-y-3 flex-1 min-h-[400px]">
                {columnItems.length > 0 ? (
                  columnItems.map((item) => (
                    <WorkOrderCard 
                      key={item.id} 
                      item={item} 
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <p className="text-muted-foreground text-sm">No work orders</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WorkOrderCard({ item, onStatusChange }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{item.orderNumber}</p>
          </div>
          {getPriorityBadge(item.priority)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        {/* Progress bar for started items */}
        {item.progress !== undefined && item.progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{item.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Work Center */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {item.workCenter?.name || 'Not assigned'}
          </span>
        </div>

        {/* Operator */}
        {item.assignedTo && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs">
                {item.assignedTo.firstName?.[0]}{item.assignedTo.lastName?.[0]}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {item.assignedTo.firstName} {item.assignedTo.lastName}
            </span>
          </div>
        )}

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </span>
        </div>

        {/* Status-specific information */}
        {item.startedAt && (
          <div className="text-xs text-muted-foreground">
            Started: {new Date(item.startedAt).toLocaleString()}
          </div>
        )}

        {item.pausedReason && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {item.pausedReason}
          </div>
        )}

        {item.completedAt && (
          <div className="text-xs text-green-600">
            Completed: {new Date(item.completedAt).toLocaleString()}
            {item.actualHours && ` (${item.actualHours}h)`}
          </div>
        )}

        {/* Estimated Hours */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{item.estimatedHours}h estimated</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateWorkOrderForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workCenterId: '',
    assignedToId: '',
    priority: 'MEDIUM',
    estimatedHours: '',
    dueDate: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.createWorkOrder(formData)
      onClose()
      // Parent will refresh the list
    } catch (error) {
      console.error('Failed to create work order:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input 
            id="title" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Enter task title" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe the work to be performed" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input 
            id="estimatedHours" 
            type="number" 
            value={formData.estimatedHours}
            onChange={(e) => setFormData({...formData, estimatedHours: parseFloat(e.target.value)})}
            placeholder="Hours" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input 
            id="dueDate" 
            type="date" 
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Work Order
        </Button>
      </div>
    </form>
  )
}
