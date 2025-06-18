"use client"

import type React from "react"
import LandlordNavigation from "@/components/landlord/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LandlordLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if authentication check is complete
    if (!isLoading) {
      if (!user) {
        // No user, redirect to login
        router.replace("/auth/login")
      } else if (user.role !== "landlord") {
        // Wrong role, redirect to appropriate dashboard
        router.replace(`/${user.role}`)
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandlordNavigation />
      <main className="pb-20 md:pb-0">{children}</main>
    </div>
  )
}
