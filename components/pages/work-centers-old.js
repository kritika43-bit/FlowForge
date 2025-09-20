"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import {
  Search,
  Plus,
  Factory,
  Zap,
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity,
} from "lucide-react"
import { currencyUtils } from "../../lib/currency"

// Mock data for work centers
const workCenters = [
  {
    id: "WC-001",
    name: "CNC Machine 1",
    type: "CNC Machining",
    location: "Floor A - Bay 1",
    status: "Running",
    utilization: 85,
    downtime: 5,
    hourlyCost: 45,
    currentJob: "WO-010 - Rough Machining",
    operator: "Carlos Martinez",
    capacity: 100,
    efficiency: 92,
    maintenanceScheduled: "2024-01-20",
    lastMaintenance: "2024-01-01",
    totalHours: 168,
    productiveHours: 142,
    specifications: {
      maxRPM: "8000",
      toolCapacity: "20",
      workpieceSize: "500x300x200mm",
    },
    recentJobs: [
      { id: "WO-010", product: "Motor Housing", duration: "5.5h", status: "Completed" },
      { id: "WO-015", product: "Gear Case", duration: "3.2h", status: "Completed" },
    ],
  },
  {
    id: "WC-002",
    name: "CNC Machine 2",
    type: "CNC Machining",
    location: "Floor A - Bay 2",
    status: "Running",
    utilization: 72,
    downtime: 12,
    hourlyCost: 45,
    currentJob: "WO-011 - Precision Machining",
    operator: "Lisa Park",
    capacity: 100,
    efficiency: 88,
    maintenanceScheduled: "2024-01-25",
    lastMaintenance: "2024-01-05",
    totalHours: 168,
    productiveHours: 121,
    specifications: {
      maxRPM: "10000",
      toolCapacity: "24",
      workpieceSize: "600x400x250mm",
    },
    recentJobs: [
      { id: "WO-011", product: "Motor Housing", duration: "8.0h", status: "In Progress" },
      { id: "WO-016", product: "Bracket", duration: "2.1h", status: "Completed" },
    ],
  },
  {
    id: "WC-003",
    name: "Welding Bay 1",
    type: "Welding",
    location: "Floor B - Section 1",
    status: "Running",
    utilization: 95,
    downtime: 2,
    hourlyCost: 35,
    currentJob: "WO-002 - Weld Frame",
    operator: "Tom Rodriguez",
    capacity: 100,
    efficiency: 96,
    maintenanceScheduled: "2024-01-18",
    lastMaintenance: "2024-01-08",
    totalHours: 168,
    productiveHours: 160,
    specifications: {
      weldingType: "MIG/TIG",
      maxCurrent: "400A",
      materialThickness: "0.5-25mm",
    },
    recentJobs: [
      { id: "WO-002", product: "Steel Frame Assembly", duration: "12.0h", status: "In Progress" },
      { id: "WO-017", product: "Support Bracket", duration: "4.5h", status: "Completed" },
    ],
  },
  {
    id: "WC-004",
    name: "Assembly Line 1",
    type: "Assembly",
    location: "Floor C - Line 1",
    status: "Idle",
    utilization: 45,
    downtime: 25,
    hourlyCost: 25,
    currentJob: null,
    operator: "Sarah Wilson",
    capacity: 100,
    efficiency: 78,
    maintenanceScheduled: "2024-01-22",
    lastMaintenance: "2024-01-10",
    totalHours: 168,
    productiveHours: 76,
    specifications: {
      stationCount: "6",
      conveyorSpeed: "0.5-2.0 m/min",
      maxWeight: "50kg",
    },
    recentJobs: [
      { id: "WO-018", product: "Pump Assembly", duration: "6.0h", status: "Completed" },
      { id: "WO-019", product: "Control Unit", duration: "4.2h", status: "Completed" },
    ],
  },
  {
    id: "WC-005",
    name: "Testing Station",
    type: "Quality Control",
    location: "Floor D - QC Area",
    status: "Running",
    utilization: 68,
    downtime: 8,
    hourlyCost: 30,
    currentJob: "WO-008 - Component Testing",
    operator: "Robert Lee",
    capacity: 100,
    efficiency: 91,
    maintenanceScheduled: "2024-01-28",
    lastMaintenance: "2024-01-12",
    totalHours: 168,
    productiveHours: 114,
    specifications: {
      testTypes: "Electrical, Mechanical",
      accuracy: "±0.1%",
      testVoltage: "0-1000V",
    },
    recentJobs: [
      { id: "WO-008", product: "Control Panel Board", duration: "2.8h", status: "Completed" },
      { id: "WO-020", product: "Sensor Module", duration: "1.5h", status: "Completed" },
    ],
  },
  {
    id: "WC-006",
    name: "Paint Booth",
    type: "Finishing",
    location: "Floor E - Paint Area",
    status: "Maintenance",
    utilization: 0,
    downtime: 100,
    hourlyCost: 20,
    currentJob: null,
    operator: null,
    capacity: 100,
    efficiency: 0,
    maintenanceScheduled: "2024-01-15",
    lastMaintenance: "2024-01-15",
    totalHours: 168,
    productiveHours: 0,
    specifications: {
      boothSize: "4x3x3m",
      ventilation: "15000 CFM",
      temperature: "20-25°C",
    },
    recentJobs: [{ id: "WO-021", product: "Frame Assembly", duration: "3.0h", status: "Completed" }],
  },
]

