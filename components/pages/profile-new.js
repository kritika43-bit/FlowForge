"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { User, Mail, Phone, MapPin, Calendar, Settings, Bell, Camera, Save, Edit, Award, Clock, RefreshCw, CalendarDays } from "lucide-react"
import { authService } from "../../lib/auth"
import { userService } from "../../lib/services"
import { alerts } from "../../lib/alerts"
import { useApiData } from "../../lib/hooks"

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-muted/50 rounded w-32 mb-2 animate-pulse" />
          <div className="h-4 bg-muted/50 rounded w-64 animate-pulse" />
        </div>
        <div className="h-10 bg-muted/50 rounded w-32 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="h-96 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-48 bg-muted/50 rounded-lg animate-pulse" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-96 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch user data from backend
  const {
    data: profileData,
    isLoading,
    error,
    refresh: refreshProfile
  } = useApiData(() => userService.getCurrentUserProfile())

  // Fetch user activity
  const {
    data: activityData,
    isLoading: activityLoading
  } = useApiData(() => userService.getUserActivity())

  useEffect(() => {
    const user = authService.getCurrentUser()
    setCurrentUser(user)
    
    if (profileData) {
      setFormData(profileData)
    }
  }, [profileData])

  const handleSave = async () => {
    setIsUpdating(true)
    try {
      await userService.updateProfile(formData)
      setIsEditing(false)
      refreshProfile()
      alerts.success("Profile Updated", "Your profile has been updated successfully")
    } catch (error) {
      alerts.error("Update Failed", error.message || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setFormData(profileData || {})
    setIsEditing(false)
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      await userService.uploadAvatar(formData)
      refreshProfile()
      alerts.success("Avatar Updated", "Your avatar has been updated successfully")
    } catch (error) {
      alerts.error("Upload Failed", error.message || "Failed to upload avatar")
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
            <CardDescription>
              Unable to load profile data. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshProfile} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userData = profileData || {}
  const recentActivity = activityData || []
  
  const getInitials = () => {
    const firstName = userData.firstName || currentUser?.firstName || ""
    const lastName = userData.lastName || currentUser?.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getFullName = () => {
    const firstName = userData.firstName || currentUser?.firstName || ""
    const lastName = userData.lastName || currentUser?.lastName || ""
    return `${firstName} ${lastName}`.trim() || "User"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto relative">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-semibold">
                    {getInitials()}
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                )}
              </div>
              <CardTitle className="text-xl">{getFullName()}</CardTitle>
              <CardDescription>{userData.email || currentUser?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={userData.status === 'active' ? 'default' : 'secondary'}>
                  {userData.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">{userData.role || currentUser?.role || 'User'}</Badge>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(userData.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last active {new Date(userData.lastActive || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Orders Created</span>
                <Badge variant="secondary">{userData.stats?.ordersCreated || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Work Orders</span>
                <Badge variant="secondary">{userData.stats?.workOrders || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reports Generated</span>
                <Badge variant="secondary">{userData.stats?.reportsGenerated || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    {isEditing && (
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                          <Save className="h-4 w-4 mr-2" />
                          {isUpdating ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={formData.firstName || ""}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm">{userData.firstName || "Not specified"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={formData.lastName || ""}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm">{userData.lastName || "Not specified"}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm">{userData.email || "Not specified"}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone || ""}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm">{userData.phone || "Not specified"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      {isEditing ? (
                        <Select value={formData.department || ""} onValueChange={(value) => setFormData({...formData, department: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="quality">Quality Control</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="logistics">Logistics</SelectItem>
                            <SelectItem value="administration">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm">{userData.department || "Not specified"}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio || ""}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {userData.bio || "No bio available"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and system events</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted/50 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-muted/50 rounded w-1/2 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={activity.id || index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm">{activity.icon || "📋"}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Certifications</CardTitle>
                  <CardDescription>Your professional skills and certifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {userData.skills?.length > 0 ? (
                        userData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills listed</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Certifications</h4>
                    <div className="space-y-3">
                      {userData.certifications?.length > 0 ? (
                        userData.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{cert.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cert.issuer} • {new Date(cert.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No certifications listed</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch id="email-notifications" defaultChecked={userData.preferences?.notifications?.email} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications</p>
                        </div>
                        <Switch id="push-notifications" defaultChecked={userData.preferences?.notifications?.push} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue={userData.preferences?.language || "en"}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue={userData.preferences?.timezone || "UTC"}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
