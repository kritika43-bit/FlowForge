const prisma = require('../database');

// Get all BOMs with filtering
const getBOMs = async (req, res) => {
  try {
    const { productId, status, page = 1, limit = 10, search } = req.query;

    const where = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { version: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [boms, total] = await Promise.all([
      prisma.billOfMaterials.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, category: true },
          },
          items: {
            include: {
              component: {
                select: { id: true, name: true, sku: true, unitCost: true },
              },
            },
            orderBy: { sequence: 'asc' },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.billOfMaterials.count({ where }),
    ]);

    // Calculate total cost for each BOM
    const bomsWithCosts = boms.map(bom => {
      const totalCost = bom.items.reduce((sum, item) => {
        return sum + (item.quantity * (item.component.unitCost || 0));
      }, 0);

      return {
        ...bom,
        totalCost: Math.round(totalCost * 100) / 100,
        componentCount: bom._count.items,
      };
    });

    res.json({
      boms: bomsWithCosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ error: 'Failed to fetch Bills of Materials' });
  }
};

// Get single BOM by ID
const getBOMById = async (req, res) => {
  try {
    const { id } = req.params;

    const bom = await prisma.billOfMaterials.findUnique({
      where: { id },
      include: {
        product: {
          select: { id: true, name: true, category: true, description: true },
        },
        items: {
          include: {
            component: {
              select: { 
                id: true, 
                name: true, 
                sku: true, 
                unitCost: true,
                quantity: true, // Available stock
                category: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!bom) {
      return res.status(404).json({ error: 'Bill of Materials not found' });
    }

    // Calculate costs and availability
    let totalCost = 0;
    let canManufacture = true;
    let shortageItems = [];

    const itemsWithMetrics = bom.items.map(item => {
      const itemCost = item.quantity * (item.component.unitCost || 0);
      totalCost += itemCost;

      const isAvailable = item.component.quantity >= item.quantity;
      if (!isAvailable) {
        canManufacture = false;
        shortageItems.push({
          componentId: item.component.id,
          name: item.component.name,
          required: item.quantity,
          available: item.component.quantity,
          shortage: item.quantity - item.component.quantity,
        });
      }

      return {
        ...item,
        itemCost: Math.round(itemCost * 100) / 100,
        isAvailable,
        availableStock: item.component.quantity,
      };
    });

    res.json({
      ...bom,
      items: itemsWithMetrics,
      metrics: {
        totalCost: Math.round(totalCost * 100) / 100,
        componentCount: bom.items.length,
        canManufacture,
        shortageItems,
      },
    });
  } catch (error) {
    console.error('Get BOM by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch Bill of Materials' });
  }
};

// Create new BOM
const createBOM = async (req, res) => {
  try {
    const {
      productId,
      name,
      version = '1.0',
      description,
      notes,
      items = [],
    } = req.body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate BOM items
    if (items.length === 0) {
      return res.status(400).json({ 
        error: 'BOM must have at least one item',
      });
    }

    // Verify all components exist
    const componentIds = items.map(item => item.componentId);
    const components = await prisma.stockItem.findMany({
      where: { id: { in: componentIds } },
      select: { id: true, name: true },
    });

    if (components.length !== componentIds.length) {
      const foundIds = components.map(c => c.id);
      const missingIds = componentIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({ 
        error: 'Some components not found',
        missingComponentIds: missingIds,
      });
    }

    // Create BOM with items in a transaction
    const bom = await prisma.$transaction(async (tx) => {
      const newBOM = await tx.billOfMaterials.create({
        data: {
          productId,
          name,
          version,
          description,
          notes,
        },
      });

      // Create BOM items
      const bomItems = await Promise.all(
        items.map((item, index) =>
          tx.bomItem.create({
            data: {
              bomId: newBOM.id,
              componentId: item.componentId,
              quantity: item.quantity,
              unit: item.unit || 'pcs',
              sequence: item.sequence || index + 1,
              notes: item.notes,
            },
          })
        )
      );

      return { ...newBOM, items: bomItems };
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'bom_created',
        description: `Created BOM ${name} for ${product.name}`,
        userId: req.user.id,
        metadata: { 
          bomId: bom.id, 
          productId,
          name,
          itemCount: items.length,
        },
      },
    });

    res.status(201).json({
      message: 'Bill of Materials created successfully',
      bom,
    });
  } catch (error) {
    console.error('Create BOM error:', error);
    res.status(500).json({ error: 'Failed to create Bill of Materials' });
  }
};

// Update BOM
const updateBOM = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      version,
      description,
      notes,
      status,
      items,
    } = req.body;

    // Check if BOM exists
    const existingBOM = await prisma.billOfMaterials.findUnique({
      where: { id },
      include: { 
        product: { select: { name: true } },
        items: { select: { id: true } },
      },
    });

    if (!existingBOM) {
      return res.status(404).json({ error: 'Bill of Materials not found' });
    }

    // If BOM is active and being used, create a new version instead of updating
    if (existingBOM.status === 'ACTIVE' && (items || version)) {
      const activeCount = await prisma.billOfMaterials.count({
        where: {
          productId: existingBOM.productId,
          status: 'ACTIVE',
        },
      });

      if (activeCount > 0) {
        return res.status(400).json({
          error: 'Cannot modify active BOM with items',
          details: 'Create a new version or set status to DRAFT first',
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (version !== undefined) updateData.version = version;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status.toUpperCase();

    // Update BOM and items if provided
    const result = await prisma.$transaction(async (tx) => {
      const updatedBOM = await tx.billOfMaterials.update({
        where: { id },
        data: updateData,
      });

      // If items are provided, replace all existing items
      if (items) {
        // Delete existing items
        await tx.bomItem.deleteMany({
          where: { bomId: id },
        });

        // Create new items
        const newItems = await Promise.all(
          items.map((item, index) =>
            tx.bomItem.create({
              data: {
                bomId: id,
                componentId: item.componentId,
                quantity: item.quantity,
                unit: item.unit || 'pcs',
                sequence: item.sequence || index + 1,
                notes: item.notes,
              },
            })
          )
        );

        return { ...updatedBOM, items: newItems };
      }

      return updatedBOM;
    });

    // If status changed to ACTIVE, deactivate other BOMs for the same product
    if (status && status.toUpperCase() === 'ACTIVE') {
      await prisma.billOfMaterials.updateMany({
        where: {
          productId: existingBOM.productId,
          id: { not: id },
          status: 'ACTIVE',
        },
        data: { status: 'INACTIVE' },
      });
    }

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'bom_updated',
        description: `Updated BOM ${result.name || existingBOM.name}`,
        userId: req.user.id,
        metadata: { 
          bomId: id, 
          name: result.name || existingBOM.name,
          changes: Object.keys(updateData),
        },
      },
    });

    res.json({
      message: 'Bill of Materials updated successfully',
      bom: result,
    });
  } catch (error) {
    console.error('Update BOM error:', error);
    res.status(500).json({ error: 'Failed to update Bill of Materials' });
  }
};

// Delete BOM
const deleteBOM = async (req, res) => {
  try {
    const { id } = req.params;

    const bom = await prisma.billOfMaterials.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
      },
    });

    if (!bom) {
      return res.status(404).json({ error: 'Bill of Materials not found' });
    }

    // Check if BOM is being used in any manufacturing orders
    const usageCount = await prisma.manufacturingOrder.count({
      where: {
        product: {
          bomItems: {
            some: { bomId: id },
          },
        },
        status: { not: 'CANCELLED' },
      },
    });

    if (usageCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete BOM being used in manufacturing orders',
        details: 'Set status to INACTIVE instead of deleting',
      });
    }

    // Delete BOM and its items (cascade delete)
    await prisma.billOfMaterials.delete({
      where: { id },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'bom_deleted',
        description: `Deleted BOM ${bom.name}`,
        userId: req.user.id,
        metadata: { bomId: id, name: bom.name },
      },
    });

    res.json({
      message: 'Bill of Materials deleted successfully',
    });
  } catch (error) {
    console.error('Delete BOM error:', error);
    res.status(500).json({ error: 'Failed to delete Bill of Materials' });
  }
};

