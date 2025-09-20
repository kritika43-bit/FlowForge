"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Search, Plus, Clock, MapPin, Calendar, AlertCircle, CheckCircle, Pause, Play } from "lucide-react"

// Mock data for work orders
const initialWorkOrders = {
  pending: [
    {
      id: "WO-001",
      title: "Cut Steel Beams",
      description: "Cut steel beams to specified dimensions for frame assembly",
      workCenter: "Cutting Station",
      operator: "Mike Johnson",
      operatorAvatar: "/placeholder-user.png",
      priority: "High",
      estimatedHours: 4,
      manufacturingOrder: "MO-2024-001",
      dueDate: "2024-01-15",
      tags: ["Steel", "Cutting"],
    },
    {
      id: "WO-004",
      title: "Assemble Cylinder",
      description: "Assemble hydraulic cylinder components",
      workCenter: "Assembly Line 1",
      operator: "Sarah Wilson",
      operatorAvatar: "/placeholder-user.png",
      priority: "Medium",
      estimatedHours: 6,
      manufacturingOrder: "MO-2024-002",
      dueDate: "2024-01-18",
      tags: ["Hydraulic", "Assembly"],
    },
    {
      id: "WO-012",
      title: "Quality Check",
      description: "Perform quality inspection on motor housing",
      workCenter: "QC Station",
      operator: "David Chen",
      operatorAvatar: "/placeholder-user.png",
      priority: "High",
      estimatedHours: 2,
      manufacturingOrder: "MO-2024-004",
      dueDate: "2024-01-16",
      tags: ["QC", "Inspection"],
    },
  ],
  started: [
    {
      id: "WO-002",
      title: "Weld Frame",
      description: "Weld steel frame components together",
      workCenter: "Welding Bay 1",
      operator: "Tom Rodriguez",
      operatorAvatar: "/placeholder-user.png",
      priority: "High",
      estimatedHours: 8,
      manufacturingOrder: "MO-2024-001",
      dueDate: "2024-01-15",
      tags: ["Welding", "Steel"],
      startedAt: "2024-01-12 09:00",
      progress: 65,
    },
    {
      id: "WO-011",
      title: "Precision Machining",
      description: "Precision machining of motor housing",
      workCenter: "CNC Machine 2",
      operator: "Lisa Park",
      operatorAvatar: "/placeholder-user.png",
      priority: "Medium",
      estimatedHours: 12,
      manufacturingOrder: "MO-2024-004",
      dueDate: "2024-01-17",
      tags: ["CNC", "Machining"],
      startedAt: "2024-01-11 08:30",
      progress: 45,
    },
  ],
  paused: [
    {
      id: "WO-005",
      title: "Install Motor",
      description: "Install pump motor in hydraulic unit",
      workCenter: "Assembly Line 1",
      operator: "James Brown",
      operatorAvatar: "/placeholder-user.png",
      priority: "Medium",
      estimatedHours: 3,
      manufacturingOrder: "MO-2024-002",
      dueDate: "2024-01-19",
      tags: ["Motor", "Installation"],
      pausedReason: "Waiting for parts",
      pausedAt: "2024-01-12 14:30",
    },
  ],
  completed: [
    {
      id: "WO-007",
      title: "PCB Assembly",
      description: "Assemble printed circuit board components",
      workCenter: "Electronics Lab",
      operator: "Anna Kim",
      operatorAvatar: "/placeholder-user.png",
      priority: "Low",
      estimatedHours: 5,
      manufacturingOrder: "MO-2024-003",
      dueDate: "2024-01-10",
      tags: ["Electronics", "PCB"],
      completedAt: "2024-01-09 16:45",
      actualHours: 4.5,
    },
    {
      id: "WO-008",
      title: "Component Testing",
      description: "Test electronic components functionality",
      workCenter: "Testing Station",
      operator: "Robert Lee",
      operatorAvatar: "/placeholder-user.png",
      priority: "Low",
      estimatedHours: 3,
      manufacturingOrder: "MO-2024-003",
      dueDate: "2024-01-10",
      tags: ["Testing", "Electronics"],
      completedAt: "2024-01-10 11:20",
      actualHours: 2.8,
    },
    {
      id: "WO-010",
      title: "Rough Machining",
      description: "Initial rough machining of motor housing",
      workCenter: "CNC Machine 1",
      operator: "Carlos Martinez",
      operatorAvatar: "/placeholder-user.png",
      priority: "Medium",
      estimatedHours: 6,
      manufacturingOrder: "MO-2024-004",
      dueDate: "2024-01-14",
      tags: ["CNC", "Machining"],
      completedAt: "2024-01-13 17:00",
      actualHours: 5.5,
    },
  ],
}

const columns = [
  { id: "pending", title: "Pending", icon: Clock, color: "text-flowforge-blue" },
  { id: "started", title: "Started", icon: Play, color: "text-flowforge-amber" },
  { id: "paused", title: "Paused", icon: Pause, color: "text-destructive" },
  { id: "completed", title: "Completed", icon: CheckCircle, color: "text-flowforge-green" },
]

const getPriorityBadge = (priority) => {
  const variants = {
    High: "bg-destructive/10 text-destructive border-destructive/20",
    Medium: "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20",
    Low: "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20",
  }

  return (
    <Badge variant="outline" className={variants[priority] || "bg-muted"}>
      {priority}
    </Badge>
  )
}

