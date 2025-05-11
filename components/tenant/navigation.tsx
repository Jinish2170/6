"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { Menu, Home, Search, Heart, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export default function TenantNavigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/tenant",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/tenant/search",
      label: "Search",
      icon: Search,
    },
    {
      href: "/tenant/favorites",
      label: "Favorites",
      icon: Heart,
    },
    {
      href: "/tenant/profile",
      label: "Profile",
      icon: User,
    },
  ]

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-between border-t border-gray-200 bg-white p-2 md:hidden">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-2 text-xs",
                isActive ? "text-teal-600" : "text-gray-500",
              )}
            >
              <Icon size={20} />
              <span className="mt-1">{route.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Desktop Navigation */}
      <header className="hidden border-b border-gray-200 bg-white md:block">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/tenant" className="text-xl font-bold text-teal-600">
              HomeHaven
            </Link>
            <nav className="flex items-center space-x-6">
              {routes.map((route) => {
                const isActive = pathname === route.href

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-teal-600",
                      isActive ? "text-teal-600" : "text-gray-600",
                    )}
                  >
                    {route.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-1">
              <LogOut size={16} />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white md:hidden">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/tenant" className="text-lg font-bold text-teal-600">
            HomeHaven
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={24} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  {routes.map((route) => {
                    const Icon = route.icon
                    const isActive = pathname === route.href

                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-100",
                        )}
                      >
                        <Icon size={18} />
                        {route.label}
                      </Link>
                    )
                  })}
                </nav>

                <div className="mt-auto">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut size={18} />
                    Sign out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
