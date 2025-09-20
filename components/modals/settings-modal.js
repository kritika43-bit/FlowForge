'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  User,
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  Globe,
  Palette,
  Save,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Briefcase,
} from 'lucide-react';
import { useTheme } from '../theme-provider';
import { authService } from '../../lib/auth';
import { alerts } from '../../lib/alerts';

export function SettingsModal({ isOpen, onClose }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    location: '',
    bio: '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      orderUpdates: true,
      stockAlerts: true,
      systemMaintenance: false,
    },
    preferences: {
      language: 'en',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      autoRefresh: true,
      compactView: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
      loadUserSettings();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          position: user.position || '',
          department: user.department || '',
          location: user.location || '',
          bio: user.bio || '',
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      alerts.error('Failed to load profile', 'Unable to load your profile information.');
    }
  };

  const loadUserSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('flowforge-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSettingsChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update profile via API
      const updatedUser = await authService.updateProfile(profileData);
      setCurrentUser(updatedUser.user);
      alerts.success('Profile Updated', 'Your profile has been updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alerts.error('Update Failed', error.message || 'Failed to update your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('flowforge-settings', JSON.stringify(settings));
      alerts.success('Settings Saved', 'Your preferences have been saved successfully.');
    } catch (error) {
      alerts.error('Save Failed', 'Failed to save your settings.');
    }
  };

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const { firstName, lastName } = currentUser;
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getUserName = () => {
    if (!currentUser) return 'User';
    return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-user.png" alt="Profile" />
                      <AvatarFallback className="bg-teal-600 text-white text-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{getUserName()}</h3>
                      {currentUser?.role && (
                        <Badge variant="secondary">{currentUser.role}</Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Form */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Position
                      </Label>
                      <Input
                        id="position"
                        value={profileData.position}
                        onChange={(e) => handleProfileChange('position', e.target.value)}
                        placeholder="Enter your job title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Department
                      </Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => handleProfileChange('department', e.target.value)}
                        placeholder="Enter your department"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      placeholder="Enter your location"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme Settings
                  </CardTitle>
                  <CardDescription>
                    Customize the appearance of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {themeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <Button
                            key={option.value}
                            variant={theme === option.value ? 'default' : 'outline'}
                            className="h-24 flex-col gap-2"
                            onClick={() => setTheme(option.value)}
                          >
                            <Icon className="h-6 w-6" />
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compact View</Label>
                        <p className="text-sm text-muted-foreground">
                          Use smaller spacing and components
                        </p>
                      </div>
                      <Switch
                        checked={settings.preferences.compactView}
                        onCheckedChange={(checked) =>
                          handleSettingsChange('preferences', 'compactView', checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) =>
                          handleSettingsChange('notifications', 'email', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Order Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when order status changes
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.orderUpdates}
                        onCheckedChange={(checked) =>
                          handleSettingsChange('notifications', 'orderUpdates', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive low stock and inventory alerts
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.stockAlerts}
                        onCheckedChange={(checked) =>
                          handleSettingsChange('notifications', 'stockAlerts', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>System Maintenance</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about system updates and maintenance
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.systemMaintenance}
                        onCheckedChange={(checked) =>
                          handleSettingsChange('notifications', 'systemMaintenance', checked)
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Application Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure your application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={settings.preferences.language}
                        onValueChange={(value) =>
                          handleSettingsChange('preferences', 'language', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                          <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={settings.preferences.currency}
                        onValueChange={(value) =>
                          handleSettingsChange('preferences', 'currency', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                          <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select
                        value={settings.preferences.dateFormat}
                        onValueChange={(value) =>
                          handleSettingsChange('preferences', 'dateFormat', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select
                        value={settings.preferences.timeFormat}
                        onValueChange={(value) =>
                          handleSettingsChange('preferences', 'timeFormat', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 Hour</SelectItem>
                          <SelectItem value="12h">12 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Refresh</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically refresh data every 30 seconds
                        </p>
                      </div>
                      <Switch
                        checked={settings.preferences.autoRefresh}
                        onCheckedChange={(checked) =>
                          handleSettingsChange('preferences', 'autoRefresh', checked)
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
