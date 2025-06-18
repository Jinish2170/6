"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, CreditCard, Info } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use } from "react"

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  })

  // Fetch real property data
  const [property, setProperty] = useState({
    id: resolvedParams.id,
    title: "Loading...",
    location: "Loading...",
    rent: 0,
    securityDeposit: 0,
    brokerageFee: 0,
  })
  
  // Load property details when component mounts
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/auth/login"
          return
        }
        
        const response = await fetch(`/api/properties/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-cache' // Use no-cache to always get fresh data for payment
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            alert("Property not found. Redirecting to dashboard...")
            window.location.href = "/tenant"
            return
          }
          throw new Error(`Failed to fetch property: ${response.statusText}`)
        }
        
        const data = await response.json()
        setProperty({
          id: data.id,
          title: data.title,
          location: data.location,
          rent: Number(data.price) || 0,
          securityDeposit: Number(data.price) || 0, // Assuming security deposit equals one month's rent
          brokerageFee: Number(data.price) || 0, // Assuming brokerage fee equals one month's rent
        })
      } catch (error) {
        console.error("Error fetching property details:", error)
        alert("Error loading property details. Please try again later.")
        window.location.href = "/tenant"
      }
    }
    
    fetchPropertyDetails()
    
    // Cleanup function
    return () => {
      // Cleanup any subscriptions or async tasks if needed
    }
  }, [resolvedParams.id])

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Basic form validation
      if (paymentMethod === "credit-card") {
        if (!paymentDetails.cardNumber) {
          throw new Error("Please enter your card number")
        }
        if (!paymentDetails.cardName) {
          throw new Error("Please enter the name on your card")
        }
        if (!paymentDetails.expiry) {
          throw new Error("Please enter your card expiry date")
        }
        if (!paymentDetails.cvv) {
          throw new Error("Please enter your card security code (CVV)")
        }
        
        // Basic card number validation
        if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
          throw new Error("Please enter a valid 16-digit card number")
        }
        
        // Basic expiry date validation (MM/YY format)
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentDetails.expiry)) {
          throw new Error("Please enter a valid expiry date in MM/YY format")
        }
        
        // Basic CVV validation (3-4 digits)
        if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
          throw new Error("Please enter a valid 3 or 4 digit CVV code")
        }
      }
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Get authentication token
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required. Please login again.")
      }
      
      // Call rental API to complete the property rental
      const rentalResponse = await fetch('/api/properties/rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: property.id,
          paymentDetails: {
            method: paymentMethod,
            amount: property.securityDeposit + property.rent + property.brokerageFee
          }
        }),
      })

      if (!rentalResponse.ok) {
        const errorData = await rentalResponse.json()
        throw new Error(errorData.error || 'Failed to complete rental process')
      }

      const rentalData = await rentalResponse.json()
      
      // Save payment confirmation to local storage for reference
      localStorage.setItem('paymentConfirmation', JSON.stringify({
        propertyId: property.id,
        propertyTitle: property.title,
        amount: Number(property.securityDeposit) + Number(property.rent) + Number(property.brokerageFee),
        date: new Date().toISOString(),
        paymentMethod: paymentMethod,
        rentalCompleted: true
      }))

      // Show success message
      alert(`🎉 Payment Completed Successfully!\n\nProperty: ${rentalData.propertyTitle}\nStatus: Property is now rented to you\n\nRedirecting to success page...`)
      
      // Redirect to success page
      window.location.href = `/tenant/property/${resolvedParams.id}/payment/success`
    } catch (error) {
      console.error("Payment processing error:", error)
      alert(error instanceof Error ? error.message : "Payment processing failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href={`/tenant/property/${resolvedParams.id}/`}
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
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
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
                </RadioGroup>
              </div>

              {paymentMethod === "credit-card" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Card Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input 
                      id="card-number" 
                      placeholder="1234 5678 9012 3456" 
                      className="h-12 rounded-xl" 
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input 
                        id="expiry" 
                        placeholder="MM/YY" 
                        className="h-12 rounded-xl" 
                        value={paymentDetails.expiry}
                        onChange={(e) => setPaymentDetails({...paymentDetails, expiry: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input 
                        id="cvc" 
                        placeholder="123" 
                        className="h-12 rounded-xl"
                        value={paymentDetails.cvv} 
                        onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name on Card</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="h-12 rounded-xl" 
                      value={paymentDetails.cardName}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})}
                    />
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
              </div>                <div className="space-y-2">
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
                      ${(Number(property.securityDeposit) + Number(property.rent) + Number(property.brokerageFee)).toLocaleString()}
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
