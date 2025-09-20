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
import { User, Mail, Phone, MapPin, Calendar, Settings, Bell, Camera, Save, Edit, Award, Clock, RefreshCw } from "lucide-react"
import { authService } from "../../lib/auth"
import { userService } from "../../lib/services"
import { alerts } from "../../lib/alerts"
import { useApiData } from "../../lib/hooks"

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="h-80 bg-muted/50 rounded-lg animate-pulse" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-80 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Mock user data
const userData = {
  id: "USR-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@flowforge.com",
  phone: "+1 (555) 123-4567",
  position: "Production Manager",
  department: "Manufacturing",
  location: "Factory Floor A",
  joinDate: "2022-03-15",
  avatar: "/placeholder-user.png",
  bio: "Experienced production manager with 8+ years in manufacturing operations. Specialized in lean manufacturing and process optimization.",
  skills: ["Lean Manufacturing", "Process Optimization", "Team Leadership", "Quality Control", "Safety Management"],
  certifications: [
    { name: "Lean Six Sigma Black Belt", issuer: "ASQ", date: "2023-06-15" },
    { name: "Manufacturing Leadership", issuer: "SME", date: "2022-11-20" },
    { name: "Safety Management", issuer: "OSHA", date: "2023-01-10" },
  ],
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    theme: "system",
    language: "en",
    timezone: "America/New_York",
  },
  stats: {
    ordersManaged: 247,
    efficiency: 94,
    onTimeDelivery: 96,
    teamSize: 12,
  },
}

// Mock activity data
const recentActivity = [
  {
    id: "ACT-001",
    type: "order_completed",
    description: "Completed manufacturing order MO-2024-001",
    timestamp: "2024-01-15 14:30",
    icon: "✅",
  },
  {
    id: "ACT-002",
    type: "work_order_assigned",
    description: "Assigned work order WO-012 to Quality Control",
    timestamp: "2024-01-15 11:20",
    icon: "📋",
  },
  {
    id: "ACT-003",
    type: "team_meeting",
    description: "Conducted daily standup with production team",
    timestamp: "2024-01-15 09:00",
    icon: "👥",
  },
  {
    id: "ACT-004",
    type: "process_improvement",
    description: "Implemented new efficiency protocol in Welding Bay 1",
    timestamp: "2024-01-14 16:45",
    icon: "⚡",
  },
  {
    id: "ACT-005",
    type: "safety_inspection",
    description: "Completed monthly safety inspection",
    timestamp: "2024-01-14 13:15",
    icon: "🛡️",
  },
]

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePreferenceChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [field]: value,
        },
      },
    }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {formData.firstName[0]}
                    {formData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                Upload Photo
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <p className="text-lg text-muted-foreground">{formData.position}</p>
                  <p className="text-sm text-muted-foreground">{formData.department}</p>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "default" : "outline"}>
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formData.joinDate}</span>
                </div>
              </div>

              <p className="text-muted-foreground">{formData.bio}</p>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="font-medium">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{userData.stats.ordersManaged}</div>
            <div className="text-sm text-muted-foreground">Orders Managed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-flowforge-green">{userData.stats.efficiency}%</div>
            <div className="text-sm text-muted-foreground">Efficiency Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-flowforge-blue">{userData.stats.onTimeDelivery}%</div>
            <div className="text-sm text-muted-foreground">On-Time Delivery</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{userData.stats.teamSize}</div>
            <div className="text-sm text-muted-foreground">Team Members</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Achievements
              </CardTitle>
              <CardDescription>Your professional certifications and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                      <p className="text-xs text-muted-foreground">Date: {cert.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Verified</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent actions and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account preferences and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Settings */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={formData.preferences.notifications.email}
                      onCheckedChange={(checked) => handlePreferenceChange("notifications", "email", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={formData.preferences.notifications.push}
                      onCheckedChange={(checked) => handlePreferenceChange("notifications", "push", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive SMS alerts</p>
                    </div>
                    <Switch
                      checked={formData.preferences.notifications.sms}
                      onCheckedChange={(checked) => handlePreferenceChange("notifications", "sms", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Appearance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={formData.preferences.theme}
                      onValueChange={(value) => handlePreferenceChange("", "theme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.preferences.language}
                      onValueChange={(value) => handlePreferenceChange("", "language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
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
  )
}
