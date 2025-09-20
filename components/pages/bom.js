"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Search, Plus, FileText, Package, Layers, Edit, Trash2, Copy, Calculator } from "lucide-react"
import { currencyUtils } from "../../lib/currency"

// Mock data for BOMs
const billsOfMaterials = [
  {
    id: "BOM-001",
    product: "Steel Frame Assembly",
    version: "v2.1",
    status: "Active",
    description: "Complete steel frame assembly for industrial equipment",
    totalCost: 270,
    lastUpdated: "2024-01-10",
    createdBy: "Engineering Team",
    components: [
      {
        id: "COMP-001",
        name: "Steel Beam 6m",
        quantity: 4,
        unit: "pcs",
        unitCost: 200,
        totalCost: 800,
        supplier: "Steel Corp Ltd",
        leadTime: "5 days",
        category: "Raw Materials",
        specifications: "Grade A36, 6m length",
      },
      {
        id: "COMP-002",
        name: "Welding Rod",
        quantity: 2,
        unit: "kg",
        unitCost: 22.5,
        totalCost: 45,
        supplier: "Welding Supplies Co",
        leadTime: "2 days",
        category: "Consumables",
        specifications: "E7018, 3.2mm diameter",
      },
      {
        id: "COMP-003",
        name: "Paint Primer",
        quantity: 1,
        unit: "L",
        unitCost: 25,
        totalCost: 25,
        supplier: "Paint Solutions Inc",
        leadTime: "3 days",
        category: "Consumables",
        specifications: "Anti-rust primer, gray",
      },
      {
        id: "COMP-004",
        name: "Bolts M12x50",
        quantity: 16,
        unit: "pcs",
        unitCost: 2.5,
        totalCost: 40,
        supplier: "Fasteners Plus",
        leadTime: "1 day",
        category: "Hardware",
        specifications: "Grade 8.8, zinc plated",
      },
    ],
  },
  {
    id: "BOM-002",
    product: "Hydraulic Pump Unit",
    version: "v1.3",
    status: "Active",
    description: "High-pressure hydraulic pump assembly",
    totalCost: 525,
    lastUpdated: "2024-01-08",
    createdBy: "Design Team",
    components: [
      {
        id: "COMP-005",
        name: "Hydraulic Cylinder",
        quantity: 1,
        unit: "pcs",
        unitCost: 150,
        totalCost: 150,
        supplier: "Hydraulic Systems Inc",
        leadTime: "7 days",
        category: "Components",
        specifications: "50mm bore, 300mm stroke",
      },
      {
        id: "COMP-006",
        name: "Pump Motor",
        quantity: 1,
        unit: "pcs",
        unitCost: 300,
        totalCost: 300,
        supplier: "Motor Works Ltd",
        leadTime: "10 days",
        category: "Components",
        specifications: "3HP, 1800 RPM, 220V",
      },
      {
        id: "COMP-007",
        name: "Hydraulic Fluid",
        quantity: 5,
        unit: "L",
        unitCost: 15,
        totalCost: 75,
        supplier: "Fluid Dynamics Co",
        leadTime: "2 days",
        category: "Consumables",
        specifications: "ISO VG 46, synthetic",
      },
    ],
  },
  {
    id: "BOM-003",
    product: "Control Panel Board",
    version: "v3.0",
    status: "Draft",
    description: "Electronic control panel with integrated circuits",
    totalCost: 150,
    lastUpdated: "2024-01-12",
    createdBy: "Electronics Team",
    components: [
      {
        id: "COMP-008",
        name: "PCB Board",
        quantity: 1,
        unit: "pcs",
        unitCost: 45,
        totalCost: 45,
        supplier: "Electronics Plus",
        leadTime: "14 days",
        category: "Electronics",
        specifications: "4-layer, FR4, 100x80mm",
      },
      {
        id: "COMP-009",
        name: "Electronic Components",
        quantity: 1,
        unit: "set",
        unitCost: 75,
        totalCost: 75,
        supplier: "Component Supply Co",
        leadTime: "5 days",
        category: "Electronics",
        specifications: "Resistors, capacitors, ICs",
      },
      {
        id: "COMP-010",
        name: "Enclosure",
        quantity: 1,
        unit: "pcs",
        unitCost: 30,
        totalCost: 30,
        supplier: "Enclosure Systems",
        leadTime: "3 days",
        category: "Components",
        specifications: "IP65, aluminum, 150x100x50mm",
      },
    ],
  },
]

