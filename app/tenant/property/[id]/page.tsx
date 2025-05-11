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
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Sample property data
  const property = {
    id: params.id,
    title: "Modern Apartment with City View",
    location: "Downtown, New York",
    rent: 2500,
    securityDeposit: 2500,
    brokerageFee: 2500,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    description:
      "This beautiful modern apartment offers stunning city views and is located in the heart of downtown. The apartment features hardwood floors, stainless steel appliances, and a spacious living area. The building includes a fitness center, rooftop terrace, and 24-hour concierge service.",
    amenities: [
      { name: "Air Conditioning", icon: Wifi },
      { name: "Heating", icon: Wifi },
      { name: "Washer/Dryer", icon: Wifi },
      { name: "Dishwasher", icon: Wifi },
      { name: "Fitness Center", icon: Wifi },
      { name: "Rooftop Terrace", icon: Wifi },
      { name: "24-hour Concierge", icon: Wifi },
      { name: "Pet Friendly", icon: Wifi },
      { name: "Parking", icon: Wifi },
      { name: "Elevator", icon: Wifi },
    ],
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
    ],
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.images.length) % property.images.length)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/tenant/search" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to search results
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative mb-4 overflow-hidden rounded-[1.5rem]">
          <div className="relative h-64 w-full md:h-96">
            <Image
              src={property.images[currentImageIndex] || "/placeholder.svg"}
              alt={`Property image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
              aria-label="Add to favorites"
            >
              <Heart className="h-5 w-5" />
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
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 text-gray-600 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {property.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 ${
                index === currentImageIndex ? "border-teal-600" : "border-transparent"
              }`}
            >
              <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-2xl font-bold md:text-3xl">{property.title}</h1>
              <p className="ml-4 whitespace-nowrap text-xl font-bold text-teal-600">${property.rent}/mo</p>
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
              <div className="flex items-center">
                <Square className="mr-1 h-5 w-5" />
                <span>{property.area} ft²</span>
              </div>
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
                  <p className="mb-6 text-gray-600">{property.description}</p>
                  <h3 className="mb-4 text-lg font-bold">Pricing Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monthly Rent</span>
                      <span className="font-medium">${property.rent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit</span>
                      <span className="font-medium">${property.securityDeposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brokerage Fee</span>
                      <span className="font-medium">${property.brokerageFee}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-bold">Total Move-in Cost</span>
                      <span className="font-bold text-teal-600">
                        ${property.rent + property.securityDeposit + property.brokerageFee}
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
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-teal-600" />
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="floorplan" className="mt-0">
              <Card className="rounded-[1.5rem] border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold">Floor Plan</h3>
                  <div className="flex flex-col items-center">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt="Floor Plan"
                      width={600}
                      height={400}
                      className="mb-4 rounded-xl"
                    />
                    <Button variant="outline" className="flex items-center gap-2 rounded-full">
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
                  <Link href={`/tenant/property/${property.id}/payment`}>Pay Deposit</Link>
                </Button>
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <Link href={`/tenant/messages?property=${property.id}`}>
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
                <Button className="w-full rounded-full bg-teal-600 hover:bg-teal-700">Schedule Visit</Button>
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