const getStatusBadge = (status) => {
  const variants = {
    Running: "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20",
    Idle: "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20",
    Maintenance: "bg-destructive/10 text-destructive border-destructive/20",
    Offline: "bg-muted text-muted-foreground border-muted",
  }

  return (
    <Badge variant="outline" className={variants[status] || "bg-muted"}>
      {status}
    </Badge>
  )
}

const getStatusIcon = (status) => {
  switch (status) {
    case "Running":
      return <CheckCircle className="h-4 w-4 text-flowforge-green" />
    case "Idle":
      return <Clock className="h-4 w-4 text-flowforge-amber" />
    case "Maintenance":
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    default:
      return <Factory className="h-4 w-4 text-muted-foreground" />
  }
}

// Circular progress component
function CircularProgress({ value, size = 80, strokeWidth = 8, className = "" }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  const getColor = (value) => {
    if (value >= 80) return "text-flowforge-green"
    if (value >= 60) return "text-flowforge-amber"
    return "text-destructive"
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${getColor(value)}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${getColor(value)}`}>{value}%</span>
      </div>
    </div>
  )
}

export function WorkCenters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedWorkCenter, setSelectedWorkCenter] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredWorkCenters = workCenters.filter((wc) => {
    const matchesSearch =
      wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || wc.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search work centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Work Center Button */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Work Center
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Work Center</DialogTitle>
              <DialogDescription>Register a new work center or machine in the system.</DialogDescription>
            </DialogHeader>
            <CreateWorkCenterForm onClose={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Work Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkCenters.map((workCenter) => (
          <Card
            key={workCenter.id}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => setSelectedWorkCenter(workCenter)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{workCenter.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    {workCenter.type}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground">{workCenter.location}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(workCenter.status)}
                  {getStatusIcon(workCenter.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Utilization Circle */}
              <div className="flex items-center justify-center">
                <CircularProgress value={workCenter.utilization} />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    Efficiency
                  </div>
                  <div className="font-medium">{workCenter.efficiency}%</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Downtime
                  </div>
                  <div className="font-medium">{workCenter.downtime}%</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <IndianRupee className="h-3 w-3" />
                    Hourly Cost
                  </div>
                  <div className="font-medium">{currencyUtils.formatters.compact(workCenter.hourlyCost)}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Capacity
                  </div>
                  <div className="font-medium">{workCenter.capacity}%</div>
                </div>
              </div>

              {/* Current Job */}
              {workCenter.currentJob ? (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium text-foreground">Current Job</div>
                  <div className="text-sm text-muted-foreground">{workCenter.currentJob}</div>
                  {workCenter.operator && (
                    <div className="text-xs text-muted-foreground mt-1">Operator: {workCenter.operator}</div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">No active job</div>
                </div>
              )}

              {/* Productive Hours Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Productive Hours</span>
                  <span className="font-medium">
                    {workCenter.productiveHours}/{workCenter.totalHours}h
                  </span>
                </div>
                <Progress value={(workCenter.productiveHours / workCenter.totalHours) * 100} className="h-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Work Center Details Modal */}
      {selectedWorkCenter && (
        <Dialog open={!!selectedWorkCenter} onOpenChange={() => setSelectedWorkCenter(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                {selectedWorkCenter.name}
              </DialogTitle>
              <DialogDescription>
                {selectedWorkCenter.type} - {selectedWorkCenter.location}
              </DialogDescription>
            </DialogHeader>
            <WorkCenterDetails workCenter={selectedWorkCenter} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function WorkCenterDetails({ workCenter }) {
  return (
    <div className="space-y-6">
      {/* Status and Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{workCenter.utilization}%</div>
            <div className="text-sm text-muted-foreground">Utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{workCenter.efficiency}%</div>
            <div className="text-sm text-muted-foreground">Efficiency</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{workCenter.downtime}%</div>
            <div className="text-sm text-muted-foreground">Downtime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{currencyUtils.formatters.compact(workCenter.hourlyCost)}</div>
            <div className="text-sm text-muted-foreground">Hourly Cost</div>
          </CardContent>
        </Card>
      </div>

      {/* Specifications and Recent Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(workCenter.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workCenter.recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">{job.id}</div>
                  <div className="text-xs text-muted-foreground">{job.product}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{job.duration}</div>
                  <Badge variant="outline" className="text-xs">
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Maintenance Schedule</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Last Maintenance</div>
            <div className="font-medium">{workCenter.lastMaintenance}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Next Scheduled</div>
            <div className="font-medium">{workCenter.maintenanceScheduled}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateWorkCenterForm({ onClose }) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Work Center Name</Label>
          <Input id="name" placeholder="Enter work center name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cnc">CNC Machining</SelectItem>
              <SelectItem value="welding">Welding</SelectItem>
              <SelectItem value="assembly">Assembly</SelectItem>
              <SelectItem value="testing">Quality Control</SelectItem>
              <SelectItem value="finishing">Finishing</SelectItem>
              <SelectItem value="cutting">Cutting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" placeholder="Floor and bay location" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity (%)</Label>
          <Input id="capacity" type="number" placeholder="100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyCost">Hourly Cost (₹)</Label>
          <Input id="hourlyCost" type="number" placeholder="45" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specifications">Specifications</Label>
        <Textarea id="specifications" placeholder="Enter technical specifications (one per line)" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={onClose}>
          Add Work Center
        </Button>
      </div>
    </form>
  )
}