const getStatusBadge = (status) => {
  const variants = {
    Active: "bg-flowforge-green/10 text-flowforge-green border-flowforge-green/20",
    Draft: "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20",
    Obsolete: "bg-muted text-muted-foreground border-muted",
  }

  return (
    <Badge variant="outline" className={variants[status] || "bg-muted"}>
      {status}
    </Badge>
  )
}

const getCategoryBadge = (category) => {
  const variants = {
    "Raw Materials": "bg-flowforge-blue/10 text-flowforge-blue border-flowforge-blue/20",
    Components: "bg-flowforge-teal/10 text-flowforge-teal border-flowforge-teal/20",
    Electronics: "bg-purple-100 text-purple-700 border-purple-200",
    Consumables: "bg-flowforge-amber/10 text-flowforge-amber border-flowforge-amber/20",
    Hardware: "bg-gray-100 text-gray-700 border-gray-200",
  }

  return (
    <Badge variant="outline" className={variants[category] || "bg-muted"}>
      {category}
    </Badge>
  )
}

export function BOM() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBOM, setSelectedBOM] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredBOMs = billsOfMaterials.filter((bom) => {
    const matchesSearch = bom.product.toLowerCase().includes(searchTerm.toLowerCase()) || bom.id.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || bom.status.toLowerCase() === statusFilter.toLowerCase()
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
              placeholder="Search BOMs..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="obsolete">Obsolete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create BOM Button */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create BOM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Bill of Materials</DialogTitle>
              <DialogDescription>Create a new BOM for a product or assembly.</DialogDescription>
            </DialogHeader>
            <CreateBOMForm onClose={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* BOM Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBOMs.map((bom) => (
          <Card
            key={bom.id}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => setSelectedBOM(bom)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{bom.product}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {bom.id} - {bom.version}
                  </CardDescription>
                </div>
                {getStatusBadge(bom.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{bom.description}</p>

              {/* Cost Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                  <span className="text-lg font-bold text-foreground">{currencyUtils.formatters.compact(bom.totalCost)}</span>
                </div>
              </div>

              {/* Component Count */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{bom.components.length} components</span>
              </div>

              {/* Component Categories */}
              <div className="flex flex-wrap gap-1">
                {[...new Set(bom.components.map((comp) => comp.category))].map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Meta Information */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Updated: {bom.lastUpdated}</div>
                <div>By: {bom.createdBy}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BOM Details Modal */}
      {selectedBOM && (
        <Dialog open={!!selectedBOM} onOpenChange={() => setSelectedBOM(null)}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {selectedBOM.product} - {selectedBOM.version}
              </DialogTitle>
              <DialogDescription>{selectedBOM.description}</DialogDescription>
            </DialogHeader>
            <BOMDetails bom={selectedBOM} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function BOMDetails({ bom }) {
  return (
    <div className="space-y-6">
      {/* BOM Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{bom.components.length}</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{currencyUtils.formatters.compact(bom.totalCost)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{bom.version}</div>
            <div className="text-sm text-muted-foreground">Version</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{getStatusBadge(bom.status)}</div>
            <div className="text-sm text-muted-foreground">Status</div>
          </CardContent>
        </Card>
      </div>

      {/* Components Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Component Breakdown
          </CardTitle>
          <CardDescription>Detailed list of all components and materials</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Specifications</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bom.components.map((component) => (
                <TableRow key={component.id}>
                  <TableCell className="font-medium">{component.name}</TableCell>
                  <TableCell>{getCategoryBadge(component.category)}</TableCell>
                  <TableCell>
                    {component.quantity} {component.unit}
                  </TableCell>
                  <TableCell>{currencyUtils.formatters.compact(component.unitCost)}</TableCell>
                  <TableCell className="font-medium">{currencyUtils.formatters.compact(component.totalCost)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{component.supplier}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{component.leadTime}</TableCell>
                  <TableCell
                    className="text-sm text-muted-foreground max-w-48 truncate"
                    title={component.specifications}
                  >
                    {component.specifications}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateBOMForm({ onClose }) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product Name</Label>
          <Input id="product" placeholder="Enter product name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input id="version" placeholder="v1.0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Describe the product or assembly" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="obsolete">Obsolete</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="createdBy">Created By</Label>
          <Input id="createdBy" placeholder="Team or person name" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={onClose}>
          Create BOM
        </Button>
      </div>
    </form>
  )
}
