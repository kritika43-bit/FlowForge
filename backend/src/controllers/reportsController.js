const prisma = require('../database');

// Get dashboard overview data
const getDashboardData = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get basic counts
    const [
      totalOrders,
      totalWorkOrders,
      totalWorkCenters,
      totalStockItems,
      activeOrders,
      completedOrders,
      pendingWorkOrders,
      lowStockItems,
    ] = await Promise.all([
      prisma.manufacturingOrder.count(),
      prisma.workOrder.count(),
      prisma.workCenter.count(),
      prisma.stockItem.count(),
      prisma.manufacturingOrder.count({ where: { status: { in: ['PENDING', 'STARTED'] } } }),
      prisma.manufacturingOrder.count({ where: { status: 'COMPLETED' } }),
      prisma.workOrder.count({ where: { status: 'PENDING' } }),
      // Get low stock items using subquery approach
      prisma.$queryRaw`SELECT COUNT(*) FROM stock_items WHERE quantity <= reorder_point`,
    ]);

    // Get recent activities
    const recentActivities = await prisma.userActivity.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      overview: {
        totalOrders,
        totalWorkOrders,
        totalWorkCenters,
        totalStockItems,
        activeOrders,
        completedOrders,
        pendingWorkOrders,
        lowStockItems,
      },
      recentActivities,
      period: periodDays,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Get production analytics
const getProductionAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get completed manufacturing orders in period
    const completedOrders = await prisma.manufacturingOrder.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        product: { select: { name: true, category: true } },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Group by time period
    const timeFormat = groupBy === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';
    const productionByTime = {};
    const productionByCategory = {};

    completedOrders.forEach(order => {
      const timeKey = order.completedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const category = order.product.category;

      if (!productionByTime[timeKey]) {
        productionByTime[timeKey] = { date: timeKey, orders: 0, quantity: 0 };
      }
      if (!productionByCategory[category]) {
        productionByCategory[category] = { category, orders: 0, quantity: 0 };
      }

      productionByTime[timeKey].orders += 1;
      productionByTime[timeKey].quantity += order.quantity;
      productionByCategory[category].orders += 1;
      productionByCategory[category].quantity += order.quantity;
    });

    // Get work order completion rates
    const workOrderStats = await prisma.workOrder.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        status: true,
      },
    });

    const workOrderStatusCounts = workOrderStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    res.json({
      period: { start, end },
      productionOverTime: Object.values(productionByTime),
      productionByCategory: Object.values(productionByCategory),
      workOrderStats: workOrderStatusCounts,
      totalCompleted: completedOrders.length,
      totalQuantityProduced: completedOrders.reduce((sum, order) => sum + order.quantity, 0),
    });
  } catch (error) {
    console.error('Get production analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch production analytics' });
  }
};

