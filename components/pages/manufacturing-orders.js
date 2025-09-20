'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiClient } from '../../lib/api';
import { Package, Plus, RefreshCw } from 'lucide-react';

export default function ManufacturingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getOrders();
        if (!mounted) return;
        setOrders(response.data?.orders || []);
      } catch (err) {
        console.error('Manufacturing orders fetch failed', err);
        if (!mounted) return;
        setError(err);
        // Fallback empty state
        setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    fetchOrders();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted/50 rounded w-1/3" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manufacturing Orders</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              ⚠️ API connection error. {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Orders List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">{order.itemName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      order.status === 'completed' ? 'default' : 
                      order.status === 'pending' ? 'secondary' : 
                      'outline'
                    }>
                      {order.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Qty: {order.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first manufacturing order to get started.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}