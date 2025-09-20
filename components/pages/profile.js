'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/auth-context';
import { apiClient } from '../../lib/api';
import { User, Mail, RefreshCw, Save, Edit } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    let mounted = true;
    
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getProfile();
        if (!mounted) return;
        setProfile(response.data?.user || user);
        setFormData(response.data?.user || user || {});
      } catch (err) {
        console.error('Profile fetch failed', err);
        if (!mounted) return;
        setError(err);
        // Use current user as fallback
        setProfile(user);
        setFormData(user || {});
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    fetchProfile();
    return () => { mounted = false; };
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.updateProfile(formData);
      setProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted/50 rounded w-1/3" />
        <div className="h-64 bg-muted/50 rounded" />
      </div>
    );
  }

  const displayData = profile || user || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              ) : (
                <p className="text-sm">{displayData.firstName || 'Not specified'}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              ) : (
                <p className="text-sm">{displayData.lastName || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              ) : (
                <p className="text-sm">{displayData.email || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginId">Login ID</Label>
              <p className="text-sm">{displayData.loginId || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm font-medium">{displayData.role || 'User'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm font-medium">
                {displayData.createdAt ? new Date(displayData.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <span className="text-sm font-medium">
                {displayData.lastLogin ? new Date(displayData.lastLogin).toLocaleString() : 'Unknown'}
              </span>
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-2">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Orders Created</span>
                  <span className="text-sm">{displayData.stats?.ordersCreated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reports Generated</span>
                  <span className="text-sm">{displayData.stats?.reports || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