// Get efficiency metrics
const getEfficiencyMetrics = async (req, res) => {
  try {
    const { startDate, endDate, workCenterId } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const where = {
      status: 'COMPLETED',
      completedAt: {
        gte: start,
        lte: end,
      },
      estimatedHours: { not: null },
      actualHours: { not: null },
    };

    if (workCenterId) {
      where.workCenterId = workCenterId;
    }

    // Get completed work orders with time data
    const completedWorkOrders = await prisma.workOrder.findMany({
      where,
      include: {
        workCenter: { select: { id: true, name: true, type: true } },
        manufacturingOrder: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    // Calculate efficiency metrics
    let totalEfficiency = 0;
    let onTimeCount = 0;
    const efficiencyByWorkCenter = {};
    const efficiencyOverTime = {};

    completedWorkOrders.forEach(wo => {
      const efficiency = (wo.estimatedHours / wo.actualHours) * 100;
      const isOnTime = wo.actualHours <= wo.estimatedHours;
      const workCenterName = wo.workCenter.name;
      const dateKey = wo.completedAt.toISOString().split('T')[0];

      totalEfficiency += efficiency;
      if (isOnTime) onTimeCount += 1;

      // Group by work center
      if (!efficiencyByWorkCenter[workCenterName]) {
        efficiencyByWorkCenter[workCenterName] = {
          workCenter: workCenterName,
          workCenterId: wo.workCenter.id,
          totalEfficiency: 0,
          count: 0,
          onTimeCount: 0,
        };
      }
      efficiencyByWorkCenter[workCenterName].totalEfficiency += efficiency;
      efficiencyByWorkCenter[workCenterName].count += 1;
      if (isOnTime) efficiencyByWorkCenter[workCenterName].onTimeCount += 1;

      // Group by time
      if (!efficiencyOverTime[dateKey]) {
        efficiencyOverTime[dateKey] = {
          date: dateKey,
          totalEfficiency: 0,
          count: 0,
          onTimeCount: 0,
        };
      }
      efficiencyOverTime[dateKey].totalEfficiency += efficiency;
      efficiencyOverTime[dateKey].count += 1;
      if (isOnTime) efficiencyOverTime[dateKey].onTimeCount += 1;
    });

    // Calculate averages
    const workCenterMetrics = Object.values(efficiencyByWorkCenter).map(wc => ({
      ...wc,
      avgEfficiency: wc.count > 0 ? Math.round(wc.totalEfficiency / wc.count) : 0,
      onTimeRate: wc.count > 0 ? Math.round((wc.onTimeCount / wc.count) * 100) : 0,
    }));

    const timeMetrics = Object.values(efficiencyOverTime).map(tm => ({
      ...tm,
      avgEfficiency: tm.count > 0 ? Math.round(tm.totalEfficiency / tm.count) : 0,
      onTimeRate: tm.count > 0 ? Math.round((tm.onTimeCount / tm.count) * 100) : 0,
    }));

    const overallMetrics = {
      avgEfficiency: completedWorkOrders.length > 0 ? 
        Math.round(totalEfficiency / completedWorkOrders.length) : 0,
      onTimeRate: completedWorkOrders.length > 0 ? 
        Math.round((onTimeCount / completedWorkOrders.length) * 100) : 0,
      totalCompletedWorkOrders: completedWorkOrders.length,
    };

    res.json({
      period: { start, end },
      overallMetrics,
      efficiencyByWorkCenter: workCenterMetrics,
      efficiencyOverTime: timeMetrics.sort((a, b) => new Date(a.date) - new Date(b.date)),
    });
  } catch (error) {
    console.error('Get efficiency metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch efficiency metrics' });
  }
};

// Get cost analysis
const getCostAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get completed manufacturing orders with costs
    const completedOrders = await prisma.manufacturingOrder.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        product: { 
          select: { 
            name: true, 
            category: true,
            bomItems: {
              include: {
                component: { select: { unitCost: true } },
              },
            },
          },
        },
      },
    });

    // Calculate costs by time period
    const costsByTime = {};
    const costsByCategory = {};
    let totalEstimatedCost = 0;
    let totalActualCost = 0;

    completedOrders.forEach(order => {
      const timeKey = groupBy === 'month' ? 
        order.completedAt.toISOString().substr(0, 7) : // YYYY-MM
        order.completedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const category = order.product.category;
      const estimatedCost = order.estimatedCost || 0;
      const actualCost = order.actualCost || estimatedCost;

      // Group by time
      if (!costsByTime[timeKey]) {
        costsByTime[timeKey] = {
          period: timeKey,
          estimatedCost: 0,
          actualCost: 0,
          orders: 0,
          variance: 0,
        };
      }
      costsByTime[timeKey].estimatedCost += estimatedCost;
      costsByTime[timeKey].actualCost += actualCost;
      costsByTime[timeKey].orders += 1;

      // Group by category
      if (!costsByCategory[category]) {
        costsByCategory[category] = {
          category,
          estimatedCost: 0,
          actualCost: 0,
          orders: 0,
          variance: 0,
        };
      }
      costsByCategory[category].estimatedCost += estimatedCost;
      costsByCategory[category].actualCost += actualCost;
      costsByCategory[category].orders += 1;

      totalEstimatedCost += estimatedCost;
      totalActualCost += actualCost;
    });

    // Calculate variances
    Object.values(costsByTime).forEach(period => {
      period.variance = period.estimatedCost > 0 ? 
        Math.round(((period.actualCost - period.estimatedCost) / period.estimatedCost) * 100) : 0;
    });

    Object.values(costsByCategory).forEach(category => {
      category.variance = category.estimatedCost > 0 ? 
        Math.round(((category.actualCost - category.estimatedCost) / category.estimatedCost) * 100) : 0;
    });

    const overallVariance = totalEstimatedCost > 0 ? 
      Math.round(((totalActualCost - totalEstimatedCost) / totalEstimatedCost) * 100) : 0;

    res.json({
      period: { start, end },
      summary: {
        totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
        totalActualCost: Math.round(totalActualCost * 100) / 100,
        overallVariance,
        totalOrders: completedOrders.length,
      },
      costsByTime: Object.values(costsByTime).sort((a, b) => a.period.localeCompare(b.period)),
      costsByCategory: Object.values(costsByCategory),
    });
  } catch (error) {
    console.error('Get cost analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch cost analysis' });
  }
};

