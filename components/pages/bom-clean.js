"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Search, Plus, FileText, Package, Layers, Edit, Trash2, Copy, Calculator, AlertTriangle, Loader2 } from "lucide-react"
import apiClient from '../../lib/apiClient'

const getStatusBadge = (status) => {
  const variants = {
    Active: "bg-green-100 text-green-800 border-green-300",
    Draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Obsolete: "bg-gray-100 text-gray-800 border-gray-300",
  }

  return (
    <Badge variant="outline" className={variants[status] || "bg-gray-100 text-gray-800"}>
      {status}
    </Badge>
  )
}

const getCategoryBadge = (category) => {
  const variants = {
    "Raw Materials": "bg-blue-100 text-blue-800 border-blue-300",
    Components: "bg-teal-100 text-teal-800 border-teal-300",
    Electronics: "bg-purple-100 text-purple-700 border-purple-200",
    Consumables: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Hardware: "bg-gray-100 text-gray-700 border-gray-200",
  }

  return (
    <Badge variant="outline" className={variants[category] || "bg-gray-100 text-gray-800"}>
      {category}
    </Badge>
  )
}

export function BOM() {
  const [billsOfMaterials, setBillsOfMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBOM, setSelectedBOM] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch BOMs from API
  useEffect(() => {
    const fetchBOMs = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/boms')
        setBillsOfMaterials(response.data)
      } catch (error) {
        console.error('Error fetching BOMs:', error)
        setError('Failed to load Bills of Materials')
      } finally {
        setLoading(false)
      }
    }
    fetchBOMs()
  }, [])

  const filteredBOMs = billsOfMaterials.filter((bom) => {
    const matchesSearch = 
      bom.product?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bom.id?.includes(searchTerm) ||
      bom.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || bom.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Bills of Materials</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          <h1 className="text-3xl font-semibold">Bills of Materials</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading BOMs</h3>
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

      {/* Empty state */}
      {filteredBOMs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bills of Materials Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {billsOfMaterials.length === 0 
                ? "Get started by creating your first BOM." 
                : "No BOMs match your current filters."}
            </p>
            {billsOfMaterials.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create BOM
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* BOM Cards Grid */}
      {filteredBOMs.length > 0 && (
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
                    <CardTitle className="text-lg">{bom.product || 'Unknown Product'}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {bom.id} - {bom.version || 'v1.0'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(bom.status || 'Draft')}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{bom.description || 'No description available'}</p>

                {/* Cost Summary */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Cost</span>
                    <span className="text-lg font-bold text-gray-900">₹{(bom.totalCost || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Component Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{bom.components?.length || 0} components</span>
                </div>

                {/* Component Categories */}
                {bom.components && bom.components.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(bom.components.map((comp) => comp.category).filter(Boolean))].map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta Information */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Updated: {bom.lastUpdated || 'Never'}</div>
                  <div>By: {bom.createdBy || 'Unknown'}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <div className="text-2xl font-bold text-gray-900">{bom.components?.length || 0}</div>
            <div className="text-sm text-gray-600">Components</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">₹{(bom.totalCost || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{bom.version || 'v1.0'}</div>
            <div className="text-sm text-gray-600">Version</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{getStatusBadge(bom.status || 'Draft')}</div>
            <div className="text-sm text-gray-600">Status</div>
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
          {bom.components && bom.components.length > 0 ? (
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
                {bom.components.map((component, index) => (
                  <TableRow key={component.id || index}>
                    <TableCell className="font-medium">{component.name || 'Unnamed Component'}</TableCell>
                    <TableCell>{getCategoryBadge(component.category || 'Unknown')}</TableCell>
                    <TableCell>
                      {component.quantity || 0} {component.unit || 'pcs'}
                    </TableCell>
                    <TableCell>₹{(component.unitCost || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{(component.totalCost || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-gray-600">{component.supplier || 'Unknown'}</TableCell>
                    <TableCell className="text-sm text-gray-600">{component.leadTime || 'Unknown'}</TableCell>
                    <TableCell
                      className="text-sm text-gray-600 max-w-48 truncate"
                      title={component.specifications}
                    >
                      {component.specifications || 'No specifications'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Components</h3>
              <p className="text-gray-600">This BOM doesn't have any components yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CreateBOMForm({ onClose }) {
  const [formData, setFormData] = useState({
    product: '',
    version: 'v1.0',
    description: '',
    status: 'draft',
    createdBy: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiClient.post('/boms', formData)
      onClose()
      // Refresh the page or update state to show new BOM
      window.location.reload()
    } catch (error) {
      console.error('Error creating BOM:', error)
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
          <Label htmlFor="product">Product Name</Label>
          <Input 
            id="product" 
            placeholder="Enter product name" 
            value={formData.product}
            onChange={(e) => handleChange('product', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input 
            id="version" 
            placeholder="v1.0" 
            value={formData.version}
            onChange={(e) => handleChange('version', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Describe the product or assembly" 
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
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
          <Input 
            id="createdBy" 
            placeholder="Team or person name" 
            value={formData.createdBy}
            onChange={(e) => handleChange('createdBy', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create BOM
        </Button>
      </div>
    </form>
  )
}
