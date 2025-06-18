"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bath, 
  Bed, 
  Building2, 
  ChevronLeft, 
  Edit, 
  MapPin, 
  MoreHorizontal, 
  Square, 
  Trash2 
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  is_featured: boolean
}

interface PropertyFeature {
  id: string
  name: string
  icon_name?: string
}

interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  status: string
  landlord_id: string
  created_at: string
  images: PropertyImage[]
  features: PropertyFeature[]
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        const response = await fetch(`/api/properties?id=${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Property not found",
              description: "The property you're looking for doesn't exist or has been removed",
              variant: "destructive"
            })
            router.push("/landlord/properties")
            return
          }
          throw new Error("Failed to fetch property details")
        }

        const data = await response.json()
        setProperty(data)
      } catch (error) {
        console.error("Error fetching property:", error)
        toast({
          title: "Error",
          description: "Failed to load property details",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropertyDetails()
  }, [params.id, router, toast])

  const handleDelete = async () => {
    if (!property) return

    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/properties?id=${property.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete property")
      }

      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
      router.push("/landlord/properties")
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Property Not Found</h1>
          <p className="mb-6 text-gray-500">The property you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/landlord/properties">Go Back to Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "RENTED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href="/landlord/properties"
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{property.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">{property.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(property.status)}>
            {property.status === "AVAILABLE"
              ? "Available"
              : property.status === "RENTED"
              ? "Rented"
              : "Maintenance"}
          </Badge>
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
                  Edit Property
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Property"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden rounded-[1.5rem] border-0 shadow-md">
            <div className="relative aspect-[16/9] w-full">
              {property.images.length > 0 ? (
                <Image
                  src={property.images[activeImageIndex]?.image_url || "/placeholder.svg"}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt="No image available"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            {property.images.length > 0 && (
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {property.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-16 w-16 overflow-hidden rounded-md border ${
                        activeImageIndex === index ? "border-teal-500" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image.image_url}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features & Amenities</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="mb-6 grid grid-cols-3 gap-6">
                    <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-sm">
                      <Bed className="mb-1 h-6 w-6 text-teal-500" />
                      <span className="text-sm text-gray-500">Bedrooms</span>
                      <span className="text-lg font-semibold">{property.bedrooms}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-sm">
                      <Bath className="mb-1 h-6 w-6 text-teal-500" />
                      <span className="text-sm text-gray-500">Bathrooms</span>
                      <span className="text-lg font-semibold">{property.bathrooms}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-sm">
                      <Square className="mb-1 h-6 w-6 text-teal-500" />
                      <span className="text-sm text-gray-500">Area</span>
                      <span className="text-lg font-semibold">{property.area} sqft</span>
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-medium">Description</h3>
                  <p className="whitespace-pre-line text-gray-600">{property.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="features">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {property.features.length > 0 ? (
                      property.features.map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-center gap-2 rounded-xl border border-gray-100 p-3 shadow-sm"
                        >
                          <Building2 className="h-5 w-5 text-teal-500" />
                          <span>{feature.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-3 py-6 text-center text-gray-500">
                        No features or amenities listed for this property.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-6 rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <h2 className="text-xl font-bold text-teal-600">${property.price}/month</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium">Residential</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Listed On</span>
                  <span className="font-medium">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full rounded-full bg-teal-600 hover:bg-teal-700">
                  <Link href={`/landlord/properties/${property.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Property"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
