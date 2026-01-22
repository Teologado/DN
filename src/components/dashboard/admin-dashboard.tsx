"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HallManagement from "./admin/hall-management";
import BookingManagement from "./admin/booking-management";
import BookingCalendar from "./admin/booking-calendar";
import AppSettings from "./admin/settings";
import ProfileSettings from "./shared/profile-settings";
import UserManagement from "./admin/user-management";
import { Building, Calendar, ListChecks, Settings, User as UserIcon, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <Tabs defaultValue="bookings" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 h-auto">
        <TabsTrigger value="bookings" className="py-2"><ListChecks className="mr-2 h-4 w-4" />Solicitudes de Reserva</TabsTrigger>
        <TabsTrigger value="calendar" className="py-2"><Calendar className="mr-2 h-4 w-4" />Calendario</TabsTrigger>
        <TabsTrigger value="halls" className="py-2"><Building className="mr-2 h-4 w-4" />Gestión de Salones</TabsTrigger>
        <TabsTrigger value="users" className="py-2"><Users className="mr-2 h-4 w-4" />Gestión de Usuarios</TabsTrigger>
        <TabsTrigger value="settings" className="py-2"><Settings className="mr-2 h-4 w-4" />Configuración</TabsTrigger>
        <TabsTrigger value="profile" className="py-2"><UserIcon className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
      </TabsList>
      <TabsContent value="bookings" className="mt-6">
        <BookingManagement />
      </TabsContent>
      <TabsContent value="calendar" className="mt-6">
        <BookingCalendar />
      </TabsContent>
      <TabsContent value="halls" className="mt-6">
        <HallManagement />
      </TabsContent>
      <TabsContent value="users" className="mt-6">
        <UserManagement />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <AppSettings />
      </TabsContent>
      <TabsContent value="profile" className="mt-6">
        <ProfileSettings />
      </TabsContent>
    </Tabs>
  );
}
