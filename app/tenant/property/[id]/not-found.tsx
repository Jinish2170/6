import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function PropertyNotFound() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/tenant" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-gray-200 bg-white p-8 text-center shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Property Not Found</h2>
        <p className="mb-6 text-gray-600">We couldn't find the property you're looking for. It may have been removed or the URL is incorrect.</p>
        <Button className="rounded-full bg-teal-600 hover:bg-teal-700" asChild>
          <Link href="/tenant">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
