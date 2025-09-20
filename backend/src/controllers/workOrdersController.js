const prisma = require('../database');

// Generate unique work order number
const generateWorkOrderNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.workOrder.count({
    where: {
      orderNumber: {
        startsWith: `WO-${year}-`,
      },
    },
  });
  return `WO-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Get all work orders with filtering
const getWorkOrders = async (req, res) => {
  try {
    const { 
      status, 
      workCenterId, 
      assignedTo, 
      manufacturingOrderId,
      page = 1, 
      limit = 10, 
      search 
    } = req.query;

    const where = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (workCenterId) {
      where.workCenterId = workCenterId;
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    
    if (manufacturingOrderId) {
      where.manufacturingOrderId = manufacturingOrderId;
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturingOrder: { orderNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        include: {
          manufacturingOrder: {
            select: { 
              id: true, 
              orderNumber: true, 
              product: { select: { name: true } },
              quantity: true,
            },
          },
          workCenter: {
            select: { id: true, name: true, type: true, status: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, position: true },
          },
        },
        orderBy: [
          { status: 'asc' }, // Show pending/started first
          { createdAt: 'desc' },
        ],
        skip,
        take: parseInt(limit),
      }),
      prisma.workOrder.count({ where }),
    ]);

    res.json({
      workOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
};

// Get work orders grouped by status (for Kanban view)
const getWorkOrdersKanban = async (req, res) => {
  try {
    const { workCenterId, assignedTo } = req.query;

    const where = {};
    if (workCenterId) where.workCenterId = workCenterId;
    if (assignedTo) where.assignedToId = assignedTo;

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        manufacturingOrder: {
          select: { 
            id: true, 
            orderNumber: true, 
            priority: true,
            product: { select: { name: true } },
            quantity: true,
          },
        },
        workCenter: {
          select: { id: true, name: true, type: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    const kanbanData = {
      PENDING: workOrders.filter(wo => wo.status === 'PENDING'),
      STARTED: workOrders.filter(wo => wo.status === 'STARTED'),
      PAUSED: workOrders.filter(wo => wo.status === 'PAUSED'),
      COMPLETED: workOrders.filter(wo => wo.status === 'COMPLETED'),
      CANCELLED: workOrders.filter(wo => wo.status === 'CANCELLED'),
    };

    res.json(kanbanData);
  } catch (error) {
    console.error('Get work orders kanban error:', error);
    res.status(500).json({ error: 'Failed to fetch work orders for kanban view' });
  }
};

// Get single work order by ID
const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        manufacturingOrder: {
          include: {
            product: { select: { id: true, name: true, category: true } },
          },
        },
        workCenter: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, position: true, email: true },
        },
      },
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    res.json(workOrder);
  } catch (error) {
    console.error('Get work order by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
};

// Create new work order
const createWorkOrder = async (req, res) => {
  try {
    const {
      title,
      description,
      manufacturingOrderId,
      workCenterId,
      estimatedHours,
      assignedToId,
      dueDate,
      priority = 'MEDIUM',
    } = req.body;

    // Verify manufacturing order exists
    const manufacturingOrder = await prisma.manufacturingOrder.findUnique({
      where: { id: manufacturingOrderId },
      include: { product: { select: { name: true } } },
    });

    if (!manufacturingOrder) {
      return res.status(404).json({ error: 'Manufacturing order not found' });
    }

    // Verify work center exists and is available
    const workCenter = await prisma.workCenter.findUnique({
      where: { id: workCenterId },
    });

    if (!workCenter) {
      return res.status(404).json({ error: 'Work center not found' });
    }

    if (workCenter.status === 'OFFLINE') {
      return res.status(400).json({ 
        error: 'Work center is offline',
        details: `Work center status: ${workCenter.status}`,
      });
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

    // Generate work order number
    const orderNumber = await generateWorkOrderNumber();

    // Create work order
    const workOrder = await prisma.workOrder.create({
      data: {
        orderNumber,
        title,
        description,
        manufacturingOrderId,
        workCenterId,
        estimatedHours,
        dueDate: new Date(dueDate),
        assignedToId,
        priority: priority.toUpperCase(),
      },
      include: {
        manufacturingOrder: {
          select: { 
            id: true, 
            orderNumber: true, 
            product: { select: { name: true } },
          },
        },
        workCenter: {
          select: { id: true, name: true, type: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'work_order_created',
        description: `Created work order ${orderNumber} for ${title}`,
        userId: req.user.id,
        metadata: { 
          workOrderId: workOrder.id, 
          orderNumber,
          manufacturingOrderId,
        },
      },
    });

    res.status(201).json({
      message: 'Work order created successfully',
      workOrder,
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ error: 'Failed to create work order' });
  }
};

// Update work order status and progress
const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      progress, 
      assignedToId, 
      description, 
      actualHours,
      comments,
    } = req.body;

    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: { 
        manufacturingOrder: { select: { orderNumber: true } },
        workCenter: { select: { name: true } },
      },
    });

    if (!existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
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
    if (status) {
      updateData.status = status.toUpperCase();
      
      // Set timestamps based on status
      if (status.toUpperCase() === 'STARTED') {
        updateData.startedAt = new Date();
      } else if (status.toUpperCase() === 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }
    
    if (progress !== undefined) updateData.progress = Math.min(100, Math.max(0, progress));
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (description !== undefined) updateData.description = description;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (comments !== undefined) updateData.comments = comments;

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        manufacturingOrder: {
          select: { 
            id: true, 
            orderNumber: true, 
            product: { select: { name: true } },
          },
        },
        workCenter: {
          select: { id: true, name: true, type: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
      },
    });

    // Update work center status if work order is started/completed
    if (status) {
      if (status.toUpperCase() === 'STARTED') {
        await prisma.workCenter.update({
          where: { id: existingWorkOrder.workCenterId },
          data: { status: 'RUNNING' },
        });
      } else if (['COMPLETED', 'CANCELLED'].includes(status.toUpperCase())) {
        // Check if there are other active work orders on this work center
        const activeWorkOrders = await prisma.workOrder.count({
          where: {
            workCenterId: existingWorkOrder.workCenterId,
            status: { in: ['STARTED', 'PAUSED'] },
            id: { not: id },
          },
        });

        if (activeWorkOrders === 0) {
          await prisma.workCenter.update({
            where: { id: existingWorkOrder.workCenterId },
            data: { status: 'IDLE' },
          });
        }
      }
    }

    // Log activity
    const statusMap = {
      'STARTED': 'started',
      'COMPLETED': 'completed',
      'PAUSED': 'paused',
      'CANCELLED': 'cancelled',
    };

    if (status && statusMap[status.toUpperCase()]) {
      await prisma.userActivity.create({
        data: {
          type: `work_order_${statusMap[status.toUpperCase()]}`,
          description: `${statusMap[status.toUpperCase()].charAt(0).toUpperCase() + statusMap[status.toUpperCase()].slice(1)} work order ${existingWorkOrder.orderNumber}`,
          userId: req.user.id,
          metadata: { 
            workOrderId: id, 
            orderNumber: existingWorkOrder.orderNumber,
            status: status.toUpperCase(),
          },
        },
      });
    }

    res.json({
      message: 'Work order updated successfully',
      workOrder: updatedWorkOrder,
    });
  } catch (error) {
    console.error('Update work order error:', error);
    res.status(500).json({ error: 'Failed to update work order' });
  }
};

// Delete/Cancel work order
const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        manufacturingOrder: { select: { orderNumber: true } },
      },
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Check if work order can be cancelled
    if (workOrder.status === 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Cannot cancel completed work order',
      });
    }

    // Update work order status to cancelled instead of deleting
    const cancelledWorkOrder = await prisma.workOrder.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    // Update work center status if it was in use
    if (workOrder.status === 'STARTED') {
      const activeWorkOrders = await prisma.workOrder.count({
        where: {
          workCenterId: workOrder.workCenterId,
          status: { in: ['STARTED', 'PAUSED'] },
          id: { not: id },
        },
      });

      if (activeWorkOrders === 0) {
        await prisma.workCenter.update({
          where: { id: workOrder.workCenterId },
          data: { status: 'IDLE' },
        });
      }
    }

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'work_order_cancelled',
        description: `Cancelled work order ${workOrder.orderNumber}`,
        userId: req.user.id,
        metadata: { 
          workOrderId: id, 
          orderNumber: workOrder.orderNumber,
        },
      },
    });

    res.json({
      message: 'Work order cancelled successfully',
      workOrder: cancelledWorkOrder,
    });
  } catch (error) {
    console.error('Delete work order error:', error);
    res.status(500).json({ error: 'Failed to cancel work order' });
  }
};

// Get work order statistics
const getWorkOrderStats = async (req, res) => {
  try {
    const stats = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const totalWorkOrders = await prisma.workOrder.count();
    
    // Get efficiency metrics
    const efficiencyData = await prisma.workOrder.findMany({
      where: {
        status: 'COMPLETED',
        AND: [
          { estimatedHours: { not: null } },
          { actualHours: { not: null } },
          { estimatedHours: { gt: 0 } },
          { actualHours: { gt: 0 } }
        ]
      },
      select: {
        estimatedHours: true,
        actualHours: true,
      },
    });

    let avgEfficiency = 100;
    if (efficiencyData.length > 0) {
      const efficiencies = efficiencyData.map(wo => 
        (wo.estimatedHours / wo.actualHours) * 100
      );
      avgEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    }

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    res.json({
      totalWorkOrders,
      statusBreakdown: statusCounts,
      avgEfficiency: Math.round(avgEfficiency),
      completedWorkOrders: statusCounts.COMPLETED || 0,
    });
  } catch (error) {
    console.error('Get work order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch work order statistics' });
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrdersKanban,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats,
};
