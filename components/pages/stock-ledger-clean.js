"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import {
  Search,
  Filter,
  Plus,
  Download,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Loader2,
} from "lucide-react"
import apiClient from '../../lib/apiClient'

const getMovementIcon = (type) => {
  switch (type?.toUpperCase()) {
    case "IN":
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />
    case "OUT":
      return <ArrowUpRight className="h-4 w-4 text-red-500" />
    case "RETURN":
      return <RotateCcw className="h-4 w-4 text-blue-500" />
    default:
      return <Package className="h-4 w-4 text-gray-500" />
  }
}

const getMovementBadge = (type) => {
  const variants = {
    IN: "bg-green-100 text-green-800 border-green-300",
    OUT: "bg-red-100 text-red-800 border-red-300",
    RETURN: "bg-blue-100 text-blue-800 border-blue-300",
  }

  return (
    <Badge variant="outline" className={variants[type?.toUpperCase()] || "bg-gray-100 text-gray-800"}>
      {type?.toUpperCase() || 'UNKNOWN'}
    </Badge>
  )
}

const getStockStatusBadge = (currentStock, minStock) => {
  let status = "healthy"
  if (currentStock <= minStock * 0.5) {
    status = "critical"
  } else if (currentStock <= minStock) {
    status = "low"
  }

  const variants = {
    healthy: "bg-green-100 text-green-800 border-green-300",
    low: "bg-yellow-100 text-yellow-800 border-yellow-300",
    critical: "bg-red-100 text-red-800 border-red-300",
  }

  const icons = {
    healthy: <CheckCircle className="h-3 w-3" />,
    low: <Clock className="h-3 w-3" />,
    critical: <AlertTriangle className="h-3 w-3" />,
  }

  return (
    <Badge variant="outline" className={`${variants[status]} flex items-center gap-1`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function StockLedger() {
  const [stockMovements, setStockMovements] = useState([])
  const [stockLevels, setStockLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [movementFilter, setMovementFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true)
        const [movementsResponse, levelsResponse] = await Promise.all([
          apiClient.get('/stock/movements'),
          apiClient.get('/stock/levels')
        ])
        setStockMovements(movementsResponse.data)
        setStockLevels(levelsResponse.data)
      } catch (error) {
        console.error('Error fetching stock data:', error)
        setError('Failed to load stock data')
      } finally {
        setLoading(false)
      }
    }
    fetchStockData()
  }, [])

  const filteredMovements = stockMovements.filter((movement) => {
    const matchesSearch =
      movement.item?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      movement.reference?.includes(searchTerm)
    const matchesFilter = movementFilter === "all" || movement.type?.toLowerCase() === movementFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const filteredStock = stockLevels.filter((item) => {
    const matchesSearch =
      item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      stockFilter === "all" ||
      (stockFilter === "low" && item.currentStock <= item.minStock) ||
      (stockFilter === "critical" && item.currentStock <= item.minStock * 0.5) ||
      (stockFilter === "healthy" && item.currentStock > item.minStock)
    return matchesSearch && matchesFilter
  })

  const handleExport = async (format) => {
    setIsExporting(true)
    try {
      await apiClient.post('/stock/export', { format })
      console.log(`Exporting stock data as ${format}`)
    } catch (error) {
      console.error('Error exporting stock data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Calculate summary statistics
  const totalItems = stockLevels.length
  const totalValue = stockLevels.reduce((sum, item) => sum + (item.totalValue || 0), 0)
  const lowStockItems = stockLevels.filter(
    (item) => item.currentStock <= item.minStock && item.currentStock > item.minStock * 0.5
  ).length
  const criticalItems = stockLevels.filter((item) => item.currentStock <= item.minStock * 0.5).length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Stock Ledger</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-semibold">Stock Ledger</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Stock Data</h3>
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
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {/* Export Buttons */}
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={isExporting}>
            {isExporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={isExporting}>
            {isExporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>

          {/* Add Movement Button */}
          <Dialog open={isAddMovementOpen} onOpenChange={setIsAddMovementOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Stock Movement</DialogTitle>
                <DialogDescription>Record a new inventory movement transaction.</DialogDescription>
              </DialogHeader>
              <AddMovementForm onClose={() => setIsAddMovementOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Items</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Movements and Stock Levels */}
      <Tabs defaultValue="movements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="levels">Current Stock Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4">
          {/* Movement Filter */}
          <div className="flex gap-4">
            <Select value={movementFilter} onValueChange={setMovementFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movements</SelectItem>
                <SelectItem value="in">Inbound</SelectItem>
                <SelectItem value="out">Outbound</SelectItem>
                <SelectItem value="return">Returns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Movements Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Stock Movements
              </CardTitle>
              <CardDescription>Track all inventory in/out movements and returns</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMovements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement, index) => (
                      <TableRow key={movement.id || index}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{movement.date || 'No date'}</div>
                            <div className="text-gray-600">{movement.time || 'No time'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{movement.item || 'Unknown Item'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.type)}
                            {getMovementBadge(movement.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={movement.type?.toUpperCase() === "OUT" ? "text-red-500" : "text-green-500"}>
                            {movement.type?.toUpperCase() === "OUT" ? "-" : "+"}
                            {movement.quantity || 0} {movement.unit || 'pcs'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{movement.reference || 'No reference'}</TableCell>
                        <TableCell className="text-sm text-gray-600">{movement.location || 'Unknown'}</TableCell>
                        <TableCell className="text-sm">{movement.operator || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {movement.balanceBefore || 0} → {movement.balanceAfter || 0}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{movement.reason || 'No reason specified'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Movements</h3>
                  <p className="text-gray-600">Stock movements will appear here once inventory transactions are recorded.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          {/* Stock Filter */}
          <div className="flex gap-4">
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="healthy">Healthy Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock Levels Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Current Stock Levels
              </CardTitle>
              <CardDescription>Monitor inventory levels and stock status</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStock.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min/Max</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Last Movement</TableHead>
                      <TableHead>Supplier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="font-medium">{item.item || 'Unknown Item'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {item.currentStock || 0} {item.unit || 'pcs'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.minStock || 0} / {item.maxStock || 0}
                        </TableCell>
                        <TableCell>{getStockStatusBadge(item.currentStock || 0, item.minStock || 0)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{item.location || 'Unknown'}</TableCell>
                        <TableCell className="text-sm">₹{(item.unitCost || 0).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{(item.totalValue || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-gray-600">{item.lastMovement || 'Never'}</TableCell>
                        <TableCell className="text-sm text-gray-600">{item.supplier || 'Unknown'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Items</h3>
                  <p className="text-gray-600">Stock items will appear here once inventory is added to the system.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AddMovementForm({ onClose }) {
  const [formData, setFormData] = useState({
    item: '',
    type: '',
    quantity: '',
    location: '',
    reference: '',
    operator: '',
    reason: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiClient.post('/stock/movements', {
        ...formData,
        quantity: Number(formData.quantity)
      })
      onClose()
      // Refresh the page or update state to show new movement
      window.location.reload()
    } catch (error) {
      console.error('Error adding stock movement:', error)
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
          <Label htmlFor="item">Item</Label>
          <Input 
            id="item" 
            placeholder="Enter item name" 
            value={formData.item}
            onChange={(e) => handleChange('item', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Movement Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Inbound (IN)</SelectItem>
              <SelectItem value="out">Outbound (OUT)</SelectItem>
              <SelectItem value="return">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input 
            id="quantity" 
            type="number" 
            placeholder="Enter quantity" 
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="Enter location" 
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input 
            id="reference" 
            placeholder="PO/MO/WO reference" 
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator">Operator</Label>
          <Input 
            id="operator" 
            placeholder="Operator name" 
            value={formData.operator}
            onChange={(e) => handleChange('operator', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Input 
          id="reason" 
          placeholder="Reason for movement" 
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Add Movement
        </Button>
      </div>
    </form>
  )
}
