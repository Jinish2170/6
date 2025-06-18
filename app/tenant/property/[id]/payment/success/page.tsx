"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"

export default function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [transactionDetails, setTransactionDetails] = useState({
    id: "",
    date: "",
    amount: 0,
    property: "",
  })

  useEffect(() => {
    // Try to get payment confirmation from localStorage
    const paymentConfirmation = localStorage.getItem('paymentConfirmation')
    if (paymentConfirmation) {
      try {
        const parsedData = JSON.parse(paymentConfirmation)
        setTransactionDetails({
          id: `TXN-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          amount: parsedData.amount || 0,
          property: parsedData.propertyTitle || "Property Name Not Available",
        })
        // Clear the stored data after use
        localStorage.removeItem('paymentConfirmation')
      } catch (error) {
        console.error('Error parsing payment confirmation:', error)
      }
    } else {
      // Fallback if no data available
      setTransactionDetails({
        id: `TXN-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        amount: 0,
        property: "Payment processed successfully",
      })
    }
  }, [])

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
                <span className="font-medium">
                  {transactionDetails.amount > 0 
                    ? `$${transactionDetails.amount.toLocaleString()}` 
                    : "Amount not available"
                  }
                </span>
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
            <Link href={`/tenant/property/${resolvedParams.id}`}>Back to Property</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