// Get inventory analysis
const getInventoryAnalysis = async (req, res) => {
  try {
    // Get stock levels and movements
    const [stockItems, recentMovements] = await Promise.all([
      prisma.stockItem.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          quantity: true,
          unitCost: true,
          reorderPoint: true,
          location: true,
        },
      }),
      prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        include: {
          stockItem: { select: { name: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Analyze stock levels
    const stockAnalysis = {
      totalItems: stockItems.length,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalValue: 0,
      categoryBreakdown: {},
    };

    stockItems.forEach(item => {
      const itemValue = item.quantity * item.unitCost;
      stockAnalysis.totalValue += itemValue;

      if (item.quantity === 0) {
        stockAnalysis.outOfStockItems += 1;
      } else if (item.quantity <= item.reorderPoint) {
        stockAnalysis.lowStockItems += 1;
      }

      if (!stockAnalysis.categoryBreakdown[item.category]) {
        stockAnalysis.categoryBreakdown[item.category] = {
          category: item.category,
          items: 0,
          totalValue: 0,
          lowStock: 0,
          outOfStock: 0,
        };
      }

      const categoryData = stockAnalysis.categoryBreakdown[item.category];
      categoryData.items += 1;
      categoryData.totalValue += itemValue;
      if (item.quantity === 0) categoryData.outOfStock += 1;
      else if (item.quantity <= item.reorderPoint) categoryData.lowStock += 1;
    });

    // Analyze movement trends
    const movementsByType = { IN: 0, OUT: 0, ADJUSTMENT: 0 };
    const movementsByCategory = {};

    recentMovements.forEach(movement => {
      movementsByType[movement.type] += Math.abs(movement.quantity);

      const category = movement.stockItem.category;
      if (!movementsByCategory[category]) {
        movementsByCategory[category] = { IN: 0, OUT: 0, ADJUSTMENT: 0 };
      }
      movementsByCategory[category][movement.type] += Math.abs(movement.quantity);
    });

    res.json({
      stockAnalysis: {
        ...stockAnalysis,
        totalValue: Math.round(stockAnalysis.totalValue * 100) / 100,
        categoryBreakdown: Object.values(stockAnalysis.categoryBreakdown),
      },
      movementAnalysis: {
        totalMovements: recentMovements.length,
        movementsByType,
        movementsByCategory,
      },
      topMovements: recentMovements.slice(0, 10),
    });
  } catch (error) {
    console.error('Get inventory analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory analysis' });
  }
};

// Get custom report data
const getCustomReport = async (req, res) => {
  try {
    const { 
      reportType, 
      startDate, 
      endDate, 
      filters = {} 
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let reportData = {};

    switch (reportType) {
      case 'production_summary':
        reportData = await getProductionSummaryReport(start, end, filters);
        break;
      case 'work_center_utilization':
        reportData = await getWorkCenterUtilizationReport(start, end, filters);
        break;
      case 'cost_variance':
        reportData = await getCostVarianceReport(start, end, filters);
        break;
      case 'quality_metrics':
        reportData = await getQualityMetricsReport(start, end, filters);
        break;
      default:
        return res.status(400).json({ error: 'Unknown report type' });
    }

    res.json({
      reportType,
      period: { start, end },
      filters,
      data: reportData,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Get custom report error:', error);
    res.status(500).json({ error: 'Failed to generate custom report' });
  }
};

// Helper functions for custom reports
const getProductionSummaryReport = async (start, end, filters) => {
  // Implementation for production summary report
  const orders = await prisma.manufacturingOrder.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      ...(filters.status && { status: filters.status }),
      ...(filters.productId && { productId: filters.productId }),
    },
    include: {
      product: { select: { name: true, category: true } },
      workOrders: { select: { status: true } },
    },
  });

  return {
    totalOrders: orders.length,
    ordersByStatus: orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}),
    ordersByProduct: orders.reduce((acc, order) => {
      const productName = order.product.name;
      if (!acc[productName]) {
        acc[productName] = { orders: 0, quantity: 0 };
      }
      acc[productName].orders += 1;
      acc[productName].quantity += order.quantity;
      return acc;
    }, {}),
  };
};

