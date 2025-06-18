"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bath, Bed, Heart, MapPin, Square } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  status: string
  image: string
  isNew?: boolean
  isFavorite?: boolean
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  status,
  image,
  isNew = false,
  isFavorite = false
}: PropertyCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link navigation
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add properties to favorites");
        return;
      }
      
      const url = '/api/favorites';
      const method = favorite ? 'DELETE' : 'POST';
      const params = favorite ? `?propertyId=${id}` : '';
      const body = favorite ? undefined : JSON.stringify({ propertyId: id });
      
      const response = await fetch(url + params, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        ...(body ? { body } : {})
      });
      
      if (response.ok) {
        setFavorite(!favorite);
      } else {
        throw new Error('Failed to update favorite');
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  }

  return (
    <Link href={`/tenant/property/${id}`} prefetch={true}>
      <Card className="h-full overflow-hidden rounded-[1.5rem] border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={400}
            height={300}
            className="h-48 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          {isNew && (
            <Badge className="absolute left-3 top-3 bg-teal-600 text-white hover:bg-teal-700">New</Badge>
          )}
          <button 
            onClick={handleFavoriteClick}
            className={`absolute right-3 top-3 rounded-full bg-white/80 p-2 ${
              favorite ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-bold line-clamp-1">{title}</h3>
            <p className="ml-2 whitespace-nowrap font-bold text-teal-600">${price}/mo</p>
          </div>
          <div className="mb-3 flex items-center text-sm text-gray-500">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Bed className="mr-1 h-4 w-4" />
              <span>{bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="mr-1 h-4 w-4" />
              <span>{bathrooms} Baths</span>
            </div>
            <div className="flex items-center">
              <Square className="mr-1 h-4 w-4" />
              <span>{area} ft²</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
