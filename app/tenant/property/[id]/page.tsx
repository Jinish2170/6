"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Bath,
  Bed,
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Info,
  MapPin,
  MessageSquare,
  Share,
  Square,
  Wifi,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback, use } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { PropertyWithDetails } from "@/lib/types"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"

// Define fallback image
const PLACEHOLDER_IMAGE = "/placeholder.svg"

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [property, setProperty] = useState<PropertyWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  const fetchPropertyData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Add a token for authorization
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }
      
      const response = await fetch(`/api/properties/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Use proper cache settings
        cache: 'force-cache'
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          return notFound()
        } else {
          throw new Error(`Failed to load property data: ${response.status}`)
        }
      }
      
      const data = await response.json()
      setProperty(data)
      
      // Check if property is in favorites
      checkIfFavorite(token)
    } catch (err) {
      console.error("Error fetching property:", err)
      setError("An unexpected error occurred while loading property data")
      
      toast({
        title: "Error",
        description: "Failed to load property details. Redirecting to dashboard...",
        variant: "destructive",
      })
      
      // After a delay, navigate back to dashboard if there's an error
      setTimeout(() => {
        router.push('/tenant')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.id, router, toast])

  useEffect(() => {
    let isMounted = true;
    
    if (resolvedParams.id) {
      fetchPropertyData();
    }
    
    // Clean up function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id, fetchPropertyData]);

  // Check if property is in favorites
  const checkIfFavorite = async (token: string) => {
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const favorites = await response.json()
        // Check if current property is in favorites
        const isFav = favorites.some((fav: any) => fav.id === resolvedParams.id)
        setIsFavorite(isFav)
      }
    } catch (error) {
      console.error("Error checking favorites:", error)
      // Don't set any error state, just log it since this is not critical
    }
  }

  // Improved error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/tenant" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center rounded-[1.5rem] border-0 bg-red-50 p-8 text-center shadow-md">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <Info className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-red-600">Error Loading Property</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button 
            className="rounded-full bg-teal-600 hover:bg-teal-700"
            onClick={() => router.push('/tenant')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/tenant" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-gray-200 bg-white p-8 text-center shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">{error || "Property not found"}</h2>
          <p className="mb-6 text-gray-600">We couldn't find the property you're looking for. Redirecting to dashboard...</p>
          <Button className="rounded-full bg-teal-600 hover:bg-teal-700" asChild>
            <Link href="/tenant">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Image navigation functions
  const nextImage = () => {
    if (!property?.images?.length) return
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.images.length)
  }

  const prevImage = () => {
    if (!property?.images?.length) return
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.images.length) % property.images.length)
  }

  // Schedule a visit
  const handleScheduleVisit = () => {
    if (!date) {
      toast({
        title: "Please select a date",
        description: "You need to select a date to schedule a visit",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Visit Scheduled",
      description: `Your visit has been scheduled for ${format(date, "PPP")}. A representative will contact you shortly.`,
    })
  }

  // Add or remove from favorites
  const handleAddToFavorites = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to add properties to favorites",
          variant: "destructive",
        })
        return
      }
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?propertyId=${resolvedParams.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          setIsFavorite(false)
          toast({
            title: "Removed from Favorites",
            description: "This property has been removed from your favorites",
          })
        } else {
          throw new Error('Failed to remove from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ propertyId: resolvedParams.id }),
        })

        if (response.ok) {
          setIsFavorite(true)
          toast({
            title: "Added to Favorites",
            description: "This property has been added to your favorites",
          })
        } else {
          throw new Error('Failed to add to favorites')
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add property to favorites",
        variant: "destructive",
      })
    }
  }

  // Calculate total move-in cost
  const totalMoveInCost = property.price * 2 // Assuming security deposit equals one month's rent

  // Get featured image or first image
  const featuredImage = property.images?.find(img => img.is_featured)?.image_url || 
                        (property.images?.length ? property.images[0].image_url : PLACEHOLDER_IMAGE)

  // Get all property images
  const propertyImages = property.images?.length 
    ? property.images.map(img => img.image_url) 
    : [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/tenant" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative mb-4 overflow-hidden rounded-[1.5rem]">
          <div className="relative h-64 w-full md:h-96">
            <Image
              src={propertyImages[currentImageIndex] || PLACEHOLDER_IMAGE}
              alt={`Property image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
              onError={(e) => {
                // Replace broken images with placeholder
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-4 top-4 h-10 w-10 rounded-full bg-white/80 ${
                isFavorite ? 'text-red-500 hover:text-red-700' : 'text-gray-600 hover:text-red-500'
              }`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={handleAddToFavorites}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-16 top-4 h-10 w-10 rounded-full bg-white/80 text-gray-600 hover:bg-white"
              aria-label="Share property"
            >
              <Share className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevImage}
              className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 text-gray-600 hover:bg-white"
              aria-label="Previous image"
              disabled={propertyImages.length <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 text-gray-600 hover:bg-white"
              aria-label="Next image"
              disabled={propertyImages.length <= 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {propertyImages.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {propertyImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 ${
                  index === currentImageIndex ? "border-teal-600" : "border-transparent"
                }`}
              >
                <Image 
                  src={image || PLACEHOLDER_IMAGE} 
                  alt={`Thumbnail ${index + 1}`} 
                  fill 
                  className="object-cover"
                  sizes="96px"
                  onError={(e) => {
                    // Replace broken images with placeholder
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-2xl font-bold md:text-3xl">{property.title}</h1>
              <p className="ml-4 whitespace-nowrap text-xl font-bold text-teal-600">${property.price}/mo</p>
            </div>
            <div className="mb-4 flex items-center text-gray-500">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{property.location}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center">
                <Bed className="mr-1 h-5 w-5" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath className="mr-1 h-5 w-5" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              {property.area && (
                <div className="flex items-center">
                  <Square className="mr-1 h-5 w-5" />
                  <span>{property.area} ft²</span>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4 rounded-full">
              <TabsTrigger
                value="overview"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="amenities"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Amenities
              </TabsTrigger>
              <TabsTrigger
                value="floorplan"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Floor Plan
              </TabsTrigger>
              <TabsTrigger
                value="tour"
                className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Virtual Tour
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-0">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold">Description</h3>
                  <p className="mb-6 text-gray-600">{property.description || "No description available"}</p>
                  <h3 className="mb-4 text-lg font-bold">Pricing Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monthly Rent</span>
                      <span className="font-medium">${property.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit</span>
                      <span className="font-medium">${property.price}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-bold">Total Move-in Cost</span>
                      <span className="font-bold text-teal-600">
                        ${totalMoveInCost}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="amenities" className="mt-0">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold">Amenities</h3>
                  {property.features && property.features.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {property.features.map((feature) => (
                        <div key={feature.id} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-teal-600" />
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No amenities listed for this property</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="floorplan" className="mt-0">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold">Floor Plan</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative h-[400px] w-full max-w-[600px]">
                      <Image
                        src="/placeholder.svg?height=400&width=600"
                        alt="Floor Plan"
                        fill
                        className="rounded-xl object-contain"
                      />
                    </div>
                    <Button variant="outline" className="mt-4 flex items-center gap-2 rounded-full">
                      <Download className="h-4 w-4" />
                      Download Floor Plan PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tour" className="mt-0">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold">Virtual Tour</h3>
                  <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-100">
                    <div className="text-center">
                      <p className="mb-2 text-gray-500">Virtual tour would be displayed here</p>
                      <Button className="rounded-full bg-teal-600 hover:bg-teal-700">Start Virtual Tour</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-20 rounded-[1.5rem] border-0 shadow-md">
            <CardContent className="p-6">
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-bold">Interested in this property?</h3>
                <Button className="w-full rounded-full bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href={`/tenant/property/${resolvedParams.id}/payment/`} prefetch={true}>Pay Deposit</Link>
                </Button>
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <Link href={`/tenant/messages/?property=${resolvedParams.id}`} prefetch={true}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Inquiry
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Schedule a Visit</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start rounded-xl text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <Button 
                  className="w-full rounded-full bg-teal-600 hover:bg-teal-700"
                  onClick={handleScheduleVisit}
                >
                  Schedule Visit
                </Button>
                <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-sm">
                  <Info className="mt-0.5 h-4 w-4 text-gray-500" />
                  <p className="text-gray-600">
                    A representative will contact you to confirm your visit after scheduling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
