const prisma = require('../database');

// Generate unique order number
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.manufacturingOrder.count({
    where: {
      orderNumber: {
        startsWith: `MO-${year}-`,
      },
    },
  });
  return `MO-${year}-${String(count + 1).padStart(3, '0')}`;
};

// Get all manufacturing orders with filtering
const getOrders = async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 10, search } = req.query;

    const where = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (priority) {
      where.priority = priority.toUpperCase();
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.manufacturingOrder.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, category: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, position: true },
          },
          workOrders: {
            select: { id: true, status: true, progress: true },
          },
          _count: {
            select: { workOrders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.manufacturingOrder.count({ where }),
    ]);

    // Calculate overall progress for each order
    const ordersWithProgress = orders.map(order => {
      const completedWorkOrders = order.workOrders.filter(wo => wo.status === 'COMPLETED').length;
      const totalWorkOrders = order.workOrders.length;
      const calculatedProgress = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;
      
      return {
        ...order,
        progress: Math.round(calculatedProgress),
      };
    });

    res.json({
      orders: ordersWithProgress,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturing orders' });
  }
};

// Get single manufacturing order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            bomItems: {
              include: {
                bom: true,
                component: true,
              },
            },
          },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, position: true, email: true },
        },
        workOrders: {
          include: {
            workCenter: {
              select: { id: true, name: true, type: true, status: true },
            },
            assignedTo: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Manufacturing order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturing order' });
  }
};

// Create new manufacturing order
const createOrder = async (req, res) => {
  try {
    const { productId, quantity, deadline, priority = 'MEDIUM', assignedToId, notes } = req.body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bomItems: {
          include: {
            bom: true,
            component: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify assigned user exists (if provided)
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignedUser) {
        return res.status(404).json({ error: 'Assigned user not found' });
      }
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate estimated cost based on BOM
    let estimatedCost = 0;
    if (product.bomItems && product.bomItems.length > 0) {
      estimatedCost = product.bomItems.reduce((total, item) => {
        return total + (item.totalCost || 0) * quantity;
      }, 0);
    }

    // Create manufacturing order
    const order = await prisma.manufacturingOrder.create({
      data: {
        orderNumber,
        productId,
        quantity,
        deadline: new Date(deadline),
        priority: priority.toUpperCase(),
        assignedToId,
        estimatedCost,
        notes,
      },
      include: {
        product: {
          select: { id: true, name: true, category: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'order_created',
        description: `Created manufacturing order ${orderNumber} for ${product.name}`,
        userId: req.user.id,
        metadata: { orderId: order.id, orderNumber },
      },
    });

    res.status(201).json({
      message: 'Manufacturing order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create manufacturing order' });
  }
};

// Update manufacturing order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, deadline, priority, assignedToId, status, notes, actualCost } = req.body;

    // Check if order exists
    const existingOrder = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: { product: { select: { name: true } } },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Manufacturing order not found' });
    }

    // Verify assigned user exists (if provided)
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignedUser) {
        return res.status(404).json({ error: 'Assigned user not found' });
      }
    }

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (deadline) updateData.deadline = new Date(deadline);
    if (priority) updateData.priority = priority.toUpperCase();
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (status) updateData.status = status.toUpperCase();
    if (notes !== undefined) updateData.notes = notes;
    if (actualCost !== undefined) updateData.actualCost = actualCost;

    // Set completion date if status is completed
    if (status && status.toUpperCase() === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedOrder = await prisma.manufacturingOrder.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: { id: true, name: true, category: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'order_updated',
        description: `Updated manufacturing order ${existingOrder.orderNumber}`,
        userId: req.user.id,
        metadata: { orderId: id, changes: Object.keys(updateData) },
      },
    });

    res.json({
      message: 'Manufacturing order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update manufacturing order' });
  }
};

// Delete/Cancel manufacturing order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: {
        workOrders: { select: { id: true, status: true } },
        product: { select: { name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Manufacturing order not found' });
    }

    // Check if order can be cancelled
    const hasActiveWorkOrders = order.workOrders.some(wo => 
      ['STARTED', 'PAUSED'].includes(wo.status)
    );

    if (hasActiveWorkOrders) {
      return res.status(400).json({ 
        error: 'Cannot cancel order with active work orders',
        details: 'Please complete or cancel all work orders first',
      });
    }

    // Update order status to cancelled instead of deleting
    const cancelledOrder = await prisma.manufacturingOrder.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    // Cancel all pending work orders
    await prisma.workOrder.updateMany({
      where: { 
        manufacturingOrderId: id,
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'order_cancelled',
        description: `Cancelled manufacturing order ${order.orderNumber}`,
        userId: req.user.id,
        metadata: { orderId: id, orderNumber: order.orderNumber },
      },
    });

    res.json({
      message: 'Manufacturing order cancelled successfully',
      order: cancelledOrder,
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to cancel manufacturing order' });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const stats = await prisma.manufacturingOrder.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const totalOrders = await prisma.manufacturingOrder.count();
    
    // Get average cost for completed orders
    const costStats = await prisma.manufacturingOrder.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: { not: null },
      },
      _avg: {
        estimatedCost: true,
        actualCost: true,
      },
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    res.json({
      totalOrders,
      statusBreakdown: statusCounts,
      // avgLeadTimeDays: avgLeadTime._avg.leadTime || 0,
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
};
