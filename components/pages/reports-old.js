"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  IndianRupee,
  Package,
  Factory,
} from "lucide-react"
import { currencyUtils } from "../../lib/currency"

// Mock data for reports
const productionData = [
  { month: "Jan", planned: 280, actual: 240, efficiency: 86 },
  { month: "Feb", planned: 320, actual: 298, efficiency: 93 },
  { month: "Mar", planned: 300, actual: 310, efficiency: 103 },
  { month: "Apr", planned: 350, actual: 325, efficiency: 93 },
  { month: "May", planned: 380, actual: 365, efficiency: 96 },
  { month: "Jun", planned: 400, actual: 392, efficiency: 98 },
]

const costAnalysisData = [
  { category: "Raw Materials", budget: 50000, actual: 48500, variance: -1500 },
  { category: "Labor", budget: 35000, actual: 36200, variance: 1200 },
  { category: "Overhead", budget: 20000, actual: 19800, variance: -200 },
  { category: "Equipment", budget: 15000, actual: 14500, variance: -500 },
  { category: "Utilities", budget: 8000, actual: 8300, variance: 300 },
]

const workCenterUtilization = [
  { name: "CNC Machine 1", utilization: 85, downtime: 5, efficiency: 92 },
  { name: "CNC Machine 2", utilization: 72, downtime: 12, efficiency: 88 },
  { name: "Welding Bay 1", utilization: 95, downtime: 2, efficiency: 96 },
  { name: "Assembly Line 1", utilization: 45, downtime: 25, efficiency: 78 },
  { name: "Testing Station", utilization: 68, downtime: 8, efficiency: 91 },
  { name: "Paint Booth", utilization: 0, downtime: 100, efficiency: 0 },
]

const orderStatusData = [
  { name: "Completed", value: 142, color: "#10b981" },
  { name: "In Progress", value: 89, color: "#f59e0b" },
  { name: "Planned", value: 32, color: "#3b82f6" },
  { name: "Delayed", value: 16, color: "#ef4444" },
]

const kpiData = {
  currentMonth: {
    ordersCompleted: 42,
    totalRevenue: 125000,
    avgLeadTime: 5.2,
    qualityScore: 98.5,
    onTimeDelivery: 94,
    customerSatisfaction: 4.7,
  },
  previousMonth: {
    ordersCompleted: 38,
    totalRevenue: 118000,
    avgLeadTime: 5.8,
    qualityScore: 97.2,
    onTimeDelivery: 91,
    customerSatisfaction: 4.5,
  },
}

const savedReports = [
  {
    id: "RPT-001",
    name: "Monthly Production Summary",
    type: "Production",
    lastGenerated: "2024-01-15",
    frequency: "Monthly",
    format: "PDF",
    status: "Active",
  },
  {
    id: "RPT-002",
    name: "Cost Analysis Report",
    type: "Financial",
    lastGenerated: "2024-01-14",
    frequency: "Weekly",
    format: "Excel",
    status: "Active",
  },
  {
    id: "RPT-003",
    name: "Quality Metrics Dashboard",
    type: "Quality",
    lastGenerated: "2024-01-13",
    frequency: "Daily",
    format: "PDF",
    status: "Active",
  },
  {
    id: "RPT-004",
    name: "Equipment Utilization Report",
    type: "Operations",
    lastGenerated: "2024-01-12",
    frequency: "Weekly",
    format: "Excel",
    status: "Draft",
  },
]

