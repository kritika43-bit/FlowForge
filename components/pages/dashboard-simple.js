"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  IndianRupee,
  RefreshCw,
  Clock,
  CheckCircle2,
  Activity
} from "lucide-react"
import { useAuth } from "../../contexts/auth-context"
import { apiClient } from "../../lib/api"

// Simple currency formatter
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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
              {currency ? formatCurrency(value) : value}
            </p>
            {change && (
              <p className={`text-xs ${trendColor}`}>
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
function RecentOrders({ orders = [] }) {
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
                    {formatCurrency(order.totalValue)}
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
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)

  // Mock data for fallback
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Loading dashboard data from API...')
        const response = await apiClient.getDashboard()
        console.log('Dashboard API response:', response.data)
        setDashboardData(response.data)
        
      } catch (err) {
        console.error('Dashboard API error:', err)
        setError(err)
        // Use fallback data when API fails
        console.log('Using fallback data due to API error')
        setDashboardData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const data = dashboardData || fallbackData
  const kpis = data.kpis || {}
  const orders = data.orders || []
  const activities = data.recentActivity || data.activities || []

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Here's your manufacturing overview.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last updated</p>
            <p className="text-sm font-medium">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              ⚠️ API connection error. Showing sample data. ({error.message})
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Orders"
          value={kpis.totalOrders || 0}
          change={kpis.ordersChange || "+12%"}
          trend={kpis.ordersTrend || "up"}
          icon={Package}
        />
        <KPICard
          title="Active Work Orders"
          value={kpis.activeWorkOrders || 0}
          change={kpis.workOrdersChange || "+5%"}
          trend={kpis.workOrdersTrend || "up"}
          icon={Activity}
        />
        <KPICard
          title="Production Value"
          value={kpis.productionValue || 0}
          change={kpis.valueChange || "+18%"}
          trend={kpis.valueTrend || "up"}
          icon={IndianRupee}
          currency={true}
        />
        <KPICard
          title="Efficiency"
          value={`${kpis.efficiency || 0}%`}
          change={kpis.efficiencyChange || "+2%"}
          trend={kpis.efficiencyTrend || "up"}
          icon={TrendingUp}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <RecentOrders orders={orders} />

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
    </div>
  )
}
