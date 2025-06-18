"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, CreditCard, Facebook, Instagram, Linkedin, LogOut, Mail, Phone, Twitter, User, DollarSign } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { ExtendedUser } from "@/lib/types"

export default function LandlordProfilePage() {
  const { user, updateProfile, logout } = useAuth() as { 
    user: ExtendedUser | null; 
    updateProfile: (userData: Partial<ExtendedUser>) => Promise<boolean>;
    logout: () => void;
  }
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    companyName: "",
    taxId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    const success = await updateProfile({
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    })

    if (success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      setIsEditing(false)
    } else {
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = () => {
    logout()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-20 md:pt-6">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Landlord Profile</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=96&width=96"} alt={user?.name || ""} />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
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
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>Landlord</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-sm">{user?.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Member since {new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button variant="outline" className="w-full rounded-full" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleSignOut}
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
                value="business"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Business
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Payment
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
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
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
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
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
                      <Button className="rounded-full bg-teal-600 hover:bg-teal-700" onClick={handleSave}>
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

            <TabsContent value="business">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Manage your business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / Business Registration Number</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Verification</Label>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Verification Status</p>
                          <p className="text-sm text-gray-500">Your business verification status</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
                      </div>
                      <Button className="w-full rounded-full bg-teal-600 hover:bg-teal-700">
                        Complete Verification
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" className="rounded-full" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className="rounded-full bg-teal-600 hover:bg-teal-700" onClick={handleSave}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button className="rounded-full bg-teal-600 hover:bg-teal-700" onClick={() => setIsEditing(true)}>
                      Edit Business Info
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Manage your payment methods and payout settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payout Methods</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="text-center py-6">
                        <div className="mb-3 rounded-lg bg-gray-50 p-4">
                          <CreditCard className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500 font-medium">No Payment Methods</p>
                          <p className="text-xs text-gray-400 mt-1">Add a payment method to receive payouts</p>
                        </div>
                      </div>
                    </div>
                    <Button className="rounded-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Payout Method
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payout Schedule</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-4">
                        <p className="font-medium">Current Schedule</p>
                        <p className="text-sm text-gray-500">Not configured</p>
                      </div>
                      <Button variant="outline" className="rounded-full">
                        Set Up Schedule
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Transaction History</h3>
                    <div className="text-center py-6">
                      <div className="mb-3 rounded-lg bg-gray-50 p-4">
                        <DollarSign className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No Transactions Yet</p>
                        <p className="text-xs text-gray-400 mt-1">Transaction history will appear here</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" className="h-12 rounded-xl" />
                    </div>
                    <Button className="rounded-full bg-teal-600 hover:bg-teal-700">Update Password</Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Login Sessions</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-500">Started {new Date().toLocaleString()}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        Sign Out All Other Devices
                      </Button>
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
