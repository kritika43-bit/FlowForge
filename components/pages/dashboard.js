"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  IndianRupee,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  Download,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Activity
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useDashboardData, useRealTimeData } from "../../lib/hooks"
import { currencyUtils } from "../../lib/currency"
import { alerts } from "../../lib/alerts"

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted/50 rounded-lg" />
        <div className="h-80 bg-muted/50 rounded-lg" />
      </div>
    </div>
  )
}

// Filter component
function DashboardFilters({ filters, onFiltersChange, onClearFilters, isLoading }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== "" && value !== "all"
    ).length
  }

  return (
    <div className="flex items-center space-x-4 mb-6">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Dashboard</h4>
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="quality">Quality Control</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="workCenter">Work Center</Label>
                <Select value={filters.workCenter} onValueChange={(value) => handleFilterChange('workCenter', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All work centers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Centers</SelectItem>
                    <SelectItem value="assembly">Assembly Line</SelectItem>
                    <SelectItem value="welding">Welding Bay</SelectItem>
                    <SelectItem value="painting">Paint Shop</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search orders, items, etc..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => window.location.reload()} 
        disabled={isLoading}
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
        Refresh
      </Button>

      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  )
}

// KPI Card component
function KPICard({ title, value, change, trend, icon: Icon, currency = false }) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {currency ? currencyUtils.formatters.compact(value) : value}
            </p>
            {change && (
              <p className={cn("text-xs", trendColor)}>
                {trendIcon} {change}
              </p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-md">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recent Orders component
function RecentOrders({ orders = [], isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted/50 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted/50 rounded w-3/4" />
                  <div className="h-3 bg-muted/50 rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-muted/50 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest manufacturing orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.itemName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    order.status === 'completed' ? 'default' : 
                    order.status === 'pending' ? 'secondary' : 
                    order.status === 'in-progress' ? 'outline' : 'destructive'
                  }>
                    {order.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currencyUtils.formatters.compact(order.totalValue)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Dashboard component
export function Dashboard() {
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    department: "all",
    workCenter: "all",
    dateRange: "month",
    search: ""
  })

  // Component mount effect
  useEffect(() => {
    // Any initialization logic can go here
  }, []);

  // Fetch dashboard data with filters
  const {
    data: dashboardData,
    isLoading,
    error,
    refresh
  } = useDashboardData(filters)

  // Real-time updates every 30 seconds
  useRealTimeData(() => refresh(), 30000)

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      department: "all",
      workCenter: "all",
      dateRange: "month",
      search: ""
    })
  }

    // Provide fallback data when API fails
  const fallbackData = {
    kpis: {
      totalOrders: 42,
      activeWorkOrders: 18,
      productionValue: 2500000,
      efficiency: 94,
      ordersChange: "+12%",
      workOrdersChange: "+5%",
      valueChange: "+18%",
      efficiencyChange: "+2%",
      ordersTrend: "up",
      workOrdersTrend: "up",
      valueTrend: "up",
      efficiencyTrend: "up",
      completedToday: 8,
      pendingOrders: 15,
      overdueItems: 3,
      activeWorkers: 24
    },
    orders: [
      {
        id: "MO-001",
        orderNumber: "MO-2024-001",
        itemName: "Steel Frame Assembly",
        status: "in-progress",
        totalValue: 45000
      },
      {
        id: "MO-002", 
        orderNumber: "MO-2024-002",
        itemName: "Engine Block Casting",
        status: "pending",
        totalValue: 75000
      },
      {
        id: "MO-003",
        orderNumber: "MO-2024-003", 
        itemName: "Transmission Housing",
        status: "completed",
        totalValue: 32000
      }
    ],
    activities: [
      {
        id: "1",
        description: "Manufacturing order MO-2024-001 started production",
        timestamp: new Date().toISOString(),
        type: "order"
      },
      {
        id: "2", 
        description: "Quality check completed for WO-045",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: "quality"
      }
    ]
  }

  if (error && !dashboardData) {
    alerts.error("API Connection Error", "Using fallback data. Please check your connection.")
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>
              Unable to load dashboard data. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Debug logging
  console.log('Dashboard data received:', dashboardData);
  console.log('Dashboard error:', error);
  console.log('Dashboard loading:', isLoading);

  const data = dashboardData || fallbackData
  const kpis = data.kpis || fallbackData.kpis || {}
  const orders = data.orders || fallbackData.orders || []
  const workOrders = data.workOrders || []
  const activities = data.recentActivity || fallbackData.activities || []

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your manufacturing overview for today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Orders"
              value={kpis.totalOrders || 0}
              change={kpis.ordersChange || "No change"}
              trend={kpis.ordersTrend || "neutral"}
              icon={Package}
            />
            <KPICard
              title="Active Work Orders"
              value={kpis.activeWorkOrders || 0}
              change={kpis.workOrdersChange || "No change"}
              trend={kpis.workOrdersTrend || "neutral"}
              icon={Activity}
            />
            <KPICard
              title="Production Value"
              value={kpis.productionValue || 0}
              change={kpis.valueChange || "No change"}
              trend={kpis.valueTrend || "neutral"}
              icon={IndianRupee}
              currency={true}
            />
            <KPICard
              title="Efficiency"
              value={`${kpis.efficiency || 0}%`}
              change={kpis.efficiencyChange || "No change"}
              trend={kpis.efficiencyTrend || "neutral"}
              icon={TrendingUp}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <RecentOrders orders={orders} isLoading={isLoading} />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Completed Today</span>
                  </div>
                  <Badge variant="secondary">{kpis.completedToday || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span>Pending Orders</span>
                  </div>
                  <Badge variant="secondary">{kpis.pendingOrders || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Overdue Items</span>
                  </div>
                  <Badge variant="destructive">{kpis.overdueItems || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>Active Workers</span>
                  </div>
                  <Badge variant="secondary">{kpis.activeWorkers || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.length > 0 ? (
                  activities.slice(0, 8).map((activity, index) => (
                    <div key={activity.id || index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
