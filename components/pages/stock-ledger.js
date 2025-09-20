"use client"

import { useState } from "react"
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
} from "lucide-react"
import { currencyUtils } from "../../lib/currency"

// Mock data for stock movements
const stockMovements = [
  {
    id: "SM-001",
    date: "2024-01-15",
    time: "14:30",
    item: "Steel Beam 6m",
    type: "OUT",
    quantity: 4,
    unit: "pcs",
    reference: "MO-2024-001",
    location: "Warehouse A",
    operator: "John Smith",
    reason: "Production consumption",
    balanceBefore: 50,
    balanceAfter: 46,
  },
  {
    id: "SM-002",
    date: "2024-01-15",
    time: "09:15",
    item: "Hydraulic Cylinder",
    type: "IN",
    quantity: 25,
    unit: "pcs",
    reference: "PO-2024-015",
    location: "Warehouse B",
    operator: "Sarah Wilson",
    reason: "Purchase receipt",
    balanceBefore: 15,
    balanceAfter: 40,
  },
  {
    id: "SM-003",
    date: "2024-01-14",
    time: "16:45",
    item: "Welding Rod",
    type: "OUT",
    quantity: 2,
    unit: "kg",
    reference: "MO-2024-001",
    location: "Warehouse A",
    operator: "Tom Rodriguez",
    reason: "Production consumption",
    balanceBefore: 25,
    balanceAfter: 23,
  },
  {
    id: "SM-004",
    date: "2024-01-14",
    time: "11:20",
    item: "PCB Board",
    type: "RETURN",
    quantity: 5,
    unit: "pcs",
    reference: "MO-2024-003",
    location: "Warehouse C",
    operator: "Anna Kim",
    reason: "Excess material return",
    balanceBefore: 120,
    balanceAfter: 125,
  },
  {
    id: "SM-005",
    date: "2024-01-13",
    time: "13:00",
    item: "Pump Motor",
    type: "OUT",
    quantity: 1,
    unit: "pcs",
    reference: "MO-2024-002",
    location: "Warehouse B",
    operator: "James Brown",
    reason: "Production consumption",
    balanceBefore: 8,
    balanceAfter: 7,
  },
  {
    id: "SM-006",
    date: "2024-01-13",
    time: "08:30",
    item: "Aluminum Block",
    type: "IN",
    quantity: 50,
    unit: "pcs",
    reference: "PO-2024-016",
    location: "Warehouse A",
    operator: "David Chen",
    reason: "Purchase receipt",
    balanceBefore: 12,
    balanceAfter: 62,
  },
]

// Mock data for current stock levels
const stockLevels = [
  {
    id: "ITM-001",
    item: "Steel Beam 6m",
    category: "Raw Materials",
    currentStock: 46,
    unit: "pcs",
    minStock: 20,
    maxStock: 100,
    location: "Warehouse A",
    unitCost: 200,
    totalValue: 9200,
    lastMovement: "2024-01-15",
    supplier: "Steel Corp Ltd",
    status: "healthy",
  },
  {
    id: "ITM-002",
    item: "Hydraulic Cylinder",
    category: "Components",
    currentStock: 40,
    unit: "pcs",
    minStock: 15,
    maxStock: 60,
    location: "Warehouse B",
    unitCost: 150,
    totalValue: 6000,
    lastMovement: "2024-01-15",
    supplier: "Hydraulic Systems Inc",
    status: "healthy",
  },
  {
    id: "ITM-003",
    item: "Welding Rod",
    category: "Consumables",
    currentStock: 23,
    unit: "kg",
    minStock: 10,
    maxStock: 50,
    location: "Warehouse A",
    unitCost: 22.5,
    totalValue: 517.5,
    lastMovement: "2024-01-14",
    supplier: "Welding Supplies Co",
    status: "healthy",
  },
  {
    id: "ITM-004",
    item: "PCB Board",
    category: "Electronics",
    currentStock: 125,
    unit: "pcs",
    minStock: 50,
    maxStock: 200,
    location: "Warehouse C",
    unitCost: 45,
    totalValue: 5625,
    lastMovement: "2024-01-14",
    supplier: "Electronics Plus",
    status: "healthy",
  },
  {
    id: "ITM-005",
    item: "Pump Motor",
    category: "Components",
    currentStock: 7,
    unit: "pcs",
    minStock: 10,
    maxStock: 25,
    location: "Warehouse B",
    unitCost: 300,
    totalValue: 2100,
    lastMovement: "2024-01-13",
    supplier: "Motor Works Ltd",
    status: "low",
  },
  {
    id: "ITM-006",
    item: "Aluminum Block",
    category: "Raw Materials",
    currentStock: 62,
    unit: "pcs",
    minStock: 20,
    maxStock: 80,
    location: "Warehouse A",
    unitCost: 80,
    totalValue: 4960,
    lastMovement: "2024-01-13",
    supplier: "Aluminum Supply Co",
    status: "healthy",
  },
  {
    id: "ITM-007",
    item: "Bearing Assembly",
    category: "Components",
    currentStock: 3,
    unit: "pcs",
    minStock: 15,
    maxStock: 40,
    location: "Warehouse B",
    unitCost: 85,
    totalValue: 255,
    lastMovement: "2024-01-12",
    supplier: "Precision Bearings",
    status: "critical",
  },
  {
    id: "ITM-008",
    item: "Control Panel Enclosure",
    category: "Components",
    currentStock: 28,
    unit: "pcs",
    minStock: 10,
    maxStock: 50,
    location: "Warehouse C",
    unitCost: 30,
    totalValue: 840,
    lastMovement: "2024-01-11",
    supplier: "Enclosure Systems",
    status: "healthy",
  },
]

