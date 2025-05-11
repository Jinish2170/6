import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="mb-6">
        <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-md rounded-[1.5rem] border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>
              <Button className="h-12 w-full rounded-full bg-teal-600 text-base hover:bg-teal-700">
                Send reset link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
