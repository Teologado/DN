"use client";

import { useAppContext } from "@/contexts/app-provider";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const statusConfig: Record<BookingStatus, { text: string; icon: React.ReactNode; className: string }> = {
  Approved: {
    text: 'Aprobada',
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: 'bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/50 dark:text-green-300',
  },
  Pending: {
    text: 'Pendiente',
    icon: <Clock className="h-4 w-4" />,
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
  Rejected: {
    text: 'Rechazada',
    icon: <XCircle className="h-4 w-4" />,
    className: 'bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/50 dark:text-red-300',
  }
};


export default function MyBookings() {
  const { state } = useAppContext();
  const { user, isLoading } = useUser();

  const myBookings = state.bookings
    .filter(b => b.userId === user?.uid)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getHallName = (hallId: string) => {
    return state.halls.find(h => h.id === hallId)?.name || "Salón Desconocido";
  };
  
  if (isLoading) {
    return (
       <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
           <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline font-bold">Mis Reservas</CardTitle>
        <CardDescription>Aquí están todas tus solicitudes de reserva y sus estados.</CardDescription>
      </CardHeader>
      <CardContent>
        {myBookings.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <ScrollArea className="h-96">
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Salón</TableHead>
                        <TableHead>Fecha y Hora</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myBookings.map(booking => {
                        const config = statusConfig[booking.status];
                        return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{getHallName(booking.hallId)}</TableCell>
                            <TableCell>{format(new Date(`${booking.date}T00:00:00`), "PPP", { locale: es })} a las {booking.startTime} ({booking.duration}h)</TableCell>
                            <TableCell>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="truncate max-w-[250px] cursor-help">{booking.eventDescription}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{booking.eventDescription}</p>
                                </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="text-center">
                              {booking.status === 'Rejected' && booking.rejectionReason ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className={cn("gap-2 border-0 font-semibold w-fit cursor-help", config.className)}>
                                      {config.icon}
                                      <span>{config.text}</span>
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-semibold">Motivo del rechazo:</p>
                                    <p>{booking.rejectionReason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Badge variant="outline" className={cn("gap-2 border-0 font-semibold w-fit", config.className)}>
                                  {config.icon}
                                  <span>{config.text}</span>
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              </ScrollArea>
            </div>

            {/* Mobile Card View */}
             <div className="md:hidden">
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4 pr-2">
                  {myBookings.map(booking => {
                    const config = statusConfig[booking.status];
                    return (
                      <Card key={booking.id} className="flex flex-col rounded-xl overflow-hidden shadow-md">
                          <CardHeader className="pb-4">
                              <CardTitle className="font-headline text-lg break-words">{getHallName(booking.hallId)}</CardTitle>
                              <Badge variant="outline" className={cn("gap-2 border-0 font-semibold w-fit", config.className)}>
                                {config.icon}
                                <span>{config.text}</span>
                              </Badge>
                          </CardHeader>
                          <CardContent className="flex-grow flex flex-col justify-between space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="font-semibold">{format(new Date(`${booking.date}T00:00:00`), "PPP", { locale: es })}</p>
                                    <p className="text-muted-foreground">{booking.startTime} por {booking.duration}h</p>
                                </div>
                            </div>
                            <Card className="flex-grow flex flex-col bg-muted/50">
                                <CardHeader className="p-3">
                                    <CardTitle className="text-base flex items-center gap-2 font-semibold">
                                        <Info className="h-4 w-4 text-muted-foreground"/>
                                        Motivo del Evento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 flex-grow">
                                    <p className="text-muted-foreground break-words">
                                        {booking.eventDescription}
                                    </p>
                                </CardContent>
                            </Card>
                             {booking.status === 'Rejected' && booking.rejectionReason && (
                                <Card className="bg-destructive/10 border-destructive/20">
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-sm flex items-center gap-2 font-semibold text-destructive">
                                            <XCircle className="h-4 w-4"/>
                                            Motivo del Rechazo
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0 text-sm text-destructive/90">
                                        <p className="break-words">{booking.rejectionReason}</p>
                                    </CardContent>
                                </Card>
                            )}
                          </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-16">
             <h3 className="text-lg font-semibold">Aún no has realizado ninguna reserva.</h3>
             <p className="mt-2 text-sm">¡Explora nuestros salones y haz tu primera reserva!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
