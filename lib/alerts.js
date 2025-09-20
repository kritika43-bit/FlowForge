// Enhanced alert/toast system for FlowForge
import { toast } from '../hooks/use-toast';

/**
 * Enhanced alert system with predefined types and consistent styling
 */
export const alerts = {
  /**
   * Success alert for completed operations
   * @param {string} title - Main success message
   * @param {string} description - Optional additional details
   */
  success: (title, description = '') => {
    return toast({
      title: title,
      description: description,
      variant: 'default',
      className: 'border-green-500 bg-green-50 text-green-900 dark:border-green-400 dark:bg-green-950 dark:text-green-100',
      duration: 4000,
    });
  },

  /**
   * Error alert for failed operations
   * @param {string} title - Main error message
   * @param {string} description - Optional error details
   */
  error: (title, description = '') => {
    return toast({
      title: title,
      description: description,
      variant: 'destructive',
      duration: 6000,
    });
  },

  /**
   * Warning alert for important notices
   * @param {string} title - Main warning message
   * @param {string} description - Optional warning details
   */
  warning: (title, description = '') => {
    return toast({
      title: title,
      description: description,
      variant: 'default',
      className: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:border-yellow-400 dark:bg-yellow-950 dark:text-yellow-100',
      duration: 5000,
    });
  },

  /**
   * Info alert for general information
   * @param {string} title - Main info message
   * @param {string} description - Optional info details
   */
  info: (title, description = '') => {
    return toast({
      title: title,
      description: description,
      variant: 'default',
      className: 'border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-100',
      duration: 4000,
    });
  },

  /**
   * Loading alert for ongoing operations
   * @param {string} title - Loading message
   * @param {string} description - Optional loading details
   */
  loading: (title, description = '') => {
    return toast({
      title: title,
      description: description,
      variant: 'default',
      className: 'border-gray-400 bg-gray-50 text-gray-900 dark:border-gray-500 dark:bg-gray-950 dark:text-gray-100',
      duration: 10000, // Longer duration for loading states
    });
  },
};

/**
 * Predefined alerts for common operations
 */
export const commonAlerts = {
  // Manufacturing Orders
  orderCreated: (orderNumber) => alerts.success(
    'Manufacturing Order Created',
    `Order ${orderNumber} has been successfully created and is now in planning status.`
  ),
  orderUpdated: (orderNumber) => alerts.success(
    'Order Updated',
    `Manufacturing order ${orderNumber} has been updated successfully.`
  ),
  orderDeleted: (orderNumber) => alerts.success(
    'Order Deleted',
    `Manufacturing order ${orderNumber} has been removed from the system.`
  ),
  orderStatusChanged: (orderNumber, status) => alerts.info(
    'Order Status Updated',
    `Order ${orderNumber} status changed to ${status}.`
  ),

  // Work Orders
  workOrderCreated: (workOrderNumber) => alerts.success(
    'Work Order Created',
    `Work order ${workOrderNumber} has been created and assigned.`
  ),
  workOrderCompleted: (workOrderNumber) => alerts.success(
    'Work Order Completed',
    `Work order ${workOrderNumber} has been marked as completed.`
  ),
  workOrderAssigned: (workOrderNumber, assignee) => alerts.info(
    'Work Order Assigned',
    `Work order ${workOrderNumber} has been assigned to ${assignee}.`
  ),

  // Inventory/Stock
  stockUpdated: (itemName, quantity) => alerts.success(
    'Stock Updated',
    `${itemName} quantity updated to ${quantity} units.`
  ),
  lowStockWarning: (itemName, currentStock, minStock) => alerts.warning(
    'Low Stock Alert',
    `${itemName} is running low (${currentStock}/${minStock} minimum). Consider reordering.`
  ),
  stockMovementCreated: (type, itemName, quantity) => alerts.info(
    'Stock Movement Recorded',
    `${type}: ${quantity} units of ${itemName} have been recorded.`
  ),

  // User Management
  profileUpdated: () => alerts.success(
    'Profile Updated',
    'Your profile information has been updated successfully.'
  ),
  passwordChanged: () => alerts.success(
    'Password Changed',
    'Your password has been updated successfully.'
  ),

  // BOM Management
  bomCreated: (productName) => alerts.success(
    'BOM Created',
    `Bill of Materials for ${productName} has been created successfully.`
  ),
  bomUpdated: (productName) => alerts.success(
    'BOM Updated',
    `Bill of Materials for ${productName} has been updated.`
  ),

  // Work Centers
  workCenterCreated: (name) => alerts.success(
    'Work Center Created',
    `Work center "${name}" has been added to the system.`
  ),
  workCenterStatusChanged: (name, status) => alerts.info(
    'Work Center Status Changed',
    `Work center "${name}" status changed to ${status}.`
  ),

  // Generic Operations
  dataLoaded: () => alerts.info(
    'Data Refreshed',
    'Latest data has been loaded successfully.'
  ),
  exportCompleted: (type) => alerts.success(
    'Export Completed',
    `${type} report has been exported successfully.`
  ),
  importCompleted: (count, type) => alerts.success(
    'Import Completed',
    `Successfully imported ${count} ${type} records.`
  ),

  // Error Messages
  loadingError: (resource) => alerts.error(
    'Loading Failed',
    `Failed to load ${resource}. Please try again or contact support.`
  ),
  saveError: () => alerts.error(
    'Save Failed',
    'Unable to save changes. Please check your connection and try again.'
  ),
  deleteError: () => alerts.error(
    'Delete Failed',
    'Unable to delete the item. Please try again or contact support.'
  ),
  networkError: () => alerts.error(
    'Network Error',
    'Unable to connect to the server. Please check your internet connection.'
  ),
  unauthorizedError: () => alerts.error(
    'Access Denied',
    'You do not have permission to perform this action.'
  ),
  validationError: (message) => alerts.error(
    'Validation Error',
    message || 'Please check your input and try again.'
  ),
};

/**
 * Alert queue for managing multiple alerts
 */
class AlertQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  add(alertFn) {
    this.queue.push(alertFn);
    this.process();
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const alertFn = this.queue.shift();
      alertFn();
      // Small delay between alerts to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    this.isProcessing = false;
  }
}

export const alertQueue = new AlertQueue();

/**
 * Batch alert utility for multiple operations
 */
export const batchAlerts = {
  add: (alertFn) => alertQueue.add(alertFn),
  
  multipleSuccess: (items, operation) => {
    const count = items.length;
    alerts.success(
      `${operation} Completed`,
      `Successfully processed ${count} item${count > 1 ? 's' : ''}.`
    );
  },
  
  partialSuccess: (successful, failed, operation) => {
    alerts.warning(
      `${operation} Partially Completed`,
      `${successful} items processed successfully, ${failed} failed.`
    );
  },
};
