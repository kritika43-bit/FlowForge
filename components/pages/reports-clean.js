"use client"

import { useState, useEffect } from "react"
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
  AlertTriangle,
  Loader2,
} from "lucide-react"
import apiClient from '../../lib/apiClient'

export function Reports() {
  const [analytics, setAnalytics] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState("last30days")
  const [reportType, setReportType] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch analytics data and reports
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [analyticsResponse, reportsResponse] = await Promise.all([
          apiClient.get('/analytics'),
          apiClient.get('/reports')
        ])
        setAnalytics(analyticsResponse.data)
        setReports(reportsResponse.data)
      } catch (error) {
        console.error('Error fetching reports data:', error)
        setError('Failed to load reports data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const [analyticsResponse, reportsResponse] = await Promise.all([
        apiClient.get('/analytics'),
        apiClient.get('/reports')
      ])
      setAnalytics(analyticsResponse.data)
      setReports(reportsResponse.data)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExportReport = async (format, reportId, reportName) => {
    setIsGenerating(true)
    try {
      const response = await apiClient.post(`/reports/${reportId}/export`, { format })
      // Handle file download based on response
      console.log(`Exporting ${reportName} as ${format}`)
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportAll = async () => {
    setIsGenerating(true)
    try {
      await apiClient.post('/reports/export-all', { format: 'PDF' })
      console.log('Exporting all reports')
    } catch (error) {
      console.error('Error exporting all reports:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getVarianceColor = (variance) => {
    if (variance > 0) return "text-red-500"
    if (variance < 0) return "text-green-500"
    return "text-gray-500"
  }

  const getVarianceIcon = (variance) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />
    if (variance < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
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
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportAll} disabled={isGenerating}>
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      {analytics && analytics.kpi && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Orders Completed</p>
                  <p className="text-2xl font-bold">{analytics.kpi.ordersCompleted || 0}</p>
                  <p className="text-xs text-green-600">
                    +{calculatePercentageChange(analytics.kpi.ordersCompleted, analytics.kpi.prevOrdersCompleted)}% vs last period
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{(analytics.kpi.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-green-600">
                    +{calculatePercentageChange(analytics.kpi.totalRevenue, analytics.kpi.prevTotalRevenue)}% vs last period
                  </p>
                </div>
                <IndianRupee className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Lead Time</p>
                  <p className="text-2xl font-bold">{analytics.kpi.avgLeadTime || 0} days</p>
                  <p className="text-xs text-green-600">
                    -{Math.abs(calculatePercentageChange(analytics.kpi.avgLeadTime, analytics.kpi.prevAvgLeadTime))}% vs last period
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className="text-2xl font-bold">{analytics.kpi.qualityScore || 0}%</p>
                  <p className="text-xs text-green-600">
                    +{calculatePercentageChange(analytics.kpi.qualityScore, analytics.kpi.prevQualityScore)}% vs last period
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On-Time Delivery</p>
                  <p className="text-2xl font-bold">{analytics.kpi.onTimeDelivery || 0}%</p>
                  <p className="text-xs text-green-600">
                    +{calculatePercentageChange(analytics.kpi.onTimeDelivery, analytics.kpi.prevOnTimeDelivery)}% vs last period
                  </p>
                </div>
                <Factory className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                  <p className="text-2xl font-bold">{analytics.kpi.customerSatisfaction || 0}/5</p>
                  <p className="text-xs text-green-600">
                    +{calculatePercentageChange(analytics.kpi.customerSatisfaction, analytics.kpi.prevCustomerSatisfaction)}% vs last period
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state when no analytics data */}
      {(!analytics || !analytics.kpi) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-600 text-center mb-4">
              Analytics data will appear here once your manufacturing operations generate sufficient data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && analytics.charts ? (
            <>
              {/* Production Efficiency Chart */}
              {analytics.charts.production && analytics.charts.production.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Production Efficiency Trends</CardTitle>
                    <CardDescription>Monthly planned vs actual production with efficiency metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={analytics.charts.production}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis dataKey="month" className="text-gray-600" />
                        <YAxis className="text-gray-600" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="planned"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stackId="2"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Work Center Utilization and Order Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analytics.charts.workCenters && analytics.charts.workCenters.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Work Center Utilization</CardTitle>
                      <CardDescription>Utilization rates across all work centers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.charts.workCenters} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                          <XAxis type="number" domain={[0, 100]} className="text-gray-600" />
                          <YAxis dataKey="name" type="category" className="text-gray-600" width={100} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="utilization" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {analytics.charts.orderStatus && analytics.charts.orderStatus.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Status Distribution</CardTitle>
                      <CardDescription>Current status of all manufacturing orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.charts.orderStatus}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analytics.charts.orderStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {analytics.charts.orderStatus.map((item, index) => (
                          <div key={item.name || index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
                            <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chart Data Available</h3>
                <p className="text-gray-600 text-center">
                  Chart data will appear here once your operations generate sufficient analytics data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Performance</CardTitle>
              <CardDescription>Detailed production metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && analytics.production && analytics.production.length > 0 ? (
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
                    {analytics.production.map((wc, index) => (
                      <TableRow key={wc.id || index}>
                        <TableCell className="font-medium">{wc.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-500 h-2 rounded-full"
                                style={{ width: `${wc.utilization || 0}%` }}
                              />
                            </div>
                            <span className="text-sm">{wc.utilization || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{wc.downtime || 0}%</TableCell>
                        <TableCell>{wc.efficiency || 0}%</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              (wc.utilization || 0) > 80
                                ? "bg-green-100 text-green-800 border-green-300"
                                : (wc.utilization || 0) > 50
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }
                          >
                            {(wc.utilization || 0) > 80 ? "Optimal" : (wc.utilization || 0) > 50 ? "Good" : "Poor"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Production Data</h3>
                  <p className="text-gray-600">Production performance data will appear here once work centers are active.</p>
                </div>
              )}
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
              {analytics && analytics.financial && analytics.financial.length > 0 ? (
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
                    {analytics.financial.map((item, index) => (
                      <TableRow key={item.category || index}>
                        <TableCell className="font-medium">{item.category || 'Unknown'}</TableCell>
                        <TableCell>₹{(item.budget || 0).toLocaleString()}</TableCell>
                        <TableCell>₹{(item.actual || 0).toLocaleString()}</TableCell>
                        <TableCell className={getVarianceColor(item.variance || 0)}>
                          <div className="flex items-center gap-1">
                            {getVarianceIcon(item.variance || 0)}
                            ₹{Math.abs(item.variance || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className={getVarianceColor(item.variance || 0)}>
                          {item.budget ? (((item.variance || 0) / item.budget) * 100).toFixed(1) : 0}%
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              (item.variance || 0) <= 0
                                ? "bg-green-100 text-green-800 border-green-300"
                                : Math.abs((item.variance || 0) / (item.budget || 1)) * 100 <= 5
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }
                          >
                            {(item.variance || 0) <= 0
                              ? "Under Budget"
                              : Math.abs((item.variance || 0) / (item.budget || 1)) * 100 <= 5
                              ? "Near Budget"
                              : "Over Budget"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Financial Data</h3>
                  <p className="text-gray-600">Financial analysis data will appear here once cost tracking is active.</p>
                </div>
              )}
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
              {reports && reports.length > 0 ? (
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
                    {reports.map((report, index) => (
                      <TableRow key={report.id || index}>
                        <TableCell className="font-medium">{report.name || 'Unnamed Report'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.type || 'General'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{report.lastGenerated || 'Never'}</TableCell>
                        <TableCell className="text-sm">{report.frequency || 'Manual'}</TableCell>
                        <TableCell className="text-sm">{report.format || 'PDF'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              report.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-yellow-100 text-yellow-800 border-yellow-300"
                            }
                          >
                            {report.status || 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportReport(report.format || 'PDF', report.id, report.name)}
                              disabled={isGenerating}
                            >
                              {isGenerating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Reports</h3>
                  <p className="text-gray-600 mb-4">Create and save reports to access them quickly in the future.</p>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
