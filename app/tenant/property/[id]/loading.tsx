"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function PropertyLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/tenant" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      {/* Image Gallery Skeleton */}
      <div className="mb-8">
        <div className="relative mb-4 overflow-hidden rounded-[1.5rem]">
          <Skeleton className="h-64 w-full md:h-96" />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-24 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Property Details Skeleton */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="mb-4 h-4 w-48" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>

          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <Skeleton className="mb-4 h-16 w-full" />
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="mb-4 h-10 w-full rounded-full" />
              <Skeleton className="mb-6 h-10 w-full rounded-full" />
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="mb-4 h-10 w-full rounded-xl" />
              <Skeleton className="mb-4 h-10 w-full rounded-full" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
