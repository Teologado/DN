"use client";

import { Church, LogOut, Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppContext } from "@/contexts/app-provider";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Cambiar tema"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function NotificationsCenter() {
    const { state, dispatch } = useAppContext();
    const { user, profile } = useUser();
    
    const notifications = user ? state.notifications
        .filter(n => n.userId === user?.uid || (profile?.role === 'ADMIN' && n.userId === 'all-admins'))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
        : [];
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = (id: string) => {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs">{unreadCount}</Badge>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <Card className="border-0">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">Notificaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            {notifications.length > 0 ? (
                                <div className="space-y-4">
                                    {notifications.map((notif: Notification) => (
                                        <div key={notif.id} className={`p-2 rounded-lg ${!notif.isRead ? 'bg-secondary' : ''}`} onClick={() => handleMarkAsRead(notif.id)}>
                                            <p className="text-sm">{notif.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">Aún no hay notificaciones.</p>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}


function UserNav() {
  const { user, profile } = useUser();
  const { dispatch } = useAppContext();
  const { toast } = useToast();

  const handleLogout = () => {
    try {
      dispatch({ type: 'LOGOUT' });
      toast({ title: "Sesión Cerrada", description: "Has cerrado sesión exitosamente." });
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    }
  };

  if (!user) return null;
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const displayName = profile?.name || user.displayName || user.email || "Usuario";
  const displayEmail = user.email || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem disabled>
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
            </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const { state } = useAppContext();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Church className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold font-headline">{state.settings.appName}</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            {user && <NotificationsCenter />}
            <ThemeToggle />
            <UserNav />
        </div>
      </div>
    </header>
  );
}
