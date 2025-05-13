"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/tenant" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center rounded-[1.5rem] border-0 bg-red-50 p-8 text-center shadow-md">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-red-600">Something went wrong!</h3>
        <p className="mb-4 text-gray-600">We encountered an issue processing your payment request.</p>
        <div className="flex gap-4">
          <Button
            className="rounded-full bg-teal-600 hover:bg-teal-700"
            onClick={() => reset()}
          >
            Try again
          </Button>
          <Button 
            variant="outline"
            className="rounded-full"
            asChild
          >
            <Link href="/tenant">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
