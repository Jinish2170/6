import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage({ params }: { params: { id: string } }) {
  // Transaction details
  const transactionDetails = {
    id: "TXN-" + Math.floor(Math.random() * 1000000),
    date: new Date().toLocaleDateString(),
    amount: 7500,
    property: "Modern Apartment with City View",
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-6">
      <Card className="w-full max-w-md rounded-[1.5rem] border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <Check className="h-8 w-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your property has been secured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-medium">{transactionDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{transactionDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">${transactionDetails.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Property:</span>
                <span className="font-medium">{transactionDetails.property}</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-teal-50 p-4 text-center text-teal-800">
            <p>A confirmation email has been sent to your registered email address with all the details.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full rounded-full bg-teal-600 hover:bg-teal-700" asChild>
            <Link href="/tenant/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" className="w-full rounded-full" asChild>
            <Link href={`/tenant/property/${params.id}`}>Back to Property</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
