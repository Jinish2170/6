"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building, ChevronRight, DollarSign, Home, LineChart, Plus, Users, Wrench } from "lucide-react"
import { ExtendedUser } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Property {
    id: string;
    title: string;
    location: string;
    status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
    price: number;
    image: string;
    features: Feature[];
}

interface Feature {
    id: string;
    name: string;
    icon_name: string;
}

interface DashboardData {
  propertyStats: {
    totalProperties: number;
    occupiedProperties: number;
    vacantProperties: number;
    maintenanceProperties: number;
    totalRevenue: number;
  };
  recentProperties: Property[];
  user?: ExtendedUser;
}

export default function LandlordDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    propertyStats: {
      totalProperties: 0,
      occupiedProperties: 0,
      vacantProperties: 0,
      maintenanceProperties: 0,
      totalRevenue: 0
    },
    recentProperties: []
  })
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
// Use a ref to track if data has been fetched
  const dataFetched = useRef(false)

  useEffect(() => {
    // Only fetch once per component mount
    if (dataFetched.current || !user) {
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // Set flag to prevent multiple fetches
        dataFetched.current = true
        
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }

        const response = await fetch('/api/landlord/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
          },
          // Prevent browser caching
          cache: 'no-store',
          next: { revalidate: 0 }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user]) // Only re-run if user changes

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const { propertyStats, recentProperties } = dashboardData

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Landlord Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Stats Overview */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="rounded-[1.5rem] border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-teal-100 p-3">
                  <Building className="h-6 w-6 text-teal-600" />
                </div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <h3 className="text-2xl font-bold">{propertyStats.totalProperties}</h3>
              </CardContent>
            </Card>
            <Card className="rounded-[1.5rem] border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-green-100 p-3">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-500">Occupied</p>
                <h3 className="text-2xl font-bold">{propertyStats.occupiedProperties}</h3>
              </CardContent>
            </Card>
            <Card className="rounded-[1.5rem] border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-yellow-100 p-3">
                  <Home className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-500">Vacant</p>
                <h3 className="text-2xl font-bold">{propertyStats.vacantProperties}</h3>
              </CardContent>
            </Card>
            <Card className="rounded-[1.5rem] border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-blue-100 p-3">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Revenue</p>
                <h3 className="text-2xl font-bold">${propertyStats.totalRevenue}</h3>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-6 rounded-[1.5rem] border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for all properties</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                <LineChart className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 rounded-lg bg-gray-50 p-8">
                      <LineChart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Revenue Analytics</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {propertyStats.totalRevenue > 0 
                          ? `Current monthly revenue: $${propertyStats.totalRevenue.toLocaleString()}`
                          : "Start renting properties to see revenue analytics"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Properties</CardTitle>
                <CardDescription>Manage your rental properties</CardDescription>
              </div>
              <Button className="rounded-full" asChild>
                <Link href="/landlord/properties/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProperties.length > 0 ? (
                  recentProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 shadow-sm md:flex-row md:items-center"
                    >
                      <div className="relative h-24 w-full overflow-hidden rounded-xl md:w-36">
                        <Image
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="font-medium">{property.title}</h3>
                          <Badge
                            className={
                              property.status === "RENTED"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : property.status === "MAINTENANCE"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            }
                          >
                            {property.status === 'RENTED' ? 'Occupied' : 
                             property.status === 'MAINTENANCE' ? 'Maintenance' : 'Available'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{property.location}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="font-bold text-teal-600">${property.price}/mo</p>
                          <Button variant="ghost" size="sm" className="rounded-full" asChild>
                            <Link href={`/landlord/properties/${property.id}`}>
                              View Details
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4 rounded-lg bg-gray-50 p-6">
                      <Building className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No Properties Yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Add your first property to start managing your rental business
                      </p>
                    </div>
                    <Button className="rounded-full" asChild>
                      <Link href="/landlord/properties/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Property
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="link" className="text-teal-600" asChild>
                <Link href="/landlord/properties">
                  View All Properties <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Profile Summary */}
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name || 'User'} />
                <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user?.name || 'Loading...'}</CardTitle>
                <CardDescription>Landlord</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium">{user?.email || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="text-sm font-medium">Landlord</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <Link href="/landlord/profile">Edit Profile</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Property Maintenance */}
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProperties.filter(p => p.status === 'MAINTENANCE').length > 0 ? (
                  recentProperties.filter(p => p.status === 'MAINTENANCE').map((property) => (
                    <div key={property.id} className="flex gap-3">
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <Wrench className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{property.title}</p>
                        <p className="text-sm text-gray-500">{property.location}</p>
                        <Button variant="ghost" size="sm" className="mt-2 rounded-full" asChild>
                          <Link href={`/landlord/properties/${property.id}`}>
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="mb-3 rounded-lg bg-green-50 p-4">
                      <Wrench className="mx-auto h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm text-green-600 font-medium">All properties in good condition</p>
                      <p className="text-xs text-green-500 mt-1">No maintenance requests at this time</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full text-teal-600">
                View All Activities
              </Button>
            </CardFooter>
          </Card>

          
        </div>
      </div>
    </div>
  )
}
