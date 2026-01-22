"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HallCatalog from "./user/hall-catalog";
import MyBookings from "./user/my-bookings";
import ProfileSettings from "./shared/profile-settings";
import { Building, Bookmark, User as UserIcon } from "lucide-react";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("catalog");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="catalog"><Building className="mr-2 h-4 w-4" />Catálogo de Salones</TabsTrigger>
        <TabsTrigger value="bookings"><Bookmark className="mr-2 h-4 w-4" />Mis Reservas</TabsTrigger>
        <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
      </TabsList>
      <TabsContent value="catalog" className="mt-6">
        <HallCatalog setActiveTab={setActiveTab} />
      </TabsContent>
      <TabsContent value="bookings" className="mt-6">
        <MyBookings />
      </TabsContent>
      <TabsContent value="profile" className="mt-6">
        <ProfileSettings />
      </TabsContent>
    </Tabs>
  );
}
