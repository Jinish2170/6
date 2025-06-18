"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bath, Bed, Filter, Heart, MapPin, Search as SearchIcon, Square, RotateCcw, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

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
  const searchParamsFromUrl = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [searchParams, setSearchParams] = useState({
    location: searchParamsFromUrl.get('location') || "",
    minPrice: parseInt(searchParamsFromUrl.get('minPrice') || "0"),
    maxPrice: parseInt(searchParamsFromUrl.get('maxPrice') || "10000"),
    bedrooms: searchParamsFromUrl.get('bedrooms') || "any",
    bathrooms: searchParamsFromUrl.get('bathrooms') || "any",
    sortBy: searchParamsFromUrl.get('sortBy') || "newest"
  })
  const [favorites, setFavorites] = useState<string[]>([])
  const { toast } = useToast()

  // Debounce search parameters to avoid too many API calls
  const debouncedSearchParams = useDebounce(searchParams, 500)

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.location) count++;
    if (searchParams.minPrice > 0) count++;
    if (searchParams.maxPrice < 10000) count++;
    if (searchParams.bedrooms !== "any") count++;
    if (searchParams.bathrooms !== "any") count++;
    return count;
  }, [searchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams({
      location: "",
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: "any",
      bathrooms: "any",
      sortBy: "newest"
    });
  }, []);

  const fetchProperties = useCallback(async (params: typeof searchParams) => {
    try {
      setSearching(true)
      const token = localStorage.getItem("token")
      let url = '/api/properties?status=AVAILABLE'
      
      if (params.location) {
        url += `&location=${encodeURIComponent(params.location)}`
      }
      if (params.minPrice > 0) {
        url += `&minPrice=${params.minPrice}`
      }
      if (params.maxPrice < 10000) {
        url += `&maxPrice=${params.maxPrice}`
      }
      if (params.bedrooms !== "any") {
        url += `&bedrooms=${params.bedrooms}`
      }
      if (params.bathrooms !== "any") {
        url += `&bathrooms=${params.bathrooms}`
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
      setError("")
    } catch (error) {
      console.error("Error fetching properties:", error)
      setError("Failed to load properties")
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }, [toast])

  const fetchFavorites = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.map((p: Property) => p.id))
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    }
  }, [])

  // Fetch properties when debounced search params change
  useEffect(() => {
    fetchProperties(debouncedSearchParams)
  }, [debouncedSearchParams, fetchProperties])

  // Fetch favorites on mount
  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  // Sort properties based on sortBy parameter
  const sortedProperties = useMemo(() => {
    if (!properties.length) return properties;
    
    const sorted = [...properties];
    
    switch (searchParams.sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price-high':
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case 'area-large':
        return sorted.sort((a, b) => Number(b.area) - Number(a.area));
      case 'area-small':
        return sorted.sort((a, b) => Number(a.area) - Number(b.area));
      case 'newest':
      default:
        return sorted; // API already returns newest first
    }
  }, [properties, searchParams.sortBy]);

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

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? "Property removed from your favorites" : "Property added to your favorites"
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      })
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
      {/* Search Bar and Controls */}
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
        
        <div className="flex gap-2">
          {/* Sort Dropdown */}
          <Select
            value={searchParams.sortBy}
            onValueChange={(value) => setSearchParams(prev => ({ ...prev, sortBy: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="area-large">Area: Largest</SelectItem>
              <SelectItem value="area-small">Area: Smallest</SelectItem>
            </SelectContent>
          </Select>

          {/* Filters Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Search Filters</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-6">
              <div>
                <Label>Price Range</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    step="100"
                    value={searchParams.minPrice || ""}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      minPrice: e.target.value ? Number(e.target.value) : 0 
                    }))}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min="0"
                    step="100"
                    value={searchParams.maxPrice === 10000 ? "" : searchParams.maxPrice}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      maxPrice: e.target.value ? Number(e.target.value) : 10000 
                    }))}
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
      </div>

      {/* Results Header */}
      {!loading && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {searching ? "Searching..." : `${sortedProperties.length} Properties Found`}
            </h2>
            {searching && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Property Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedProperties.map((property) => (
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
                <p className="text-lg font-bold text-teal-600">
                  ${typeof property.price === 'number' ? property.price.toLocaleString() : property.price}/month
                </p>
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
                  {typeof property.area === 'number' ? property.area.toLocaleString() : property.area} sqft
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && !searching && sortedProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <SearchIcon className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold">No properties found</h2>
          <p className="text-gray-500 text-center">
            {activeFiltersCount > 0 
              ? "Try adjusting your search filters to see more results"
              : "No available properties match your search"
            }
          </p>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-4"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
