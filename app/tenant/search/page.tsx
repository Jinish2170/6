"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bath, Bed, Filter, Heart, MapPin, Search as SearchIcon, Square, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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

export default function SearchPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams, setSearchParams] = useState({
    location: "",
    minPrice: 0,
    maxPrice: 10000,
    bedrooms: "any",
    bathrooms: "any"
  })
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token")
        let url = '/api/properties?status=AVAILABLE'
        
        if (searchParams.location) {
          url += `&location=${encodeURIComponent(searchParams.location)}`
        }
        if (searchParams.minPrice > 0) {
          url += `&minPrice=${searchParams.minPrice}`
        }
        if (searchParams.maxPrice < 10000) {
          url += `&maxPrice=${searchParams.maxPrice}`
        }
        if (searchParams.bedrooms !== "any") {
          url += `&bedrooms=${searchParams.bedrooms}`
        }
        if (searchParams.bathrooms !== "any") {
          url += `&bathrooms=${searchParams.bathrooms}`
        }

        const response = await fetch(url, {
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

    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/favorites", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch favorites")
        }

        const data = await response.json()
        setFavorites(data.map((p: Property) => p.id))
      } catch (error) {
        console.error("Error fetching favorites:", error)
      }
    }

    fetchProperties()
    fetchFavorites()
  }, [searchParams])

  const toggleFavorite = async (propertyId: string) => {
    try {
      const token = localStorage.getItem("token")
      const isFavorite = favorites.includes(propertyId)
      
      const response = await fetch(`/api/favorites${isFavorite ? `?propertyId=${propertyId}` : ''}`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        ...(isFavorite ? {} : { body: JSON.stringify({ propertyId }) })
      })

      if (!response.ok) {
        throw new Error(isFavorite ? "Failed to remove from favorites" : "Failed to add to favorites")
      }

      setFavorites(prev => 
        isFavorite 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      )
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

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
      {/* Search Bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by location..."
            value={searchParams.location}
            onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
            className="h-10 rounded-full border-gray-200 pl-10 pr-4"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-6">
              <div>
                <Label>Price Range</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchParams.minPrice}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchParams.maxPrice}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label>Bedrooms</Label>
                <Select
                  value={searchParams.bedrooms}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, bedrooms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Select
                  value={searchParams.bathrooms}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, bathrooms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="2.5">2.5</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card
            key={property.id}
            className="group relative overflow-hidden rounded-[1.5rem] border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <Link href={`/tenant/property/${property.id}`}>
              <div className="relative">
                <Image
                  src={property.images.find(img => img.is_featured)?.image_url || "/placeholder.svg"}
                  alt={property.title}
                  width={400}
                  height={300}
                  className="aspect-video w-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(property.id)
                  }}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(property.id)
                        ? "fill-red-500 text-red-500"
                        : "text-white hover:fill-red-500 hover:text-red-500"
                    }`}
                  />
                </Button>
              </div>
            </Link>

            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <p className="flex items-center text-sm text-gray-500">
                    <MapPin className="mr-1 h-4 w-4" />
                    {property.location}
                  </p>
                </div>
                <p className="text-lg font-bold text-teal-600">${property.price}</p>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
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

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <SearchIcon className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold">No properties found</h2>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  )
}
