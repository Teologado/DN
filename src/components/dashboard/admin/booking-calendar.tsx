"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/app-provider";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, PlusCircle, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Booking, BookingStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AdminBookingModal from "./admin-booking-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const bookingStatusColors: Record<"Approved" | "Pending", string> = {
    Approved: 'bg-primary/80 text-primary-foreground',
    Pending: 'bg-yellow-400/80 text-yellow-900',
};

async function exportToPdf(bookings: Booking[], users: any[], halls: any[], month: Date) {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    
    doc.text(`Reporte de Reservas - ${format(month, 'MMMM yyyy', { locale: es })}`, 14, 15);

    const tableData = bookings.map(b => [
        halls.find(h => h.id === b.hallId)?.name || 'N/A',
        users.find(u => u.id === b.userId)?.name || 'N/A',
        format(new Date(`${b.date}T00:00:00`), "PPP", { locale: es }),
        `${b.startTime} (${b.duration}h)`,
        b.eventDescription,
        b.status
    ]);
    
    autoTable(doc, {
        head: [['Salón', 'Usuario', 'Fecha', 'Hora', 'Motivo', 'Estado']],
        body: tableData,
        startY: 20,
    });
    
    doc.save(`reporte_reservas_${format(month, 'yyyy-MM')}.pdf`);
}


