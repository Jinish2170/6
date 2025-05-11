"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bath, Bed, Building, Edit, Filter, MapPin, MoreHorizontal, Plus, Search, Square, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

type Property = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  images: Array<{ image_url: string; is_featured: boolean }>;
  features: Array<{ name: string }>;
}

export default function LandlordPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/properties?landlordId=${user?.id}${filterStatus !== 'all' ? `&status=${filterStatus}` : ''}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch properties")
        }

        const data = await response.json()
        setProperties(data)
      } catch (error) {
        console.error("Error fetching properties:", error)
        setError("Failed to load properties")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProperties()
    }
  }, [user?.id, filterStatus])

  const deleteProperty = async (propertyId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/properties?id=${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete property")
      }

      setProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (error) {
      console.error("Error deleting property:", error)
    }
  }

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700'
      case 'rented':
        return 'bg-blue-100 text-blue-700'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">My Properties</h1>
        <Button asChild>
          <Link href="/landlord/properties/add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-full border-gray-200 pl-10 pr-4"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-10 w-[180px] rounded-full border-gray-200">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="RENTED">Rented</SelectItem>
              <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden rounded-[1.5rem] border-0 shadow-md">
            <div className="relative">
              <Image
                src={property.images.find(img => img.is_featured)?.image_url || "/placeholder.svg"}
                alt={property.title}
                width={400}
                height={300}
                className="aspect-video w-full object-cover"
              />
              <Badge
                className={`absolute right-2 top-2 ${getStatusColor(property.status)}`}
                variant="secondary"
              >
                {property.status}
              </Badge>
            </div>

            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <p className="flex items-center text-sm text-gray-500">
                    <MapPin className="mr-1 h-4 w-4" />
                    {property.location}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/landlord/properties/${property.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                      onClick={() => deleteProperty(property.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-4">
                <p className="text-lg font-bold text-teal-600">${property.price}/month</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {property.bedrooms} Beds
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {property.bathrooms} Baths
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  {property.area} sqft
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Building className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold">No properties found</h2>
          <p className="mb-4 text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start adding properties to see them here"}
          </p>
          <Button asChild>
            <Link href="/landlord/properties/add">Add Your First Property</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