export function WorkOrders() {
  const [workOrders, setWorkOrders] = useState(initialWorkOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [draggedItem, setDraggedItem] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleDragStart = (e, item, sourceColumn) => {
    setDraggedItem({ item, sourceColumn })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, targetColumn) => {
    e.preventDefault()

    if (!draggedItem || draggedItem.sourceColumn === targetColumn) {
      setDraggedItem(null)
      return
    }

    const newWorkOrders = { ...workOrders }

    // Remove from source column
    newWorkOrders[draggedItem.sourceColumn] = newWorkOrders[draggedItem.sourceColumn].filter(
      (item) => item.id !== draggedItem.item.id,
    )

    // Add to target column with status updates
    const updatedItem = { ...draggedItem.item }

    // Update item based on target column
    switch (targetColumn) {
      case "started":
        updatedItem.startedAt = new Date().toISOString().slice(0, 16).replace("T", " ")
        updatedItem.progress = updatedItem.progress || 0
        delete updatedItem.pausedAt
        delete updatedItem.pausedReason
        delete updatedItem.completedAt
        delete updatedItem.actualHours
        break
      case "paused":
        updatedItem.pausedAt = new Date().toISOString().slice(0, 16).replace("T", " ")
        updatedItem.pausedReason = updatedItem.pausedReason || "Manual pause"
        delete updatedItem.completedAt
        delete updatedItem.actualHours
        break
      case "completed":
        updatedItem.completedAt = new Date().toISOString().slice(0, 16).replace("T", " ")
        updatedItem.actualHours = updatedItem.estimatedHours
        updatedItem.progress = 100
        delete updatedItem.pausedAt
        delete updatedItem.pausedReason
        break
      case "pending":
        delete updatedItem.startedAt
        delete updatedItem.progress
        delete updatedItem.pausedAt
        delete updatedItem.pausedReason
        delete updatedItem.completedAt
        delete updatedItem.actualHours
        break
    }

    newWorkOrders[targetColumn].push(updatedItem)
    setWorkOrders(newWorkOrders)
    setDraggedItem(null)
  }

  const filteredWorkOrders = Object.keys(workOrders).reduce((acc, column) => {
    acc[column] = workOrders[column].filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.workCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.operator.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    return acc
  }, {})

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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const Icon = column.icon
          const columnItems = filteredWorkOrders[column.id] || []

          return (
            <div
              key={column.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
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
                {columnItems.map((item) => (
                  <WorkOrderCard key={item.id} item={item} onDragStart={(e) => handleDragStart(e, item, column.id)} />
                ))}

                {columnItems.length === 0 && (
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

function WorkOrderCard({ item, onDragStart }) {
  return (
    <Card
      className="cursor-move hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20"
      draggable
      onDragStart={onDragStart}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{item.id}</p>
          </div>
          {getPriorityBadge(item.priority)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        {/* Progress bar for started items */}
        {item.progress !== undefined && (
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
          <span className="text-muted-foreground">{item.workCenter}</span>
        </div>

        {/* Operator */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={item.operatorAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {item.operator
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{item.operator}</span>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Due: {item.dueDate}</span>
        </div>

        {/* Status-specific information */}
        {item.startedAt && <div className="text-xs text-muted-foreground">Started: {item.startedAt}</div>}

        {item.pausedReason && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {item.pausedReason}
          </div>
        )}

        {item.completedAt && (
          <div className="text-xs text-flowforge-green">
            Completed: {item.completedAt}
            {item.actualHours && ` (${item.actualHours}h)`}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Estimated Hours */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{item.estimatedHours}h estimated</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateWorkOrderForm({ onClose }) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input id="title" placeholder="Enter task title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workCenter">Work Center</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select work center" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cutting">Cutting Station</SelectItem>
              <SelectItem value="welding1">Welding Bay 1</SelectItem>
              <SelectItem value="welding2">Welding Bay 2</SelectItem>
              <SelectItem value="assembly1">Assembly Line 1</SelectItem>
              <SelectItem value="assembly2">Assembly Line 2</SelectItem>
              <SelectItem value="cnc1">CNC Machine 1</SelectItem>
              <SelectItem value="cnc2">CNC Machine 2</SelectItem>
              <SelectItem value="testing">Testing Station</SelectItem>
              <SelectItem value="qc">QC Station</SelectItem>
              <SelectItem value="electronics">Electronics Lab</SelectItem>
              <SelectItem value="paint">Paint Booth</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Describe the work to be performed" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="operator">Operator</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Assign operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mike">Mike Johnson</SelectItem>
              <SelectItem value="sarah">Sarah Wilson</SelectItem>
              <SelectItem value="tom">Tom Rodriguez</SelectItem>
              <SelectItem value="lisa">Lisa Park</SelectItem>
              <SelectItem value="david">David Chen</SelectItem>
              <SelectItem value="anna">Anna Kim</SelectItem>
              <SelectItem value="james">James Brown</SelectItem>
              <SelectItem value="robert">Robert Lee</SelectItem>
              <SelectItem value="carlos">Carlos Martinez</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input id="estimatedHours" type="number" placeholder="Hours" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manufacturingOrder">Manufacturing Order</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Link to MO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mo-001">MO-2024-001 - Steel Frame Assembly</SelectItem>
              <SelectItem value="mo-002">MO-2024-002 - Hydraulic Pump Unit</SelectItem>
              <SelectItem value="mo-003">MO-2024-003 - Control Panel Board</SelectItem>
              <SelectItem value="mo-004">MO-2024-004 - Motor Housing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={onClose}>
          Create Work Order
        </Button>
      </div>
    </form>
  )
}
