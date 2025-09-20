const prisma = require('../database');

// Get all stock items with filtering
const getStockItems = async (req, res) => {
  try {
    const { 
      category, 
      location, 
      lowStock = false, 
      page = 1, 
      limit = 10, 
      search 
    } = req.query;

    const where = {};
    
    if (category) {
      where.category = category.toUpperCase();
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    // For low stock filtering, we'll use a simpler approach
    // This could be improved with a computed field or view
    if (lowStock === 'true') {
      // Use a reasonable threshold for now
      where.quantity = { lte: 10 };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [stockItems, total] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        include: {
          movements: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          _count: {
            select: { movements: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.stockItem.count({ where }),
    ]);

    // Add calculated fields
    const stockItemsWithMetrics = stockItems.map(item => {
      const isLowStock = item.quantity <= item.reorderPoint;
      const stockValue = item.quantity * item.unitCost;
      const lastMovement = item.movements[0];

      return {
        ...item,
        isLowStock,
        stockValue: Math.round(stockValue * 100) / 100,
        lastMovement: lastMovement ? {
          type: lastMovement.type,
          quantity: lastMovement.quantity,
          date: lastMovement.createdAt,
          user: lastMovement.user,
        } : null,
      };
    });

    res.json({
      stockItems: stockItemsWithMetrics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get stock items error:', error);
    res.status(500).json({ error: 'Failed to fetch stock items' });
  }
};

// Get single stock item by ID
const getStockItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const stockItem = await prisma.stockItem.findUnique({
      where: { id },
      include: {
        movements: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!stockItem) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    // Calculate metrics
    const isLowStock = stockItem.quantity <= stockItem.reorderPoint;
    const stockValue = stockItem.quantity * stockItem.unitCost;
    
    const movementSummary = stockItem.movements.reduce((acc, movement) => {
      if (movement.type === 'IN') {
        acc.totalIn += movement.quantity;
      } else if (movement.type === 'OUT') {
        acc.totalOut += movement.quantity;
      }
      return acc;
    }, { totalIn: 0, totalOut: 0 });

    res.json({
      ...stockItem,
      metrics: {
        isLowStock,
        stockValue: Math.round(stockValue * 100) / 100,
        totalMovements: stockItem.movements.length,
        ...movementSummary,
      },
    });
  } catch (error) {
    console.error('Get stock item by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch stock item' });
  }
};

// Create new stock item
const createStockItem = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      quantity = 0,
      unitCost = 0,
      reorderPoint = 0,
      maxStock = null,
      location,
      supplier,
    } = req.body;

    // Check if SKU already exists
    if (sku) {
      const existingSku = await prisma.stockItem.findFirst({
        where: { sku: { equals: sku, mode: 'insensitive' } },
      });

      if (existingSku) {
        return res.status(400).json({ 
          error: 'SKU already exists',
          details: 'Please choose a different SKU',
        });
      }
    }

    const stockItem = await prisma.stockItem.create({
      data: {
        name,
        sku,
        description,
        category: category ? category.toUpperCase() : 'GENERAL',
        quantity,
        unitCost,
        reorderPoint,
        maxStock,
        location,
        supplier,
      },
    });

    // Create initial stock movement if quantity > 0
    if (quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          stockItemId: stockItem.id,
          type: 'IN',
          quantity,
          reference: 'Initial Stock',
          notes: 'Initial stock entry',
          userId: req.user.id,
        },
      });
    }

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'stock_item_created',
        description: `Created stock item ${name}`,
        userId: req.user.id,
        metadata: { stockItemId: stockItem.id, name, sku },
      },
    });

    res.status(201).json({
      message: 'Stock item created successfully',
      stockItem,
    });
  } catch (error) {
    console.error('Create stock item error:', error);
    res.status(500).json({ error: 'Failed to create stock item' });
  }
};

// Update stock item
const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      category,
      unitCost,
      reorderPoint,
      maxStock,
      location,
      supplier,
    } = req.body;

    // Check if stock item exists
    const existingItem = await prisma.stockItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    // Check if new SKU conflicts with existing item (if SKU is being changed)
    if (sku && sku !== existingItem.sku) {
      const skuConflict = await prisma.stockItem.findFirst({
        where: { 
          sku: { equals: sku, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (skuConflict) {
        return res.status(400).json({ 
          error: 'SKU already exists',
          details: 'Please choose a different SKU',
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category.toUpperCase();
    if (unitCost !== undefined) updateData.unitCost = unitCost;
    if (reorderPoint !== undefined) updateData.reorderPoint = reorderPoint;
    if (maxStock !== undefined) updateData.maxStock = maxStock;
    if (location !== undefined) updateData.location = location;
    if (supplier !== undefined) updateData.supplier = supplier;

    const updatedStockItem = await prisma.stockItem.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'stock_item_updated',
        description: `Updated stock item ${updatedStockItem.name}`,
        userId: req.user.id,
        metadata: { 
          stockItemId: id, 
          name: updatedStockItem.name,
          changes: Object.keys(updateData),
        },
      },
    });

    res.json({
      message: 'Stock item updated successfully',
      stockItem: updatedStockItem,
    });
  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({ error: 'Failed to update stock item' });
  }
};

// Delete stock item
const deleteStockItem = async (req, res) => {
  try {
    const { id } = req.params;

    const stockItem = await prisma.stockItem.findUnique({
      where: { id },
      include: {
        movements: { select: { id: true } },
      },
    });

    if (!stockItem) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    // Check if item has any movements
    if (stockItem.movements.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete stock item with movement history',
        details: 'Items with stock movements cannot be deleted for audit purposes',
      });
    }

    await prisma.stockItem.delete({
      where: { id },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'stock_item_deleted',
        description: `Deleted stock item ${stockItem.name}`,
        userId: req.user.id,
        metadata: { stockItemId: id, name: stockItem.name },
      },
    });

    res.json({
      message: 'Stock item deleted successfully',
    });
  } catch (error) {
    console.error('Delete stock item error:', error);
    res.status(500).json({ error: 'Failed to delete stock item' });
  }
};

