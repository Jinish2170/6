"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bath, Bed, ChevronRight, MapPin, Search, Square } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Property {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  status: string
  image: string
  features: Array<{
    id: string
    name: string
    icon_name: string
  }>
}

export default function TenantHomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    const fetchFeaturedProperties = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        // Add cache control parameters to prevent repeated calls
        const response = await fetch("/api/properties/featured", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // Add cache control to prevent repeated fetches
          cache: 'force-cache'
        })

        if (!response.ok) {
          throw new Error("Failed to fetch featured properties")
        }

        const data = await response.json()
        // Only update state if component is still mounted
        if (isMounted) {
          setFeaturedProperties(data)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching featured properties:", error)
        if (isMounted) {
          setError("Failed to load properties")
          setLoading(false)
          toast({
            title: "Error",
            description: "Failed to load properties",
            variant: "destructive",
          })
        }
      }
    }

    fetchFeaturedProperties()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array to fetch only once

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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section with Search */}
      <section className="mb-8 rounded-[1.5rem] bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white md:p-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Find Your Perfect Home</h1>
          <p className="text-teal-50">Thousands of properties waiting for you</p>
          <div className="relative mt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="City, neighborhood, or address"
                  className="h-12 rounded-full border-0 bg-white pl-10 pr-4 text-gray-900 shadow-md focus-visible:ring-2 focus-visible:ring-white"
                />
              </div>
              <Button className="h-12 rounded-full bg-white text-teal-600 hover:bg-teal-50">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Properties</h2>
          <Link href="/tenant/search" className="flex items-center text-sm font-medium text-teal-600">
            View all <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProperties
            .filter((p) => p.status === "featured")
            .map((property) => (
              <Link href={`/tenant/property/${property.id}`} key={property.id}>
                <Card className="h-full overflow-hidden rounded-[1.5rem] border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative">
                    <Image
                      src={property.image || "/placeholder.svg"}
                      alt={property.title}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover"
                    />
                    {property.status === "new" && (
                      <Badge className="absolute left-3 top-3 bg-teal-600 text-white hover:bg-teal-700">New</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-bold line-clamp-1">{property.title}</h3>
                      <p className="ml-2 whitespace-nowrap font-bold text-teal-600">${property.price}/mo</p>
                    </div>
                    <div className="mb-3 flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Bed className="mr-1 h-4 w-4" />
                        <span>{property.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="mr-1 h-4 w-4" />
                        <span>{property.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="mr-1 h-4 w-4" />
                        <span>{property.area} ft²</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </section>

      {/* Property Categories */}
      <section className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Browse by Category</h2>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4 rounded-full">
            <TabsTrigger
              value="all"
              className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="apartments"
              className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              Apartments
            </TabsTrigger>
            <TabsTrigger
              value="houses"
              className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              Houses
            </TabsTrigger>
            <TabsTrigger
              value="villas"
              className="rounded-full data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            >
              Villas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties
            .filter((p) => p.status === "AVAILABLE")
            .map((property) => (
                <Link href={`/tenant/property/${property.id}/`} key={property.id} prefetch={true}>
                  <Card className="h-full overflow-hidden rounded-[1.5rem] border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative">
                      <Image
                        src={property.image || "/placeholder.svg"}
                        alt={property.title}
                        width={400}
                        height={300}
                        className="h-48 w-full object-cover"
                      />
                      {property.status === "new" && (
                        <Badge className="absolute left-3 top-3 bg-teal-600 text-white hover:bg-teal-700">New</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-bold line-clamp-1">{property.title}</h3>
                        <p className="ml-2 whitespace-nowrap font-bold text-teal-600">${property.price}/mo</p>
                      </div>
                      <div className="mb-3 flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span className="line-clamp-1">{property.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Bed className="mr-1 h-4 w-4" />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="mr-1 h-4 w-4" />
                          <span>{property.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="mr-1 h-4 w-4" />
                          <span>{property.area} ft²</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="apartments" className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties
                .filter((property) => property.features.some((feature) => feature.name === "Apartment"))
                .map((property) => (
                  <Link href={`/tenant/property/${property.id}`} key={property.id}>
                    <Card className="h-full overflow-hidden rounded-[1.5rem] border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative">
                        <Image
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          width={400}
                          height={300}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-bold line-clamp-1">{property.title}</h3>
                          <p className="ml-2 whitespace-nowrap font-bold text-teal-600">${property.price}/mo</p>
                        </div>
                        <div className="mb-3 flex items-center text-sm text-gray-500">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="mr-1 h-4 w-4" />
                            <span>{property.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="mr-1 h-4 w-4" />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="mr-1 h-4 w-4" />
                            <span>{property.area} ft²</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="houses" className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties
                .filter((property) => property.features.some((feature) => feature.name === "House"))
                .map((property) => (
                  <Link href={`/tenant/property/${property.id}`} key={property.id}>
                    <Card className="h-full overflow-hidden rounded-[1.5rem] border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative">
                        <Image
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          width={400}
                          height={300}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-bold line-clamp-1">{property.title}</h3>
                          <p className="ml-2 whitespace-nowrap font-bold text-teal-600">${property.price}/mo</p>
                        </div>
                        <div className="mb-3 flex items-center text-sm text-gray-500">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="mr-1 h-4 w-4" />
                            <span>{property.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="mr-1 h-4 w-4" />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="mr-1 h-4 w-4" />
                            <span>{property.area} ft²</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="villas" className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties
                .filter((property) => property.features.some((feature) => feature.name === "Villa"))
                .map((property) => (
                  <Link href={`/tenant/property/${property.id}`} key={property.id}>
                    <Card className="h-full overflow-hidden rounded-[1.5rem] border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative">
                        <Image
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          width={400}
                          height={300}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-bold line-clamp-1">{property.title}</h3>
                          <p className="ml-2 whitespace-nowrap font-bold text-teal-600">${property.price}/mo</p>
                        </div>
                        <div className="mb-3 flex items-center text-sm text-gray-500">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="mr-1 h-4 w-4" />
                            <span>{property.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="mr-1 h-4 w-4" />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="mr-1 h-4 w-4" />
                            <span>{property.area} ft²</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