const getMovementIcon = (type) => {
  switch (type) {
    case "IN":
      return <ArrowDownLeft className="h-4 w-4 text-flowforge-green" />
    case "OUT":
      return <ArrowUpRight className="h-4 w-4 text-destructive" />
    case "RETURN":
      return <RotateCcw className="h-4 w-4 text-flowforge-blue" />
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />
  }
}

const getMovementBadge = (type) => {
  const variants = {
    IN: "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20",
    OUT: "bg-destructive/10 text-destructive border-destructive/20",
    RETURN: "bg-flowforge-blue/10 text-flowforge-blue border-flowforge-blue/20",
  }

  return (
    <Badge variant="outline" className={variants[type] || "bg-muted"}>
      {type}
    </Badge>
  )
}

const getStockStatusBadge = (status, currentStock, minStock) => {
  let stockStatus = status
  if (currentStock <= minStock * 0.5) {
    stockStatus = "critical"
  } else if (currentStock <= minStock) {
    stockStatus = "low"
  }

  const variants = {
    healthy: "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20",
    low: "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20",
  }

  const icons = {
    healthy: <CheckCircle className="h-3 w-3" />,
    low: <Clock className="h-3 w-3" />,
    critical: <AlertTriangle className="h-3 w-3" />,
  }

  return (
    <Badge variant="outline" className={`${variants[stockStatus]} flex items-center gap-1`}>
      {icons[stockStatus]}
      {stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}
    </Badge>
  )
}

export function StockLedger() {
  const [searchTerm, setSearchTerm] = useState("")
  const [movementFilter, setMovementFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false)

  const filteredMovements = stockMovements.filter((movement) => {
    const matchesSearch =
      movement.item.toLowerCase().includes(searchTerm.toLowerCase()) || movement.reference.includes(searchTerm)
    const matchesFilter = movementFilter === "all" || movement.type.toLowerCase() === movementFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const filteredStock = stockLevels.filter((item) => {
    const matchesSearch =
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      stockFilter === "all" ||
      (stockFilter === "low" && item.currentStock <= item.minStock) ||
      (stockFilter === "critical" && item.currentStock <= item.minStock * 0.5) ||
      (stockFilter === "healthy" && item.currentStock > item.minStock)
    return matchesSearch && matchesFilter
  })

  const handleExport = (format) => {
    // Mock export functionality
    console.log(`Exporting stock data as ${format}`)
    // In a real app, this would generate and download the file
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
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {/* Export Buttons */}
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
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
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stockLevels.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {currencyUtils.formatters.compact(stockLevels.reduce((sum, item) => sum + item.totalValue, 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-flowforge-green" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-flowforge-amber">
                  {
                    stockLevels.filter(
                      (item) => item.currentStock <= item.minStock && item.currentStock > item.minStock * 0.5,
                    ).length
                  }
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
                <p className="text-sm text-muted-foreground">Critical Items</p>
                <p className="text-2xl font-bold text-destructive">
                  {stockLevels.filter((item) => item.currentStock <= item.minStock * 0.5).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
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
                <TrendingUp className="h-5 w-5 text-primary" />
                Stock Movements
              </CardTitle>
              <CardDescription>Track all inventory in/out movements and returns</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{movement.date}</div>
                          <div className="text-muted-foreground">{movement.time}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{movement.item}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          {getMovementBadge(movement.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={movement.type === "OUT" ? "text-destructive" : "text-flowforge-green"}>
                          {movement.type === "OUT" ? "-" : "+"}
                          {movement.quantity} {movement.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{movement.reference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{movement.location}</TableCell>
                      <TableCell className="text-sm">{movement.operator}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {movement.balanceBefore} → {movement.balanceAfter}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{movement.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <Package className="h-5 w-5 text-primary" />
                Current Stock Levels
              </CardTitle>
              <CardDescription>Monitor inventory levels and stock status</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {filteredStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {item.currentStock} {item.unit}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.minStock} / {item.maxStock}
                      </TableCell>
                      <TableCell>{getStockStatusBadge(item.status, item.currentStock, item.minStock)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.location}</TableCell>
                      <TableCell className="text-sm">{currencyUtils.formatters.compact(item.unitCost)}</TableCell>
                      <TableCell className="font-medium">{currencyUtils.formatters.compact(item.totalValue)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.lastMovement}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.supplier}</TableCell>
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

function AddMovementForm({ onClose }) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="item">Item</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steel-beam">Steel Beam 6m</SelectItem>
              <SelectItem value="hydraulic-cylinder">Hydraulic Cylinder</SelectItem>
              <SelectItem value="welding-rod">Welding Rod</SelectItem>
              <SelectItem value="pcb-board">PCB Board</SelectItem>
              <SelectItem value="pump-motor">Pump Motor</SelectItem>
              <SelectItem value="aluminum-block">Aluminum Block</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Movement Type</Label>
          <Select>
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
          <Input id="quantity" type="number" placeholder="Enter quantity" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse-a">Warehouse A</SelectItem>
              <SelectItem value="warehouse-b">Warehouse B</SelectItem>
              <SelectItem value="warehouse-c">Warehouse C</SelectItem>
              <SelectItem value="production-floor">Production Floor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" placeholder="PO/MO/WO reference" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator">Operator</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="john-smith">John Smith</SelectItem>
              <SelectItem value="sarah-wilson">Sarah Wilson</SelectItem>
              <SelectItem value="tom-rodriguez">Tom Rodriguez</SelectItem>
              <SelectItem value="anna-kim">Anna Kim</SelectItem>
              <SelectItem value="james-brown">James Brown</SelectItem>
              <SelectItem value="david-chen">David Chen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" placeholder="Reason for movement" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={onClose}>
          Add Movement
        </Button>
      </div>
    </form>
  )
}
