"use client"

import type React from "react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Feature = {
  id: string;
  name: string;
  icon_name: string;
};

export default function AddPropertyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set())

  // Fetch features when component mounts
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/features')
        if (!response.ok) throw new Error('Failed to fetch features')
        const data = await response.json()
        setFeatures(data)
      } catch (error) {
        console.error('Error fetching features:', error)
      }
    }
    fetchFeatures()
  }, [])
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      
      // Validate file types and sizes
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
      
      const invalidFiles = selectedFiles.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Error",
            description: `${file.name} is not a supported image format. Please use JPG, PNG, WEBP, or HEIC.`,
            variant: "destructive"
          })
          return true
        }
        if (file.size > maxSize) {
          toast({
            title: "Error",
            description: `${file.name} is too large. Maximum size is 10MB.`,
            variant: "destructive"
          })
          return true
        }
        return false
      })

      if (invalidFiles.length > 0) {
        e.target.value = '' // Clear the file input
        return
      }

      setFiles(selectedFiles)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Validate required fields based on database schema
      const requiredFields = ['title', 'description', 'price', 'bedrooms', 'bathrooms'];
      const missingFields = requiredFields.filter(field => !formData.get(field));
      if (missingFields.length > 0) {
        toast({
          title: "Error",
          description: `Missing required fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Location is now a single field, no need to combine

      // Add selected feature IDs
      const selectedFeatureIds = Array.from(selectedFeatures)
      formData.set('features', JSON.stringify(selectedFeatureIds))

      // Remove any previous image entries
      formData.delete('images')
      // Add each file as a separate 'images' entry
      files.forEach(file => {
        formData.append('images', file)
      })

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add property')
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: "Property added successfully",
      })

      // Redirect to the properties page
      router.push('/landlord/properties')
    } catch (error) {
      console.error('Error adding property:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add property",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-20 md:pt-6">
      <div className="mb-6">
        <Link
          href="/landlord/properties"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to properties
        </Link>
      </div>

      <div className="mx-auto max-w-4xl">
        <Card className="rounded-[1.5rem] border-0 shadow-md">
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
            <CardDescription>Fill in the details to list your property</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Modern Apartment with City View"
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Property Type removed as it's not in the database schema */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Property Status</Label>
                    <Select name="status" required>
                      <SelectTrigger id="status" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RENTED">Rented</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your property in detail..."
                    className="min-h-32 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Location</h3>
                <div className="space-y-2">
                  <Label htmlFor="location">Property Location</Label>
                  <Input 
                    id="location" 
                    name="location"
                    placeholder="Full address (e.g., 123 Main St, New York, NY 10001)" 
                    required 
                    className="h-12 rounded-xl" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Property Details</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input 
                      id="bedrooms" 
                      name="bedrooms"
                      type="number" 
                      min="0" 
                      required 
                      className="h-12 rounded-xl" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input 
                      id="bathrooms" 
                      name="bathrooms"
                      type="number" 
                      min="0" 
                      step="0.5" 
                      required 
                      className="h-12 rounded-xl" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input 
                      id="area" 
                      name="area"
                      type="number" 
                      min="0" 
                      required 
                      className="h-12 rounded-xl" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pricing</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly Price ($)</Label>
                    <Input 
                      id="price" 
                      name="price"
                      type="number" 
                      min="0" 
                      required 
                      className="h-12 rounded-xl" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Features</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Switch 
                        id={feature.id}
                        checked={selectedFeatures.has(feature.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedFeatures)
                          if (checked) {
                            newSelected.add(feature.id)
                          } else {
                            newSelected.delete(feature.id)
                          }
                          setSelectedFeatures(newSelected)
                        }}
                      />
                      <Label htmlFor={feature.id}>{feature.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Photos</h3>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6">
                  <Upload className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">Drag and drop files here or click to browse</p>
                  <p className="text-xs text-gray-400">Supports JPG, PNG, HEIC up to 10MB each</p>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 rounded-full"
                    onClick={() => document.getElementById("photos")?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Selected files:</p>
                    <ul className="mt-1 text-sm text-gray-500">
                      {files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                className="w-full rounded-full bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding Property..." : "Add Property"}
              </Button>
              <Button type="button" variant="outline" className="w-full rounded-full" asChild>
                <Link href="/landlord/properties">Cancel</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
