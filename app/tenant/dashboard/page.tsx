"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bath,
  Bed,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Home,
  MapPin,
  Plus,
  Square,
  Wrench,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function TenantDashboardPage() {
  const { user } = useAuth()

  // Sample data
  const currentLease = {
    property: "Modern Apartment with City View",
    address: "123 Main St, Downtown, New York",
    rent: 2500,
    dueDate: "May 1, 2023",
    status: "Paid",
    image: "/placeholder.svg?height=300&width=400",
  }

  const maintenanceRequests = [
    {
      id: 1,
      title: "Leaking Faucet in Bathroom",
      date: "Apr 15, 2023",
      status: "In Progress",
      description: "The bathroom sink faucet is leaking water constantly.",
    },
    {
      id: 2,
      title: "AC Not Cooling",
      date: "Apr 10, 2023",
      status: "Scheduled",
      description: "The air conditioner is running but not cooling the apartment.",
    },
    {
      id: 3,
      title: "Broken Light Fixture",
      date: "Mar 28, 2023",
      status: "Completed",
      description: "The ceiling light fixture in the living room is not working.",
    },
  ]

  const documents = [
    {
      id: 1,
      title: "Lease Agreement",
      date: "Jan 15, 2023",
      type: "PDF",
    },
    {
      id: 2,
      title: "Move-in Inspection Report",
      date: "Jan 16, 2023",
      type: "PDF",
    },
    {
      id: 3,
      title: "Rent Payment Receipt - April",
      date: "Apr 1, 2023",
      type: "PDF",
    },
  ]

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-20 md:pt-6">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Tenant Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Current Lease */}
          <Card className="mb-6 rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <CardTitle>Current Lease</CardTitle>
              <CardDescription>Your active rental property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative h-48 w-full overflow-hidden rounded-xl md:w-1/3">
                  <Image
                    src={currentLease.image || "/placeholder.svg"}
                    alt={currentLease.property}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-bold">{currentLease.property}</h3>
                    <div className="mb-3 flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{currentLease.address}</span>
                    </div>
                    <div className="mb-4 grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-gray-50 p-2 text-center">
                        <p className="text-xs text-gray-500">Bedrooms</p>
                        <div className="flex items-center justify-center">
                          <Bed className="mr-1 h-4 w-4 text-gray-700" />
                          <p className="font-medium">2</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2 text-center">
                        <p className="text-xs text-gray-500">Bathrooms</p>
                        <div className="flex items-center justify-center">
                          <Bath className="mr-1 h-4 w-4 text-gray-700" />
                          <p className="font-medium">2</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2 text-center">
                        <p className="text-xs text-gray-500">Area</p>
                        <div className="flex items-center justify-center">
                          <Square className="mr-1 h-4 w-4 text-gray-700" />
                          <p className="font-medium">1200 ft²</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="text-xl font-bold text-teal-600">${currentLease.rent}/mo</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Payment</p>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-gray-700" />
                        <p className="font-medium">{currentLease.dueDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{currentLease.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" className="rounded-full">
                View Details
              </Button>
            </CardFooter>
          </Card>

          {/* Maintenance Requests */}
          <Card className="mb-6 rounded-[1.5rem] border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Track your maintenance tickets</CardDescription>
              </div>
              <Button className="rounded-full" asChild>
                <Link href="/tenant/dashboard/maintenance/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 shadow-sm md:flex-row md:items-center"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                      <Wrench className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-medium">{request.title}</h3>
                        <Badge
                          className={
                            request.status === "Completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : request.status === "In Progress"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{request.description}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>Submitted on {request.date}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto flex-shrink-0 rounded-full md:ml-0">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="link" className="text-teal-600">
                View All Requests <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Profile Summary */}
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user?.avatar || "/placeholder.svg?height=56&width=56"} alt={user?.name || ""} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user?.name}</CardTitle>
                <CardDescription>Tenant since Jan 2023</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="text-sm font-medium">{user?.phone || "(123) 456-7890"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <Link href="/tenant/profile">Edit Profile</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Documents */}
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Access your important documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.title}</p>
                        <p className="text-xs text-gray-500">{doc.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full text-teal-600">
                View All Documents
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Links */}
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto flex-col items-center justify-center rounded-xl py-4">
                  <Home className="mb-2 h-5 w-5 text-teal-600" />
                  <span className="text-xs">Pay Rent</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center rounded-xl py-4">
                  <Wrench className="mb-2 h-5 w-5 text-teal-600" />
                  <span className="text-xs">Maintenance</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center rounded-xl py-4">
                  <FileText className="mb-2 h-5 w-5 text-teal-600" />
                  <span className="text-xs">Documents</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center rounded-xl py-4">
                  <Calendar className="mb-2 h-5 w-5 text-teal-600" />
                  <span className="text-xs">Schedule</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
