"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import type { User, Hall } from '@/lib/types';
import AvailabilityViewer from '../user/availability-viewer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface AdminBookingModalProps {
  date?: Date;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function AdminBookingModal({ date, isOpen, onClose, onBookingSuccess }: AdminBookingModalProps) {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [hallId, setHallId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const maxDuration = state.settings.maxBookingDuration || 6;

  const resetForm = () => {
    setHallId('');
    setUserId('');
    setTime('');
    setDuration(1);
    setPurpose('');
    setIsLoading(false);
    setSelectedDate(date); // Reset to initial prop date
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hallId || !userId || !time || !duration || !purpose || !selectedDate) {
      toast({ variant: 'destructive', title: 'Faltan Datos', description: 'Por favor, completa todos los campos, incluida la fecha.' });
      return;
    }
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');

    setIsLoading(true);

    try {
      dispatch({
        type: 'ADMIN_CREATE_BOOKING',
        payload: {
          userId,
          hallId,
          date: dateString,
          startTime: time,
          duration,
          eventDescription: purpose,
        },
      });

      setIsLoading(false);
      toast({ title: '¡Reserva creada con éxito!', description: 'La reserva ha sido añadida al calendario.' });
      handleClose();
      onBookingSuccess();

    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error al crear la reserva",
        description: error.message,
      });
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                    {selectedDate 
                        ? `Nueva Reserva para ${format(selectedDate, "PPP", { locale: es })}`
                        : 'Crear Nueva Reserva'}
                </DialogTitle>
                <DialogDescription>
                    Crea una nueva reserva. Será aprobada automáticamente.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} id="admin-booking-form" className="grid gap-4 py-4">
              
              {!date && (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(day) => {
                        setSelectedDate(day);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              <Select onValueChange={setHallId} value={hallId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un Salón" /></SelectTrigger>
                  <SelectContent>
                      {state.halls.map((hall: Hall) => (
                          <SelectItem key={hall.id} value={hall.id}>{hall.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              
              {hallId && selectedDate && (
                <AvailabilityViewer 
                    selectedDate={selectedDate} 
                    bookings={state.bookings} 
                    hallId={hallId} 
                />
              )}
              
              <Select onValueChange={setUserId} value={userId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un Usuario" /></SelectTrigger>
                  <SelectContent>
                      {state.users.map((user: User) => (
                          <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                      ))}
                  </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                  <Input 
                      id="startTime"
                      type="time"
                      step="900"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                  />
                  <Select value={String(duration)} onValueChange={(val) => setDuration(parseInt(val))}>
                      <SelectTrigger id="duration">
                          <SelectValue placeholder="Duración"/>
                      </SelectTrigger>
                      <SelectContent>
                          {Array.from({ length: maxDuration }, (_, i) => i + 1).map(h => (
                              <SelectItem key={h} value={String(h)}>{h} hora{h > 1 ? 's' : ''}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>

              <Input
                  id="purpose" 
                  placeholder="Motivo de la reserva" 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)} 
                  required 
              />
            </form>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" form="admin-booking-form" disabled={isLoading || !hallId || !userId || !time || !selectedDate}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Reserva
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}