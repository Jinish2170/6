"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bath, Bed, Heart, MapPin, Square, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type Property = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: Array<{ image_url: string; is_featured: boolean }>;
  features: Array<{ name: string }>;
}

export default function FavoritesPage() {
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
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
        setFavoriteProperties(data)
      } catch (error) {
        console.error("Error fetching favorites:", error)
        setError("Failed to load favorite properties")
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  const removeFavorite = async (propertyId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to remove from favorites")
      }

      setFavoriteProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (error) {
      console.error("Error removing favorite:", error)
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Favorites</h1>
        <p className="text-gray-500">{favoriteProperties.length} saved properties</p>
      </div>

      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteProperties.map((property) => (
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
                      removeFavorite(property.id)
                    }}
                  >
                    <Trash2 className="h-5 w-5 text-white transition-colors hover:text-red-500" />
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
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold">No favorites yet</h2>
          <p className="mb-4 text-gray-500">Start saving properties you like to see them here</p>
          <Link href="/tenant/search">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
