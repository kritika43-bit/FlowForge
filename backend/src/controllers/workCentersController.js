const prisma = require('../database');

// Get all work centers with filtering
const getWorkCenters = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10, search } = req.query;

    const where = {};
    
    if (type) {
      where.type = type.toUpperCase();
    }
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [workCenters, total] = await Promise.all([
      prisma.workCenter.findMany({
        where,
        include: {
          workOrders: {
            where: {
              status: { in: ['PENDING', 'STARTED', 'PAUSED'] },
            },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              progress: true,
              manufacturingOrder: {
                select: { orderNumber: true, product: { select: { name: true } } },
              },
            },
          },
          _count: {
            select: { workOrders: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.workCenter.count({ where }),
    ]);

    // Calculate utilization and current workload
    const workCentersWithMetrics = workCenters.map(workCenter => {
      const activeWorkOrders = workCenter.workOrders.length;
      const utilization = workCenter.capacity > 0 ? 
        Math.min(100, (activeWorkOrders / workCenter.capacity) * 100) : 0;

      return {
        ...workCenter,
        utilization: Math.round(utilization),
        activeWorkOrders,
      };
    });

    res.json({
      workCenters: workCentersWithMetrics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get work centers error:', error);
    res.status(500).json({ error: 'Failed to fetch work centers' });
  }
};

// Get single work center by ID
const getWorkCenterById = async (req, res) => {
  try {
    const { id } = req.params;

    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
      include: {
        workOrders: {
          include: {
            manufacturingOrder: {
              select: { 
                id: true, 
                orderNumber: true, 
                priority: true,
                product: { select: { name: true } },
              },
            },
            assignedTo: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!workCenter) {
      return res.status(404).json({ error: 'Work center not found' });
    }

    // Calculate metrics
    const activeWorkOrders = workCenter.workOrders.filter(wo => 
      ['PENDING', 'STARTED', 'PAUSED'].includes(wo.status)
    ).length;

    const completedToday = workCenter.workOrders.filter(wo => 
      wo.status === 'COMPLETED' && 
      wo.completedAt && 
      wo.completedAt >= new Date(new Date().setHours(0, 0, 0, 0))
    ).length;

    const utilization = workCenter.capacity > 0 ? 
      Math.min(100, (activeWorkOrders / workCenter.capacity) * 100) : 0;

    res.json({
      ...workCenter,
      metrics: {
        activeWorkOrders,
        completedToday,
        utilization: Math.round(utilization),
        totalWorkOrders: workCenter.workOrders.length,
      },
    });
  } catch (error) {
    console.error('Get work center by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch work center' });
  }
};

// Create new work center
const createWorkCenter = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      location,
      capacity = 1,
      hourlyRate = 0,
    } = req.body;

    // Check if work center name already exists
    const existingWorkCenter = await prisma.workCenter.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingWorkCenter) {
      return res.status(400).json({ 
        error: 'Work center name already exists',
        details: 'Please choose a different name',
      });
    }

    const workCenter = await prisma.workCenter.create({
      data: {
        name,
        type: type.toUpperCase(),
        description,
        location,
        capacity,
        hourlyRate,
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'work_center_created',
        description: `Created work center ${name}`,
        userId: req.user.id,
        metadata: { workCenterId: workCenter.id, name },
      },
    });

    res.status(201).json({
      message: 'Work center created successfully',
      workCenter,
    });
  } catch (error) {
    console.error('Create work center error:', error);
    res.status(500).json({ error: 'Failed to create work center' });
  }
};

// Update work center
const updateWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      description,
      location,
      capacity,
      hourlyRate,
      status,
    } = req.body;

    // Check if work center exists
    const existingWorkCenter = await prisma.workCenter.findUnique({
      where: { id },
    });

    if (!existingWorkCenter) {
      return res.status(404).json({ error: 'Work center not found' });
    }

    // Check if new name conflicts with existing work center (if name is being changed)
    if (name && name !== existingWorkCenter.name) {
      const nameConflict = await prisma.workCenter.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (nameConflict) {
        return res.status(400).json({ 
          error: 'Work center name already exists',
          details: 'Please choose a different name',
        });
      }
    }

    // Check if status change is valid
    if (status && status !== existingWorkCenter.status) {
      if (status.toUpperCase() === 'MAINTENANCE' || status.toUpperCase() === 'UNAVAILABLE') {
        // Check if there are active work orders
        const activeWorkOrders = await prisma.workOrder.count({
          where: {
            workCenterId: id,
            status: { in: ['STARTED', 'PAUSED'] },
          },
        });

        if (activeWorkOrders > 0) {
          return res.status(400).json({
            error: `Cannot set work center to ${status} while work orders are active`,
            details: 'Please complete or reassign active work orders first',
          });
        }
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (status !== undefined) updateData.status = status.toUpperCase();

    const updatedWorkCenter = await prisma.workCenter.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'work_center_updated',
        description: `Updated work center ${updatedWorkCenter.name}`,
        userId: req.user.id,
        metadata: { 
          workCenterId: id, 
          name: updatedWorkCenter.name,
          changes: Object.keys(updateData),
        },
      },
    });

    res.json({
      message: 'Work center updated successfully',
      workCenter: updatedWorkCenter,
    });
  } catch (error) {
    console.error('Update work center error:', error);
    res.status(500).json({ error: 'Failed to update work center' });
  }
};