export function Reports() {
  const [dateRange, setDateRange] = useState("last30days")
  const [reportType, setReportType] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExportReport = (format, reportName) => {
    setIsGenerating(true)
    // Mock export functionality
    setTimeout(() => {
      console.log(`Exporting ${reportName} as ${format}`)
      setIsGenerating(false)
    }, 2000)
  }

  const getVarianceColor = (variance) => {
    if (variance > 0) return "text-destructive"
    if (variance < 0) return "text-flowforge-green"
    return "text-muted-foreground"
  }

  const getVarianceIcon = (variance) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />
    if (variance < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  const calculatePercentageChange = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(1)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last3months">Last 3 months</SelectItem>
              <SelectItem value="last6months">Last 6 months</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {/* Report Type Filter */}
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders Completed</p>
                <p className="text-2xl font-bold">{kpiData.currentMonth.ordersCompleted}</p>
                <p className="text-xs text-flowforge-green">
                  +{calculatePercentageChange(kpiData.currentMonth.ordersCompleted, kpiData.previousMonth.ordersCompleted)}% vs last month
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{currencyUtils.formatters.compact(kpiData.currentMonth.totalRevenue)}</p>
                <p className="text-xs text-flowforge-green">
                  +{calculatePercentageChange(kpiData.currentMonth.totalRevenue, kpiData.previousMonth.totalRevenue)}% vs last month
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-flowforge-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Lead Time</p>
                <p className="text-2xl font-bold">{kpiData.currentMonth.avgLeadTime} days</p>
                <p className="text-xs text-flowforge-green">
                  -{Math.abs(calculatePercentageChange(kpiData.currentMonth.avgLeadTime, kpiData.previousMonth.avgLeadTime))}% vs last month
                </p>
              </div>
              <Clock className="h-8 w-8 text-flowforge-amber" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold">{kpiData.currentMonth.qualityScore}%</p>
                <p className="text-xs text-flowforge-green">
                  +{calculatePercentageChange(kpiData.currentMonth.qualityScore, kpiData.previousMonth.qualityScore)}% vs last month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-flowforge-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                <p className="text-2xl font-bold">{kpiData.currentMonth.onTimeDelivery}%</p>
                <p className="text-xs text-flowforge-green">
                  +{calculatePercentageChange(kpiData.currentMonth.onTimeDelivery, kpiData.previousMonth.onTimeDelivery)}% vs last month
                </p>
              </div>
              <Factory className="h-8 w-8 text-flowforge-teal" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Rating</p>
                <p className="text-2xl font-bold">{kpiData.currentMonth.customerSatisfaction}/5</p>
                <p className="text-xs text-flowforge-green">
                  +{calculatePercentageChange(kpiData.currentMonth.customerSatisfaction, kpiData.previousMonth.customerSatisfaction)}% vs last month
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Production Efficiency Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Production Efficiency Trends</CardTitle>
              <CardDescription>Monthly planned vs actual production with efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stackId="1"
                    stroke="hsl(var(--flowforge-blue))"
                    fill="hsl(var(--flowforge-blue))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stackId="2"
                    stroke="hsl(var(--flowforge-green))"
                    fill="hsl(var(--flowforge-green))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Work Center Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Center Utilization</CardTitle>
                <CardDescription>Utilization rates across all work centers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workCenterUtilization} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" />
                    <YAxis dataKey="name" type="category" className="text-muted-foreground" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="utilization" fill="hsl(var(--flowforge-teal))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current status of all manufacturing orders</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {orderStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Performance</CardTitle>
              <CardDescription>Detailed production metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Center</TableHead>
                    <TableHead>Utilization %</TableHead>
                    <TableHead>Downtime %</TableHead>
                    <TableHead>Efficiency %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workCenterUtilization.map((wc) => (
                    <TableRow key={wc.name}>
                      <TableCell className="font-medium">{wc.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-flowforge-teal h-2 rounded-full"
                              style={{ width: `${wc.utilization}%` }}
                            />
                          </div>
                          <span className="text-sm">{wc.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{wc.downtime}%</TableCell>
                      <TableCell>{wc.efficiency}%</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            wc.utilization > 80
                              ? "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20"
                              : wc.utilization > 50
                              ? "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {wc.utilization > 80 ? "Optimal" : wc.utilization > 50 ? "Good" : "Poor"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>Budget vs actual costs across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>% Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costAnalysisData.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell>{currencyUtils.formatters.compact(item.budget)}</TableCell>
                      <TableCell>{currencyUtils.formatters.compact(item.actual)}</TableCell>
                      <TableCell className={getVarianceColor(item.variance)}>
                        <div className="flex items-center gap-1">
                          {getVarianceIcon(item.variance)}
                          {currencyUtils.formatters.compact(Math.abs(item.variance))}
                        </div>
                      </TableCell>
                      <TableCell className={getVarianceColor(item.variance)}>
                        {((item.variance / item.budget) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.variance <= 0
                              ? "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20"
                              : Math.abs(item.variance / item.budget) * 100 <= 5
                              ? "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {item.variance <= 0
                            ? "Under Budget"
                            : Math.abs(item.variance / item.budget) * 100 <= 5
                            ? "Near Budget"
                            : "Over Budget"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Saved Reports
              </CardTitle>
              <CardDescription>Manage your scheduled and saved reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{report.lastGenerated}</TableCell>
                      <TableCell className="text-sm">{report.frequency}</TableCell>
                      <TableCell className="text-sm">{report.format}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            report.status === "Active"
                              ? "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20"
                              : "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20"
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportReport(report.format, report.name)}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
