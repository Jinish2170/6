import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <Card className="w-full max-w-md overflow-hidden rounded-[1.5rem] border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center space-y-8 p-8">
            <div className="relative h-24 w-24">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="Property Renting System Logo"
                width={96}
                height={96}
                className="rounded-2xl bg-teal-500 p-4"
              />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-gray-900">HomeHaven</h1>
              <p className="text-gray-500">Find your perfect home, hassle-free</p>
            </div>
            <div className="flex w-full flex-col gap-3">
              <Button asChild className="h-12 w-full rounded-full bg-teal-600 text-base hover:bg-teal-700">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-full border-teal-600 text-base text-teal-600 hover:bg-teal-50"
              >
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
