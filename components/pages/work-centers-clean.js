"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import apiClient from '../../lib/apiClient'

const getStatusBadge = (status) => {
  const variants = {
    Running: "bg-green-100 text-green-800 border-green-300",
    Idle: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Maintenance: "bg-red-100 text-red-800 border-red-300",
    Offline: "bg-gray-100 text-gray-800 border-gray-300",
  }

  return (
    <Badge variant="outline" className={variants[status] || "bg-gray-100 text-gray-800"}>
      {status}
    </Badge>
  )
}

const getStatusIcon = (status) => {
  switch (status) {
    case "Running":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "Idle":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "Maintenance":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <Factory className="h-4 w-4 text-gray-500" />
  }
}

// Circular progress component
function CircularProgress({ value, size = 80, strokeWidth = 8, className = "" }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  const getColor = (value) => {
    if (value >= 80) return "text-green-500"
    if (value >= 60) return "text-yellow-500"
    return "text-red-500"
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
          className="text-gray-200"
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
  const [workCenters, setWorkCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedWorkCenter, setSelectedWorkCenter] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch work centers from API
  useEffect(() => {
    const fetchWorkCenters = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/work-centers')
        setWorkCenters(response.data)
      } catch (error) {
        console.error('Error fetching work centers:', error)
        setError('Failed to load work centers')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkCenters()
  }, [])

  const filteredWorkCenters = workCenters.filter((wc) => {
    const matchesSearch =
      wc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.type?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || wc.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Work Centers</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded-full w-20 mx-auto"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Work Centers</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Work Centers</h3>
            <p className="text-gray-600 text-center">{error}</p>
          </CardContent>
        </Card>
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

      {/* Empty state */}
      {filteredWorkCenters.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Factory className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Work Centers Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {workCenters.length === 0 
                ? "Get started by adding your first work center." 
                : "No work centers match your current filters."}
            </p>
            {workCenters.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Work Center
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Work Centers Grid */}
      {filteredWorkCenters.length > 0 && (
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
                    <CardTitle className="text-lg">{workCenter.name || 'Unknown Work Center'}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      {workCenter.type || 'Unknown Type'}
                    </CardDescription>
                    <p className="text-sm text-gray-600">{workCenter.location || 'No location specified'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(workCenter.status || 'Offline')}
                    {getStatusIcon(workCenter.status || 'Offline')}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Utilization Circle */}
                <div className="flex items-center justify-center">
                  <CircularProgress value={workCenter.utilization || 0} />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Activity className="h-3 w-3" />
                      Efficiency
                    </div>
                    <div className="font-medium">{workCenter.efficiency || 0}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-3 w-3" />
                      Downtime
                    </div>
                    <div className="font-medium">{workCenter.downtime || 0}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <IndianRupee className="h-3 w-3" />
                      Hourly Cost
                    </div>
                    <div className="font-medium">₹{workCenter.hourlyCost || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Zap className="h-3 w-3" />
                      Capacity
                    </div>
                    <div className="font-medium">{workCenter.capacity || 0}%</div>
                  </div>
                </div>

                {/* Current Job */}
                {workCenter.currentJob ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">Current Job</div>
                    <div className="text-sm text-gray-600">{workCenter.currentJob}</div>
                    {workCenter.operator && (
                      <div className="text-xs text-gray-500 mt-1">Operator: {workCenter.operator}</div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-sm text-gray-600">No active job</div>
                  </div>
                )}

                {/* Productive Hours Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Productive Hours</span>
                    <span className="font-medium">
                      {workCenter.productiveHours || 0}/{workCenter.totalHours || 168}h
                    </span>
                  </div>
                  <Progress 
                    value={workCenter.totalHours ? (workCenter.productiveHours / workCenter.totalHours) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <div className="text-2xl font-bold text-gray-900">{workCenter.utilization || 0}%</div>
            <div className="text-sm text-gray-600">Utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{workCenter.efficiency || 0}%</div>
            <div className="text-sm text-gray-600">Efficiency</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{workCenter.downtime || 0}%</div>
            <div className="text-sm text-gray-600">Downtime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">₹{workCenter.hourlyCost || 0}</div>
            <div className="text-sm text-gray-600">Hourly Cost</div>
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
            {workCenter.specifications && Object.keys(workCenter.specifications).length > 0 ? (
              Object.entries(workCenter.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 text-center py-4">No specifications available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workCenter.recentJobs && workCenter.recentJobs.length > 0 ? (
              workCenter.recentJobs.map((job, index) => (
                <div key={job.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{job.id || `Job ${index + 1}`}</div>
                    <div className="text-xs text-gray-600">{job.product || 'Unknown Product'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{job.duration || 'N/A'}</div>
                    <Badge variant="outline" className="text-xs">
                      {job.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 text-center py-4">No recent jobs</div>
            )}
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
            <div className="text-sm text-gray-600">Last Maintenance</div>
            <div className="font-medium">{workCenter.lastMaintenance || 'No data'}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Next Scheduled</div>
            <div className="font-medium">{workCenter.maintenanceScheduled || 'Not scheduled'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateWorkCenterForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    capacity: '',
    hourlyCost: '',
    status: 'idle',
    specifications: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Transform specifications from textarea to object
      const specifications = {}
      if (formData.specifications) {
        formData.specifications.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim())
          if (key && value) {
            specifications[key] = value
          }
        })
      }

      const submitData = {
        ...formData,
        capacity: Number(formData.capacity),
        hourlyCost: Number(formData.hourlyCost),
        specifications
      }

      await apiClient.post('/work-centers', submitData)
      onClose()
      // Refresh the page or update state to show new work center
      window.location.reload()
    } catch (error) {
      console.error('Error creating work center:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Work Center Name</Label>
          <Input 
            id="name" 
            placeholder="Enter work center name" 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
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
        <Input 
          id="location" 
          placeholder="Floor and bay location" 
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity (%)</Label>
          <Input 
            id="capacity" 
            type="number" 
            placeholder="100" 
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyCost">Hourly Cost (₹)</Label>
          <Input 
            id="hourlyCost" 
            type="number" 
            placeholder="45" 
            value={formData.hourlyCost}
            onChange={(e) => handleChange('hourlyCost', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
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
        <Textarea 
          id="specifications" 
          placeholder="Enter technical specifications (key: value, one per line)" 
          value={formData.specifications}
          onChange={(e) => handleChange('specifications', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Add Work Center
        </Button>
      </div>
    </form>
  )
}
