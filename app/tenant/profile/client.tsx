"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Facebook, Instagram, Linkedin, LogOut, Mail, Phone, Twitter, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export function ProfileClient() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  })

  const { user, logout, updateUser } = useAuth()
  const { toast } = useToast()

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(" ")
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSaveChanges = () => {
    if (!user) return

    const updatedUser = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    }

    updateUser(updatedUser)
    setIsEditing(false)

    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Profile</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=128&width=128"} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change profile picture</span>
                </Button>
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} since{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button variant="outline" className="w-full rounded-full" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4 rounded-full">
              <TabsTrigger
                value="account"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Account
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Payment
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Social Media</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">Connect Facebook</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
                        <Twitter className="h-5 w-5 text-blue-400" />
                        <span className="text-sm">Connect Twitter</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <span className="text-sm">Connect Instagram</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
                        <Linkedin className="h-5 w-5 text-blue-700" />
                        <span className="text-sm">Connect LinkedIn</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" className="rounded-full" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className="rounded-full bg-teal-600 hover:bg-teal-700" onClick={handleSaveChanges}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button className="rounded-full bg-teal-600 hover:bg-teal-700" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Your payment methods will appear here. Add a payment method to make rent payments easier.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="rounded-full bg-teal-600 hover:bg-teal-700">Add Payment Method</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Your notification preferences will appear here. Customize how you want to be notified.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="rounded-full bg-teal-600 hover:bg-teal-700">Update Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Your security settings will appear here. Update your password and enable two-factor authentication.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="rounded-full bg-teal-600 hover:bg-teal-700">Change Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
