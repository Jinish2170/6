"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function PaymentLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/tenant" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to property
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-36" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-12 w-full rounded-full" />
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20 rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
