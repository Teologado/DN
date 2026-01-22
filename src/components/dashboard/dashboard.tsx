"use client";

import { useUser } from "@/hooks/use-user";
import AdminDashboard from "./admin-dashboard";
import UserDashboard from "./user-dashboard";
import { Skeleton } from "../ui/skeleton";

export default function Dashboard() {
  const { profile, isLoading } = useUser();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (!profile) {
    // This can happen briefly while the profile is loading
    return <Skeleton className="h-[500px] w-full" />;
  }

  return profile.role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />;
}
