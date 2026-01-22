"use client";

import type { Booking } from '@/lib/types';
import { parse, format, addHours, areIntervalsOverlapping } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


interface AvailabilityViewerProps {
  selectedDate: Date;
  bookings: Booking[];
  hallId: string;
}

const timeSlots = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // 08:00 to 22:00

export default function AvailabilityViewer({ selectedDate, bookings, hallId }: AvailabilityViewerProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const getSlotStatus = (slot: string): { status: 'Free' | 'Pending' | 'Occupied'; tooltip: string } => {
    const slotStart = parse(`${dateString} ${slot}`, 'yyyy-MM-dd HH:mm', new Date());
    const slotEnd = addHours(slotStart, 1);

    const relevantBookings = bookings.filter(
      booking => booking.hallId === hallId && booking.date === dateString && booking.status !== 'Rejected'
    );

    for (const booking of relevantBookings) {
      const bookingStart = parse(`${booking.date} ${booking.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const bookingEnd = addHours(bookingStart, booking.duration);
      
      if (areIntervalsOverlapping({ start: slotStart, end: slotEnd }, { start: bookingStart, end: bookingEnd }, { inclusive: false })) {
        if (booking.status === 'Approved') {
          return { status: 'Occupied', tooltip: `Ocupado desde las ${booking.startTime} por ${booking.duration}h` };
        }
        if (booking.status === 'Pending') {
          return { status: 'Pending', tooltip: `Solicitud pendiente desde las ${booking.startTime} por ${booking.duration}h` };
        }
      }
    }
    return { status: 'Free', tooltip: 'Hora libre' };
  };

  const statusStyles = {
    Free: 'bg-green-500',
    Pending: 'bg-yellow-500',
    Occupied: 'bg-red-500',
  };

  return (
    <TooltipProvider>
      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 pb-4">
                {timeSlots.map(slot => {
                const { status, tooltip } = getSlotStatus(slot);
                return (
                  <Tooltip key={slot}>
                    <TooltipTrigger asChild>
                      <div className={cn("text-center p-2 rounded-lg text-white text-sm font-semibold w-20 shrink-0", statusStyles[status])}>
                          {slot}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="flex justify-center items-center space-x-4 text-xs">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span>Libre</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span>Pendiente</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span>Ocupado</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
