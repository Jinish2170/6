"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, CreditCard, Info } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)

  // Sample property data
  const property = {
    id: params.id,
    title: "Modern Apartment with City View",
    location: "Downtown, New York",
    rent: 2500,
    securityDeposit: 2500,
    brokerageFee: 2500,
  }

  const handlePayment = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      window.location.href = `/tenant/property/${params.id}/payment/success`
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href={`/tenant/property/${params.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to property
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Complete your payment to secure the property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 gap-4 md:grid-cols-3"
                >
                  <div>
                    <RadioGroupItem value="credit-card" id="credit-card" className="peer sr-only" />
                    <Label
                      htmlFor="credit-card"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-gray-200 p-4 hover:border-teal-600 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Credit Card</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="bank-transfer" id="bank-transfer" className="peer sr-only" />
                    <Label
                      htmlFor="bank-transfer"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-gray-200 p-4 hover:border-teal-600 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Bank Transfer</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                    <Label
                      htmlFor="upi"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-gray-200 p-4 hover:border-teal-600 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">UPI</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "credit-card" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Card Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name on Card</Label>
                    <Input id="name" placeholder="John Doe" className="h-12 rounded-xl" />
                  </div>
                </div>
              )}

              {paymentMethod === "bank-transfer" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bank Transfer Details</h3>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-2 font-medium">Transfer to the following account:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank Name:</span>
                        <span className="font-medium">HomeHaven Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Number:</span>
                        <span className="font-medium">1234567890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Routing Number:</span>
                        <span className="font-medium">987654321</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reference:</span>
                        <span className="font-medium">PROP-{property.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-yellow-50 p-3 text-sm">
                    <Info className="mt-0.5 h-4 w-4 text-yellow-500" />
                    <p className="text-yellow-700">
                      Please include the reference number in your transfer. Your property will be secured once the
                      payment is verified.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">UPI Payment</h3>
                  <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-6">
                    <div className="mb-4 h-48 w-48 rounded-xl bg-white p-4">
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-gray-500">QR Code would appear here</p>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      Scan the QR code with your UPI app to make the payment
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upi-id">Or enter UPI ID</Label>
                    <div className="flex gap-2">
                      <Input id="upi-id" placeholder="username@upi" className="h-12 rounded-xl" />
                      <Button className="h-12 rounded-xl bg-teal-600 hover:bg-teal-700">Pay</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full rounded-full bg-teal-600 hover:bg-teal-700"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20 rounded-[1.5rem] border-0 shadow-md">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">{property.title}</h3>
                <p className="text-sm text-gray-500">{property.location}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span>${property.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">First Month's Rent</span>
                  <span>${property.rent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brokerage Fee</span>
                  <span>${property.brokerageFee.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-teal-600">
                    ${(property.securityDeposit + property.rent + property.brokerageFee).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-sm">
                <Info className="mt-0.5 h-4 w-4 text-gray-500" />
                <p className="text-gray-600">
                  Your payment secures the property. The security deposit is refundable at the end of your lease term.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
