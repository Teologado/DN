"use client";

import { useUser } from '@/hooks/use-user';
import Auth from '@/components/auth/auth';
import Dashboard from '@/components/dashboard/dashboard';
import Header from '@/components/shared/header';
import { Skeleton } from '@/components/ui/skeleton';

function AppLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <AppLoadingSkeleton />
        ) : user ? (
          <Dashboard />
        ) : (
          <Auth />
        )}
      </main>
    </div>
  );
}
