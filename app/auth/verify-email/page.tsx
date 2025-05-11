import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
              <Mail className="h-8 w-8 text-teal-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification code to your email address. Please enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between gap-2">
                <Input className="h-14 w-14 rounded-xl border-gray-200 text-center text-xl" maxLength={1} />
                <Input className="h-14 w-14 rounded-xl border-gray-200 text-center text-xl" maxLength={1} />
                <Input className="h-14 w-14 rounded-xl border-gray-200 text-center text-xl" maxLength={1} />
                <Input className="h-14 w-14 rounded-xl border-gray-200 text-center text-xl" maxLength={1} />
                <Input className="h-14 w-14 rounded-xl border-gray-200 text-center text-xl" maxLength={1} />
                <Input className="h-14 w-14 rounded-xl border-gray-200 text-center text-xl" maxLength={1} />
              </div>
              <Button asChild className="h-12 w-full rounded-full bg-teal-600 text-base hover:bg-teal-700">
                <Link href="/tenant">Verify Email</Link>
              </Button>
              <div className="text-center text-sm">
                Didn&apos;t receive a code?{" "}
                <Button variant="link" className="h-auto p-0 text-teal-600 hover:underline">
                  Resend code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