export default function BookingCalendar() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState<Date | null>(null);


  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleDayClick = (day: Date) => {
    setSelectedDateForBooking(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDateForBooking(null);
  };

  const handleDeleteBooking = (bookingId: string) => {
    dispatch({ type: 'DELETE_BOOKING', payload: { bookingId } });
    toast({
        title: "Reserva Eliminada",
        description: "La reserva ha sido eliminada del calendario.",
    });
  };

  if (!currentMonth) {
    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-3xl font-headline font-bold">Calendario de Reservas</CardTitle>
                    <CardDescription>Vista mensual de todas las reservas aprobadas y pendientes.</CardDescription>
                </div>
                 <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" />Exportar como PDF</Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" disabled>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-8 w-48" />
                    <Button variant="outline" size="icon" disabled>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Skeleton className="h-96 w-full" />
            </CardContent>
        </Card>
    );
  }

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth, { locale: es }),
    end: endOfWeek(lastDayOfMonth, { locale: es }),
  });

  const bookingsForMonth = state.bookings.filter(b => {
    const bookingDate = new Date(`${b.date}T00:00:00`);
    return bookingDate >= startOfWeek(firstDayOfMonth, { locale: es }) && bookingDate <= endOfWeek(lastDayOfMonth, { locale: es }) && b.status !== 'Rejected';
  });

  const handleExport = () => {
    const bookingsInCurrentMonth = state.bookings.filter(b => isSameMonth(new Date(`${b.date}T00:00:00`), currentMonth));
    if (bookingsInCurrentMonth.length === 0) {
      toast({ variant: 'destructive', title: 'No hay Reservas', description: 'No hay reservas para exportar en este mes.'});
      return;
    }
    exportToPdf(bookingsInCurrentMonth, state.users, state.halls, currentMonth);
  };
  
  const getUserName = (userId: string) => state.users.find(u => u.id === userId)?.name || "N/A";
  const getHallName = (hallId: string) => state.halls.find(h => h.id === hallId)?.name || "N/A";

  const getStatusInSpanish = (status: BookingStatus) => {
      switch (status) {
          case 'Approved': return 'Aprobada';
          case 'Pending': return 'Pendiente';
          case 'Rejected': return 'Rechazada';
      }
  }
  
  const dayHeaders = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-3xl font-headline font-bold">Calendario de Reservas</CardTitle>
                <CardDescription>Haz clic en un día para añadir una reserva, o en una reserva para verla o eliminarla.</CardDescription>
            </div>
             <Button onClick={handleExport} variant="outline"><Download className="mr-2 h-4 w-4" />Exportar como PDF</Button>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-headline font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h2>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            
            {/* Desktop: Grid Calendar */}
            <div className="hidden md:block">
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-7 border-t border-l min-w-[56rem]">
                        {dayHeaders.map(day => (
                          <div key={day} className="p-2 text-center font-bold text-sm border-b border-r bg-secondary">{day}</div>
                        ))}
                        {daysInMonth.map((day, index) => {
                        const dayBookings = bookingsForMonth.filter(b => isSameDay(new Date(`${b.date}T00:00:00`), day));
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "h-40 border-b border-r p-1 flex flex-col overflow-y-auto relative group",
                                    isSameMonth(day, currentMonth) ? "bg-background" : "bg-muted/50",
                                    isSameMonth(day, currentMonth) && "cursor-pointer hover:bg-secondary/50 transition-colors"
                                )}
                                onClick={() => isSameMonth(day, currentMonth) && handleDayClick(day)}
                            >
                                {isSameMonth(day, currentMonth) && (
                                    <>
                                        <div className="flex justify-center md:justify-start items-center">
                                            <span className={cn("font-medium text-sm text-center md:text-left", isSameDay(day, new Date()) && "text-primary font-bold")}>
                                                {format(day, "d")}
                                            </span>
                                        </div>
                                         <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlusCircle className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-grow space-y-1 mt-1" onClick={(e) => e.stopPropagation()}>
                                            {dayBookings.map(booking => (
                                            <Popover key={booking.id}>
                                                <PopoverTrigger asChild>
                                                <div className={cn("text-xs rounded px-1 py-0.5 cursor-pointer truncate", bookingStatusColors[booking.status as 'Approved' | 'Pending'])}>
                                                    {booking.startTime} - {getHallName(booking.hallId)}
                                                </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64">
                                                    <h4 className="font-bold">{getHallName(booking.hallId)}</h4>
                                                    <p className="text-sm">Usuario: {getUserName(booking.userId)}</p>
                                                    <p className="text-sm">Hora: {booking.startTime} ({booking.duration}h)</p>
                                                    <p className="text-sm font-semibold">Motivo: <span className="font-normal">{booking.eventDescription}</span></p>
                                                    <p className="text-sm">Estado: <span className="font-semibold">{getStatusInSpanish(booking.status)}</span></p>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" className="w-full mt-4"><Trash2 className="mr-2 h-4 w-4" />Eliminar</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esto eliminará permanentemente la reserva. No podrás deshacer esta acción.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteBooking(booking.id)}>Eliminar</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </PopoverContent>
                                            </Popover>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile: Agenda List */}
            <div className="md:hidden">
                {daysInMonth.filter(d => isSameMonth(d, currentMonth)).map(day => {
                    const dayBookings = bookingsForMonth.filter(b => isSameDay(new Date(`${b.date}T00:00:00`), day));
                    
                    return (
                        <div key={day.toISOString()} className="py-4 border-b last:border-b-0">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className={cn("font-semibold text-base capitalize", isSameDay(day, new Date()) && "text-primary")}>
                                    {format(day, "EEEE, d", { locale: es })}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={() => handleDayClick(day)}>
                                    <PlusCircle className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                            {dayBookings.length > 0 ? (
                                <div className="space-y-2">
                                    {dayBookings.map(booking => (
                                        <div key={booking.id} className={cn("rounded-lg p-3 text-sm relative", bookingStatusColors[booking.status as 'Approved' | 'Pending'])}>
                                            <div className="pr-10">
                                              <p className="font-bold">{booking.startTime} ({booking.duration}h) - {getHallName(booking.hallId)}</p>
                                              <p><span className="font-semibold">Usuario:</span> {getUserName(booking.userId)}</p>
                                              <p><span className="font-semibold">Motivo:</span> {booking.eventDescription}</p>
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground h-8 w-8 shrink-0">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción eliminará permanentemente la reserva. No podrás deshacer esta acción.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteBooking(booking.id)}>Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay reservas para este día.</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {isModalOpen && selectedDateForBooking && (
                <AdminBookingModal
                    date={selectedDateForBooking}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onBookingSuccess={handleCloseModal}
                />
            )}
        </CardContent>
    </Card>
  );
}