// Delete work center
const deleteWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;

    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
      include: {
        workOrders: {
          where: {
            status: { in: ['PENDING', 'STARTED', 'PAUSED'] },
          },
          select: { id: true, orderNumber: true, status: true },
        },
      },
    });

    if (!workCenter) {
      return res.status(404).json({ error: 'Work center not found' });
    }

    // Check if work center has active work orders
    if (workCenter.workOrders.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete work center with active work orders',
        details: 'Please complete or reassign all work orders first',
        activeWorkOrders: workCenter.workOrders,
      });
    }

    await prisma.workCenter.delete({
      where: { id },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'work_center_deleted',
        description: `Deleted work center ${workCenter.name}`,
        userId: req.user.id,
        metadata: { workCenterId: id, name: workCenter.name },
      },
    });

    res.json({
      message: 'Work center deleted successfully',
    });
  } catch (error) {
    console.error('Delete work center error:', error);
    res.status(500).json({ error: 'Failed to delete work center' });
  }
};

// Get work center statistics
const getWorkCenterStats = async (req, res) => {
  try {
    const totalWorkCenters = await prisma.workCenter.count();
    
    const statusStats = await prisma.workCenter.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const typeStats = await prisma.workCenter.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    });

    // Calculate overall utilization
    const workCenters = await prisma.workCenter.findMany({
      include: {
        _count: {
          select: {
            workOrders: {
              where: {
                status: { in: ['STARTED', 'PAUSED'] },
              },
            },
          },
        },
      },
    });

    let totalCapacity = 0;
    let totalActiveWorkOrders = 0;

    workCenters.forEach(wc => {
      totalCapacity += wc.capacity;
      totalActiveWorkOrders += wc._count.workOrders;
    });

    const overallUtilization = totalCapacity > 0 ? 
      Math.min(100, (totalActiveWorkOrders / totalCapacity) * 100) : 0;

    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    const typeCounts = typeStats.reduce((acc, stat) => {
      acc[stat.type] = stat._count.type;
      return acc;
    }, {});

    res.json({
      totalWorkCenters,
      statusBreakdown: statusCounts,
      typeBreakdown: typeCounts,
      overallUtilization: Math.round(overallUtilization),
      availableWorkCenters: statusCounts.AVAILABLE || 0,
    });
  } catch (error) {
    console.error('Get work center stats error:', error);
    res.status(500).json({ error: 'Failed to fetch work center statistics' });
  }
};

module.exports = {
  getWorkCenters,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  getWorkCenterStats,
};