const getWorkCenterUtilizationReport = async (start, end, filters) => {
  // Implementation for work center utilization report
  const workOrders = await prisma.workOrder.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      ...(filters.workCenterId && { workCenterId: filters.workCenterId }),
    },
    include: {
      workCenter: { select: { name: true, capacity: true } },
    },
  });

  return {
    utilizationByWorkCenter: workOrders.reduce((acc, wo) => {
      const wcName = wo.workCenter.name;
      if (!acc[wcName]) {
        acc[wcName] = { 
          workCenter: wcName,
          totalWorkOrders: 0,
          completedWorkOrders: 0,
          totalDuration: 0,
          capacity: wo.workCenter.capacity,
        };
      }
      acc[wcName].totalWorkOrders += 1;
      if (wo.status === 'COMPLETED') {
        acc[wcName].completedWorkOrders += 1;
        acc[wcName].totalDuration += wo.actualHours || 0;
      }
      return acc;
    }, {}),
  };
};

const getCostVarianceReport = async (start, end, filters) => {
  // Implementation for cost variance report
  const orders = await prisma.manufacturingOrder.findMany({
    where: {
      completedAt: { gte: start, lte: end },
      status: 'COMPLETED',
    },
    select: {
      id: true,
      orderNumber: true,
      estimatedCost: true,
      actualCost: true,
      product: { select: { name: true } },
    },
  });

  return {
    costVariances: orders.map(order => ({
      ...order,
      variance: order.estimatedCost > 0 ? 
        ((order.actualCost - order.estimatedCost) / order.estimatedCost) * 100 : 0,
    })),
  };
};

const getQualityMetricsReport = async (start, end, filters) => {
  // Implementation for quality metrics report
  const workOrders = await prisma.workOrder.findMany({
    where: {
      completedAt: { gte: start, lte: end },
      status: 'COMPLETED',
    },
    select: {
      id: true,
      qualityNotes: true,
      workCenter: { select: { name: true } },
      manufacturingOrder: {
        select: { product: { select: { name: true } } },
      },
    },
  });

  return {
    qualityData: workOrders.filter(wo => wo.qualityNotes),
    totalCompleted: workOrders.length,
    qualityIssuesCount: workOrders.filter(wo => 
      wo.qualityNotes && wo.qualityNotes.toLowerCase().includes('issue')
    ).length,
  };
};

module.exports = {
  getDashboardData,
  getProductionAnalytics,
  getEfficiencyMetrics,
  getCostAnalysis,
  getInventoryAnalysis,
  getCustomReport,
};
