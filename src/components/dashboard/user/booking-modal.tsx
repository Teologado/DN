"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/app-provider';
import { useUser } from '@/hooks/use-user';
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
import type { Hall } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import useMediaQuery from '@/hooks/use-media-query';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BookingModalProps {
  hall: Hall;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function BookingModal({ hall, isOpen, onClose, onBookingSuccess }: BookingModalProps) {
  const { state, dispatch } = useAppContext();
  const { user } = useUser();
  const { toast } = useToast();
  const { isMobile } = useMediaQuery();

  const [date, setDate] = useState<string>(''); // YYYY-MM-DD
  const [time, setTime] = useState<string>(''); // HH:mm
  const [duration, setDuration] = useState<number>(1);
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { bookingNoticeDays, maxBookingDuration, bookingWindowDays } = state.settings;

  const today = new Date();
  if (bookingNoticeDays > 0) {
    today.setDate(today.getDate() + bookingNoticeDays);
  }
  const minDate = today.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (bookingWindowDays || 90));
  const maxDateString = maxDate.toISOString().split('T')[0];

  const resetForm = () => {
    setDate('');
    setTime('');
    setDuration(1);
    setPurpose('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para reservar.' });
      return;
    }
    if (!date || !time || !duration || !purpose) {
      toast({ variant: 'destructive', title: 'Faltan Datos', description: 'Por favor, completa todos los campos.' });
      return;
    }

    setIsLoading(true);

    try {
      // Short delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({
        type: 'CREATE_BOOKING',
        payload: {
          userId: user.uid,
          hallId: hall.id,
          date: date,
          startTime: time,
          duration: duration,
          eventDescription: purpose,
        },
      });

      setIsLoading(false);
      toast({ title: '¡Solicitud enviada con éxito!', description: 'Tu solicitud está pendiente de aprobación.' });
      handleClose();
      onBookingSuccess();

    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error al Crear Reserva",
        description: error.message,
      });
    }
  }
  
  const content = (
      <form onSubmit={handleSubmit} id="booking-form" className="grid gap-6 p-4 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">Fecha de Reserva</label>
          <Input 
            id="date"
            type="date"
            value={date}
            min={minDate}
            max={maxDateString}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm font-medium">Hora de Inicio</label>
                <Input 
                    id="startTime"
                    type="time"
                    step="900" // 15 minutes
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Duración</label>
                <Select value={String(duration)} onValueChange={(val) => setDuration(parseInt(val))}>
                    <SelectTrigger id="duration">
                        <SelectValue placeholder="Duración"/>
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: maxBookingDuration || 6 }, (_, i) => i + 1).map(h => (
                            <SelectItem key={h} value={String(h)}>{h} hora{h > 1 ? 's' : ''}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
            <label htmlFor="purpose" className="text-sm font-medium">Motivo de la reserva</label>
            <Input 
                id="purpose" 
                placeholder="Ej: Reunión de Catequesis, Ensayo de Coro..." 
                value={purpose} 
                onChange={(e) => setPurpose(e.target.value)} 
                required
            />
        </div>
    </form>
  );

  if (isMobile) {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent side="bottom" className="rounded-t-xl h-auto max-h-[90dvh] flex flex-col p-0">
                 <SheetHeader className="text-left p-4 bg-primary text-primary-foreground rounded-t-xl">
                    <SheetTitle className="text-primary-foreground">{hall.name}</SheetTitle>
                    <SheetDescription className="text-primary-foreground/90">
                        Capacidad: {hall.capacity} personas
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-grow overflow-y-auto">
                    {content}
                </ScrollArea>
                <SheetFooter className="p-4 border-t bg-background grid grid-cols-2 gap-2">
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </SheetClose>
                    <Button type="submit" form="booking-form" disabled={isLoading || !date || !time}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Reserva
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md p-0">
            <DialogHeader className="p-6 bg-primary text-primary-foreground rounded-t-lg">
                <DialogTitle className="text-primary-foreground">{hall.name}</DialogTitle>
                <DialogDescription className="text-primary-foreground/90">
                    Capacidad: {hall.capacity} personas
                </DialogDescription>
            </DialogHeader>
            {content}
            <DialogFooter className="p-6 bg-secondary rounded-b-lg">
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" form="booking-form" disabled={isLoading || !date || !time}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar Reserva
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
