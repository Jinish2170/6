"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Loader2, Plus, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [property, setProperty] = useState({
    id: "",
    title: "",
    description: "",
    location: "",
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    status: "AVAILABLE",
    images: [] as { id: string; image_url: string; is_featured: boolean }[],
    features: [] as { id: string; name: string }[]
  })
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<{ id: string; name: string }[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        const propertyResponse = await fetch(`/api/properties?id=${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!propertyResponse.ok) {
          throw new Error("Failed to fetch property details")
        }

        const propertyData = await propertyResponse.json()
        setProperty(propertyData)
        setSelectedFeatures(propertyData.features.map((f: any) => f.id))

        // Fetch available features
        const featuresResponse = await fetch("/api/features", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!featuresResponse.ok) {
          throw new Error("Failed to fetch features")
        }

        const featuresData = await featuresResponse.json()
        setAvailableFeatures(featuresData)
      } catch (error) {
        console.error("Error fetching property data:", error)
        setError("Failed to load property data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [params.id, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setNewImages((prev) => [...prev, ...files])

      // Create previews
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (imageId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/property-images?id=${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      setProperty({
        ...property,
        images: property.images.filter((img) => img.id !== imageId)
      })
    } catch (error) {
      console.error("Error removing image:", error)
    }
  }

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const formData = new FormData()
      formData.append("title", property.title)
      formData.append("description", property.description)
      formData.append("location", property.location)
      formData.append("price", property.price.toString())
      formData.append("bedrooms", property.bedrooms.toString())
      formData.append("bathrooms", property.bathrooms.toString())
      formData.append("area", property.area.toString())
      formData.append("status", property.status)
      formData.append("features", JSON.stringify(selectedFeatures))      // Add new images if any
      newImages.forEach((image) => {
        formData.append("images", image)
      })

      console.log(`Submitting update for property ${property.id} with ${newImages.length} new images`);

      const response = await fetch(`/api/properties?id=${property.id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Property update error:', errorData);
        throw new Error(errorData.error || "Failed to update property")
      }

      router.push("/landlord/properties")
      router.refresh()
    } catch (error: any) {
      console.error("Error updating property:", error)
      setError(error.message || "Failed to update property")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
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
        <h1 className="text-2xl font-bold md:text-3xl">Edit Property</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-[1.5rem] border-0 shadow-md">
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title*</Label>
                  <Input
                    id="title"
                    value={property.title}
                    onChange={(e) => setProperty({ ...property, title: e.target.value })}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    value={property.description}
                    onChange={(e) => setProperty({ ...property, description: e.target.value })}
                    rows={5}
                    required
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location*</Label>
                  <Input
                    id="location"
                    value={property.location}
                    onChange={(e) => setProperty({ ...property, location: e.target.value })}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly Rent (USD)*</Label>
                    <Input
                      id="price"
                      type="number"
                      value={property.price}
                      onChange={(e) => setProperty({ ...property, price: Number(e.target.value) })}
                      required
                      min={0}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status*</Label>
                    <Select
                      value={property.status}
                      onValueChange={(value) => setProperty({ ...property, status: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RENTED">Rented</SelectItem>
                        <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms*</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={property.bedrooms}
                      onChange={(e) => setProperty({ ...property, bedrooms: Number(e.target.value) })}
                      required
                      min={0}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms*</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={property.bathrooms}
                      onChange={(e) => setProperty({ ...property, bathrooms: Number(e.target.value) })}
                      required
                      min={0}
                      step={0.5}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)*</Label>
                    <Input
                      id="area"
                      type="number"
                      value={property.area}
                      onChange={(e) => setProperty({ ...property, area: Number(e.target.value) })}
                      required
                      min={0}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border-0 shadow-md">
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {property.images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative h-32 w-32 overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={image.image_url}
                        alt="Property"
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => removeExistingImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {image.is_featured && (
                        <div className="absolute bottom-0 left-0 right-0 bg-teal-500 py-1 text-center text-xs text-white">
                          Featured
                        </div>
                      )}
                    </div>
                  ))}
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="group relative h-32 w-32 overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={preview}
                        alt="New upload preview"
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <label
                    htmlFor="upload-image"
                    className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                  >
                    <Upload className="mb-2 h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-500">Add Image</span>
                    <input
                      id="upload-image"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border-0 shadow-md">
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {availableFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-colors ${
                        selectedFeatures.includes(feature.id)
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleFeatureToggle(feature.id)}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          selectedFeatures.includes(feature.id)
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedFeatures.includes(feature.id) && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.5 2.5L3.5 7.5L1.5 5.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 rounded-[1.5rem] border-0 shadow-md">
              <CardHeader>
                <CardTitle>Save Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Make sure all required fields are filled before saving your changes.
                </p>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-teal-600 hover:bg-teal-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => router.push("/landlord/properties")}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
