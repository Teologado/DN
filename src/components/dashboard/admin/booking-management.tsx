"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/app-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Calendar, ClockIcon, Info, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminBookingModal from "./admin-booking-modal";

export default function BookingManagement() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [bookingToReject, setBookingToReject] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pendingBookings = state.bookings
    .filter(b => b.status === 'Pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getUserName = (userId: string) => state.users.find(u => u.id === userId)?.name || "Usuario Desconocido";
  const getHallName = (hallId: string) => state.halls.find(h => h.id === hallId)?.name || "Salón Desconocido";

  const handleApprove = (bookingId: string) => {
    dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { bookingId, status: 'Approved' } });
    toast({ title: 'Reserva Aprobada', description: "El usuario ha sido notificado." });
  };

  const handleReject = () => {
    if (!bookingToReject) return;
    dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { bookingId: bookingToReject, status: 'Rejected', rejectionReason } });
    toast({ title: 'Reserva Rechazada', description: "El usuario ha sido notificado." });
    setBookingToReject(null);
    setRejectionReason("");
  };
  
  const handleBookingSuccess = () => {
    setIsCreateModalOpen(false);
  }

  return (
    <>
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-3xl font-headline font-bold">Solicitudes de Reserva</CardTitle>
                <CardDescription>Aprueba o rechaza nuevas solicitudes de reserva de los usuarios.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Crear Reserva</Button>
        </CardHeader>
        <CardContent>
          {pendingBookings.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ScrollArea className="h-72">
                  <TooltipProvider>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Salón</TableHead>
                          <TableHead>Fecha y Hora</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingBookings.map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{getUserName(booking.userId)}</TableCell>
                            <TableCell>{getHallName(booking.hallId)}</TableCell>
                            <TableCell>
                              {format(new Date(`${booking.date}T00:00:00`), "PPP", { locale: es })} a las {booking.startTime} ({booking.duration}h)
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="truncate max-w-[200px] cursor-help">{booking.eventDescription}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{booking.eventDescription}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="icon" className="text-green-600 hover:text-green-600 hover:bg-green-100" onClick={() => handleApprove(booking.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => setBookingToReject(booking.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TooltipProvider>
                </ScrollArea>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                  <ScrollArea className="h-96">
                      <div className="space-y-4 pr-2">
                          {pendingBookings.map(booking => (
                              <Card key={booking.id} className="p-4 flex flex-col gap-3">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <p className="font-semibold text-base">{getUserName(booking.userId)}</p>
                                          <p className="text-sm text-muted-foreground">{getHallName(booking.hallId)}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Button variant="outline" size="icon" className="text-green-600 hover:text-green-600 hover:bg-green-100 h-9 w-9" onClick={() => handleApprove(booking.id)}>
                                              <Check className="h-4 w-4" />
                                          </Button>
                                          <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => setBookingToReject(booking.id)}>
                                              <X className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  </div>
                                  
                                  <div className="text-sm space-y-2 text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4" />
                                          <span>{format(new Date(`${booking.date}T00:00:00`), "PPP", { locale: es })}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <ClockIcon className="h-4 w-4" />
                                          <span>{booking.startTime} ({booking.duration}h)</span>
                                      </div>
                                  </div>
                                  <Card className="bg-muted/50">
                                      <CardHeader className="p-3">
                                          <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                                              <Info className="h-4 w-4"/>
                                              Motivo
                                          </CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0 text-sm text-muted-foreground">
                                          <p className="break-words">{booking.eventDescription}</p>
                                      </CardContent>
                                  </Card>
                              </Card>
                          ))}
                      </div>
                  </ScrollArea>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">No hay solicitudes de reserva pendientes.</p>
          )}
        </CardContent>
      </Card>
      
      {isCreateModalOpen && (
        <AdminBookingModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onBookingSuccess={handleBookingSuccess}
        />
      )}

      <AlertDialog open={!!bookingToReject} onOpenChange={(open) => { if (!open) { setBookingToReject(null); setRejectionReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Motivo del Rechazo</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, explica brevemente por qué se rechaza esta solicitud de reserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="rejection-reason">Motivo</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Ej: Conflicto de horario con otro evento, mantenimiento..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setBookingToReject(null); setRejectionReason(""); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={!rejectionReason}>Rechazar Solicitud</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