// Calculate material requirements for manufacturing order
const calculateMaterialRequirements = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Get active BOM for the product
    const bom = await prisma.billOfMaterials.findFirst({
      where: {
        productId,
        status: 'ACTIVE',
      },
      include: {
        product: { select: { name: true } },
        items: {
          include: {
            component: {
              select: { 
                id: true, 
                name: true, 
                sku: true, 
                quantity: true,
                unitCost: true,
              },
            },
          },
        },
      },
    });

    if (!bom) {
      return res.status(404).json({ 
        error: 'No active BOM found for this product',
      });
    }

    // Calculate requirements
    const requirements = bom.items.map(item => {
      const requiredQuantity = item.quantity * quantity;
      const availableQuantity = item.component.quantity;
      const shortfall = Math.max(0, requiredQuantity - availableQuantity);
      const cost = requiredQuantity * (item.component.unitCost || 0);

      return {
        componentId: item.component.id,
        componentName: item.component.name,
        sku: item.component.sku,
        unitQuantity: item.quantity,
        requiredQuantity,
        availableQuantity,
        shortfall,
        unitCost: item.component.unitCost || 0,
        totalCost: Math.round(cost * 100) / 100,
        canFulfill: shortfall === 0,
      };
    });

    const totalCost = requirements.reduce((sum, req) => sum + req.totalCost, 0);
    const canManufacture = requirements.every(req => req.canFulfill);
    const shortfallItems = requirements.filter(req => req.shortfall > 0);

    res.json({
      productId,
      productName: bom.product.name,
      manufacturingQuantity: quantity,
      bomId: bom.id,
      bomName: bom.name,
      requirements,
      summary: {
        totalCost: Math.round(totalCost * 100) / 100,
        canManufacture,
        shortfallCount: shortfallItems.length,
        totalComponents: requirements.length,
      },
      shortfallItems,
    });
  } catch (error) {
    console.error('Calculate material requirements error:', error);
    res.status(500).json({ error: 'Failed to calculate material requirements' });
  }
};

// Get BOM statistics
const getBOMStats = async (req, res) => {
  try {
    const totalBOMs = await prisma.billOfMaterials.count();
    
    const statusStats = await prisma.billOfMaterials.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const activeBOMs = await prisma.billOfMaterials.count({
      where: { status: 'ACTIVE' },
    });

    // Get products without BOMs
    const productsWithoutBOM = await prisma.product.count({
      where: {
        bomItems: {
          none: {},
        },
      },
    });

    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    res.json({
      totalBOMs,
      activeBOMs,
      productsWithoutBOM,
      statusBreakdown: statusCounts,
    });
  } catch (error) {
    console.error('Get BOM stats error:', error);
    res.status(500).json({ error: 'Failed to fetch BOM statistics' });
  }
};

module.exports = {
  getBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  calculateMaterialRequirements,
  getBOMStats,
};