// Create stock movement (adjust stock)
const createStockMovement = async (req, res) => {
  try {
    const {
      stockItemId,
      type,
      quantity,
      reference,
      notes,
    } = req.body;

    // Verify stock item exists
    const stockItem = await prisma.stockItem.findUnique({
      where: { id: stockItemId },
    });

    if (!stockItem) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    // Validate movement type and quantity
    const movementType = type.toUpperCase();
    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(movementType)) {
      return res.status(400).json({ 
        error: 'Invalid movement type',
        details: 'Type must be IN, OUT, or ADJUSTMENT',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ 
        error: 'Invalid quantity',
        details: 'Quantity must be greater than 0',
      });
    }

    // Check if OUT movement would result in negative stock
    if (movementType === 'OUT' && stockItem.quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        details: `Available: ${stockItem.quantity}, Requested: ${quantity}`,
      });
    }

    // Calculate new quantity
    let newQuantity = stockItem.quantity;
    if (movementType === 'IN' || movementType === 'ADJUSTMENT') {
      if (movementType === 'ADJUSTMENT') {
        // For adjustments, the quantity can be positive or negative
        newQuantity = quantity;
      } else {
        newQuantity += quantity;
      }
    } else if (movementType === 'OUT') {
      newQuantity -= quantity;
    }

    // Create movement and update stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          stockItemId,
          type: movementType,
          quantity: movementType === 'ADJUSTMENT' ? 
            (quantity - stockItem.quantity) : quantity,
          previousQuantity: stockItem.quantity,
          newQuantity,
          reference,
          notes,
          userId: req.user.id,
        },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      const updatedStockItem = await tx.stockItem.update({
        where: { id: stockItemId },
        data: { quantity: newQuantity },
      });

      return { movement, updatedStockItem };
    });

    // Log activity
    const actionMap = {
      'IN': 'added to',
      'OUT': 'removed from',
      'ADJUSTMENT': 'adjusted',
    };

    await prisma.userActivity.create({
      data: {
        type: 'stock_movement',
        description: `${actionMap[movementType]} stock for ${stockItem.name}`,
        userId: req.user.id,
        metadata: { 
          stockItemId, 
          movementId: result.movement.id,
          type: movementType,
          quantity,
        },
      },
    });

    res.status(201).json({
      message: 'Stock movement created successfully',
      movement: result.movement,
      stockItem: result.updatedStockItem,
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({ error: 'Failed to create stock movement' });
  }
};

// Get stock movements with filtering
const getStockMovements = async (req, res) => {
  try {
    const { 
      stockItemId, 
      type, 
      userId,
      startDate,
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;

    const where = {};
    
    if (stockItemId) {
      where.stockItemId = stockItemId;
    }
    
    if (type) {
      where.type = type.toUpperCase();
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          stockItem: {
            select: { id: true, name: true, sku: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.stockMovement.count({ where }),
    ]);

    res.json({
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
};

// Get stock statistics
const getStockStats = async (req, res) => {
  try {
    const totalItems = await prisma.stockItem.count();
    
    // Get low stock items using raw query
    const lowStockResult = await prisma.$queryRaw`
      SELECT COUNT(*) FROM stock_items WHERE quantity <= reorder_point
    `;
    const lowStockItems = Number(lowStockResult[0].count);

    const outOfStockItems = await prisma.stockItem.count({
      where: { quantity: 0 },
    });

    const categoryStats = await prisma.stockItem.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      _sum: {
        quantity: true,
      },
    });

    // Calculate total stock value
    const stockValueResult = await prisma.stockItem.aggregate({
      _sum: {
        quantity: true,
      },
    });

    const stockItems = await prisma.stockItem.findMany({
      select: { quantity: true, unitCost: true },
    });

    const totalStockValue = stockItems.reduce((total, item) => {
      return total + (item.quantity * item.unitCost);
    }, 0);

    const categoryCounts = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = {
        count: stat._count.category,
        totalQuantity: stat._sum.quantity || 0,
      };
      return acc;
    }, {});

    res.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      categoryBreakdown: categoryCounts,
    });
  } catch (error) {
    console.error('Get stock stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stock statistics' });
  }
};

module.exports = {
  getStockItems,
  getStockItemById,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  createStockMovement,
  getStockMovements,
  getStockStats,
};
