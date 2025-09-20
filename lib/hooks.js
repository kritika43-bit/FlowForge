'use client';

import { useState, useEffect, useCallback } from 'react';
import { alerts } from './alerts';

/**
 * Custom hook for API data fetching with loading states and error handling
 */
export function useApiData(apiFunction, dependencies = [], options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const {
    showErrorAlert = true,
    showLoadingAlert = false,
    retryCount = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const fetchData = useCallback(async (retryAttempt = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (showLoadingAlert && retryAttempt === 0) {
        alerts.loading('Loading data', 'Please wait while we fetch the latest information...');
      }
      
      const result = await apiFunction();
      setData(result);
      setLastFetch(new Date());
      
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (err) {
      console.error('API fetch error:', err);
      setError(err);
      
      if (retryAttempt < retryCount) {
        setTimeout(() => {
          fetchData(retryAttempt + 1);
        }, retryDelay);
        return;
      }
      
      if (showErrorAlert) {
        alerts.error(
          'Failed to load data',
          err.message || 'Unable to fetch data. Please try again.'
        );
      }
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, showErrorAlert, showLoadingAlert, retryCount, retryDelay, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    lastFetch,
  };
}

/**
 * Custom hook for paginated data fetching
 */
export function usePaginatedData(apiFunction, initialParams = {}, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const {
    showErrorAlert = true,
    onSuccess,
    onError,
  } = options;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiFunction(params);
      setData(result.data || result.orders || result.items || result);
      setTotalPages(result.totalPages || 0);
      setTotalItems(result.totalCount || result.total || 0);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (err) {
      console.error('Paginated API fetch error:', err);
      setError(err);
      
      if (showErrorAlert) {
        alerts.error(
          'Failed to load data',
          err.message || 'Unable to fetch data. Please try again.'
        );
      }
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, params, showErrorAlert, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const nextPage = useCallback(() => {
    if (params.page < totalPages) {
      updateParams({ page: params.page + 1 });
    }
  }, [params.page, totalPages, updateParams]);

  const prevPage = useCallback(() => {
    if (params.page > 1) {
      updateParams({ page: params.page - 1 });
    }
  }, [params.page, updateParams]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      updateParams({ page });
    }
  }, [totalPages, updateParams]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    params,
    updateParams,
    totalPages,
    totalItems,
    currentPage: params.page,
    nextPage,
    prevPage,
    goToPage,
    refetch,
  };
}

/**
 * Custom hook for CRUD operations with optimistic updates
 */
export function useCrudOperations(service, options = {}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    showSuccessAlerts = true,
    showErrorAlerts = true,
    onSuccess,
    onError,
  } = options;

  const create = useCallback(async (data) => {
    try {
      setIsCreating(true);
      
      const result = await service.create(data);
      
      if (showSuccessAlerts) {
        alerts.success('Created successfully', 'The item has been created successfully.');
      }
      
      if (onSuccess) {
        onSuccess(result, 'create');
      }
      
      return result;
    } catch (err) {
      console.error('Create operation error:', err);
      
      if (showErrorAlerts) {
        alerts.error(
          'Creation failed',
          err.message || 'Failed to create the item. Please try again.'
        );
      }
      
      if (onError) {
        onError(err, 'create');
      }
      
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [service, showSuccessAlerts, showErrorAlerts, onSuccess, onError]);

  const update = useCallback(async (id, data) => {
    try {
      setIsUpdating(true);
      
      const result = await service.update(id, data);
      
      if (showSuccessAlerts) {
        alerts.success('Updated successfully', 'The item has been updated successfully.');
      }
      
      if (onSuccess) {
        onSuccess(result, 'update');
      }
      
      return result;
    } catch (err) {
      console.error('Update operation error:', err);
      
      if (showErrorAlerts) {
        alerts.error(
          'Update failed',
          err.message || 'Failed to update the item. Please try again.'
        );
      }
      
      if (onError) {
        onError(err, 'update');
      }
      
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [service, showSuccessAlerts, showErrorAlerts, onSuccess, onError]);

  const remove = useCallback(async (id) => {
    try {
      setIsDeleting(true);
      
      const result = await service.delete(id);
      
      if (showSuccessAlerts) {
        alerts.success('Deleted successfully', 'The item has been deleted successfully.');
      }
      
      if (onSuccess) {
        onSuccess(result, 'delete');
      }
      
      return result;
    } catch (err) {
      console.error('Delete operation error:', err);
      
      if (showErrorAlerts) {
        alerts.error(
          'Deletion failed',
          err.message || 'Failed to delete the item. Please try again.'
        );
      }
      
      if (onError) {
        onError(err, 'delete');
      }
      
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [service, showSuccessAlerts, showErrorAlerts, onSuccess, onError]);

  return {
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
    isLoading: isCreating || isUpdating || isDeleting,
  };
}

/**
 * Custom hook for real-time data updates
 */
export function useRealTimeData(apiFunction, intervalMs = 30000, dependencies = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      const result = await apiFunction();
      setData(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Real-time data fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, intervalMs);
    
    return () => clearInterval(interval);
  }, [fetchData, intervalMs, ...dependencies]);

  const forceRefresh = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    forceRefresh,
  };
}

/**
 * Custom hook for dashboard data with multiple API calls
 */
export function useDashboardData(filters = {}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import apiClient from auth module
      const { apiClient } = await import('./auth');
      
      // Fetch dashboard data from the new endpoint
      const dashboardResponse = await apiClient.get('/dashboard');
      
      setDashboardData(dashboardResponse);
      
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      setError(err);
      
      // Don't show error alert immediately - let component handle fallback
      console.warn('Using fallback dashboard data due to API error:', err.message);
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, JSON.stringify(filters)]);

  const refresh = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  return {
    data: dashboardData,
    isLoading,
    error,
    refresh,
  };
}
