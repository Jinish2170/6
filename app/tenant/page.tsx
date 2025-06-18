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
import { PropertyCard } from "@/components/tenant/property-card"

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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  // Handle search functionality
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tenant/search?location=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/tenant/search')
    }
  }

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        // Fetch properties and favorites in parallel
        const [propertiesResponse, favoritesResponse] = await Promise.all([
          fetch("/api/properties/featured", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-cache' // Disable cache to get fresh data
          }),
          fetch("/api/favorites", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-cache'
          })
        ]);

        if (!propertiesResponse.ok) {
          throw new Error("Failed to fetch featured properties")
        }

        const propertiesData = await propertiesResponse.json()
        
        // Get favorite IDs
        let favorites: string[] = [];
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          favorites = favoritesData.map((fav: any) => fav.id);
        }

        // Only update state if component is still mounted
        if (isMounted) {
          setFeaturedProperties(propertiesData)
          setFavoriteIds(favorites)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
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

    fetchData()
    
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

  // Filter properties by category
  const getFilteredProperties = (category: string) => {
    const availableProperties = featuredProperties.filter((p) => p.status === "AVAILABLE")
    
    if (category === "all") {
      return availableProperties
    }
    
    // Map category to feature names (case-insensitive)
    const categoryMap: { [key: string]: string[] } = {
      apartments: ['apartment', 'flat', 'condo'],
      houses: ['house', 'home', 'townhouse'],
      villas: ['villa', 'mansion', 'estate']
    }
    
    const searchTerms = categoryMap[category] || [category]
    
    return availableProperties.filter((property) => 
      property.features.some((feature) => 
        searchTerms.some(term => 
          feature.name.toLowerCase().includes(term.toLowerCase())
        )
      )
    )
  }

  // Render properties with empty state
  const renderPropertiesGrid = (category: string, extraClasses = "") => {
    const properties = getFilteredProperties(category)
    
    if (properties.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {category === 'all' ? 'properties' : category} found
          </h3>
          <p className="text-gray-500 mb-4">
            {category === 'all' 
              ? 'No properties are currently available.' 
              : `No ${category} are currently available.`
            }
          </p>
          <Button 
            onClick={() => router.push('/tenant/search')}
            variant="outline"
          >
            Browse All Properties
          </Button>
        </div>
      )
    }
    
    return (
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${extraClasses}`}>
        {properties.map((property) => renderPropertyCard(property))}
      </div>
    )
  }

  // Update all property cards with favorite status
  const renderPropertyCard = (property: Property) => (
    <PropertyCard
      key={property.id}
      id={property.id}
      title={property.title}
      location={property.location}
      price={property.price}
      bedrooms={property.bedrooms}
      bathrooms={property.bathrooms}
      area={property.area}
      status={property.status}
      image={property.image}
      isNew={property.status === "new"}
      isFavorite={favoriteIds.includes(property.id)}
    />
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section with Search */}
      <section className="mb-8 rounded-[1.5rem] bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white md:p-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Find Your Perfect Home</h1>
          <p className="text-teal-50">Thousands of properties waiting for you</p>
          <div className="relative mt-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="City, neighborhood, or address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="h-12 rounded-full border-0 bg-white pl-10 pr-4 text-gray-900 shadow-md focus-visible:ring-2 focus-visible:ring-white"
                />
              </div>
              <Button 
                type="submit"
                onClick={handleSearch}
                className="h-12 rounded-full bg-white text-teal-600 hover:bg-teal-50"
              >
                Search
              </Button>
            </form>
            
            {/* Quick Search Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-teal-100">Popular searches:</span>
              {['Downtown', 'Suburbs', 'University Area', 'City Center', 'Waterfront'].map((location) => (
                <Button
                  key={location}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(location)
                    router.push(`/tenant/search?location=${encodeURIComponent(location)}`)
                  }}
                  className="h-7 rounded-full border border-white/20 bg-white/10 text-xs text-white hover:bg-white/20"
                >
                  {location}
                </Button>
              ))}
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
          {getFilteredProperties("all").map((property) => renderPropertyCard(property))}
        </div>
      </section>

      {/* Property Categories */}
      <section className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <div className="text-sm text-gray-500">
            {getFilteredProperties(activeCategory).length} properties found
          </div>
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
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
            {renderPropertiesGrid("all")}
          </TabsContent>
          <TabsContent value="apartments" className="mt-0">
            {renderPropertiesGrid("apartments")}
          </TabsContent>
          <TabsContent value="houses" className="mt-0">
            {renderPropertiesGrid("houses")}
          </TabsContent>
          <TabsContent value="villas" className="mt-0">
            {renderPropertiesGrid("villas")}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
