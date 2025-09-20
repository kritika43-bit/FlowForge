import { apiClient } from './auth';

/**
 * Manufacturing Orders API Service
 */
export const manufacturingOrdersService = {
  /**
   * Get all manufacturing orders with optional filtering
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/manufacturing-orders${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get a single manufacturing order by ID
   */
  getById: async (id) => {
    return await apiClient.get(`/manufacturing-orders/${id}`);
  },

  /**
   * Create a new manufacturing order
   */
  create: async (orderData) => {
    return await apiClient.post('/manufacturing-orders', orderData);
  },

  /**
   * Update an existing manufacturing order
   */
  update: async (id, orderData) => {
    return await apiClient.put(`/manufacturing-orders/${id}`, orderData);
  },

  /**
   * Delete a manufacturing order
   */
  delete: async (id) => {
    return await apiClient.delete(`/manufacturing-orders/${id}`);
  },

  /**
   * Get manufacturing order statistics
   */
  getStats: async () => {
    return await apiClient.get('/manufacturing-orders/stats');
  },
};

/**
 * Work Orders API Service
 */
export const workOrdersService = {
  /**
   * Get all work orders with optional filtering
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.workCenterId) queryParams.append('workCenterId', params.workCenterId);
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params.manufacturingOrderId) queryParams.append('manufacturingOrderId', params.manufacturingOrderId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/work-orders${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get work orders for Kanban view
   */
  getKanban: async () => {
    return await apiClient.get('/work-orders/kanban');
  },

  /**
   * Get a single work order by ID
   */
  getById: async (id) => {
    return await apiClient.get(`/work-orders/${id}`);
  },

  /**
   * Create a new work order
   */
  create: async (workOrderData) => {
    return await apiClient.post('/work-orders', workOrderData);
  },

  /**
   * Update an existing work order
   */
  update: async (id, workOrderData) => {
    return await apiClient.put(`/work-orders/${id}`, workOrderData);
  },

  /**
   * Delete a work order
   */
  delete: async (id) => {
    return await apiClient.delete(`/work-orders/${id}`);
  },

  /**
   * Get work order statistics
   */
  getStats: async () => {
    return await apiClient.get('/work-orders/stats');
  },
};

/**
 * Work Centers API Service
 */
export const workCentersService = {
  /**
   * Get all work centers with optional filtering
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/work-centers${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get a single work center by ID
   */
  getById: async (id) => {
    return await apiClient.get(`/work-centers/${id}`);
  },

  /**
   * Create a new work center
   */
  create: async (workCenterData) => {
    return await apiClient.post('/work-centers', workCenterData);
  },

  /**
   * Update an existing work center
   */
  update: async (id, workCenterData) => {
    return await apiClient.put(`/work-centers/${id}`, workCenterData);
  },

  /**
   * Delete a work center
   */
  delete: async (id) => {
    return await apiClient.delete(`/work-centers/${id}`);
  },

  /**
   * Get work center statistics
   */
  getStats: async () => {
    return await apiClient.get('/work-centers/stats');
  },
};

/**
 * Stock/Inventory API Service
 */
export const stockService = {
  /**
   * Get all stock items with optional filtering
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.location) queryParams.append('location', params.location);
    if (params.lowStock) queryParams.append('lowStock', params.lowStock.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/stock${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get a single stock item by ID
   */
  getById: async (id) => {
    return await apiClient.get(`/stock/${id}`);
  },

  /**
   * Create a new stock item
   */
  create: async (stockData) => {
    return await apiClient.post('/stock', stockData);
  },

  /**
   * Update an existing stock item
   */
  update: async (id, stockData) => {
    return await apiClient.put(`/stock/${id}`, stockData);
  },

  /**
   * Delete a stock item
   */
  delete: async (id) => {
    return await apiClient.delete(`/stock/${id}`);
  },

  /**
   * Create a stock movement (adjust inventory)
   */
  createMovement: async (movementData) => {
    return await apiClient.post('/stock/movements', movementData);
  },

  /**
   * Get stock movements with filtering
   */
  getMovements: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.stockItemId) queryParams.append('stockItemId', params.stockItemId);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/stock/movements${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get stock statistics
   */
  getStats: async () => {
    return await apiClient.get('/stock/stats');
  },
};

/**
 * Bill of Materials API Service
 */
export const bomService = {
  /**
   * Get all BOMs with optional filtering
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.productId) queryParams.append('productId', params.productId);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/bom${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get a single BOM by ID
   */
  getById: async (id) => {
    return await apiClient.get(`/bom/${id}`);
  },

  /**
   * Create a new BOM
   */
  create: async (bomData) => {
    return await apiClient.post('/bom', bomData);
  },

  /**
   * Update an existing BOM
   */
  update: async (id, bomData) => {
    return await apiClient.put(`/bom/${id}`, bomData);
  },

  /**
   * Delete a BOM
   */
  delete: async (id) => {
    return await apiClient.delete(`/bom/${id}`);
  },

  /**
   * Calculate material requirements for manufacturing order
   */
  calculateRequirements: async (calculationData) => {
    return await apiClient.post('/bom/calculate-requirements', calculationData);
  },

  /**
   * Get BOM statistics
   */
  getStats: async () => {
    return await apiClient.get('/bom/stats');
  },
};

/**
 * Reports API Service
 */
export const reportsService = {
  /**
   * Get dashboard overview data
   */
  getDashboardData: async () => {
    return await apiClient.get('/reports/dashboard');
  },

  /**
   * Get production analytics
   */
  getProductionAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const endpoint = `/reports/production-analytics${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get efficiency metrics
   */
  getEfficiencyMetrics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/reports/efficiency-metrics${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get cost analysis (managers and admins only)
   */
  getCostAnalysis: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/reports/cost-analysis${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get(endpoint);
  },

  /**
   * Get inventory analysis
   */
  getInventoryAnalysis: async () => {
    return await apiClient.get('/reports/inventory-analysis');
  },

  /**
   * Generate custom report
   */
  generateCustomReport: async (reportConfig) => {
    return await apiClient.post('/reports/custom', reportConfig);
  },
};
