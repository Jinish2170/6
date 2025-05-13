"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from "@/components/ui/use-toast";

export default function ErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Handle client-side navigation errors
    const handleError = (event: ErrorEvent) => {
      console.error('Caught in error boundary:', event.error);
      
      // Check if it's a navigation-related error
      if (event.error?.message?.includes('Failed to fetch') || 
          event.error?.message?.includes('Network Error') ||
          event.error?.message?.includes('404')) {
        
        toast({
          title: "Navigation Error",
          description: "The page couldn't be loaded. Redirecting to home page...",
          variant: "destructive"
        });
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/tenant');
        }, 2000);
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [router]);

  return children;
}
