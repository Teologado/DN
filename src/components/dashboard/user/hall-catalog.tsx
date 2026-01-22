"use client";

import { useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/contexts/app-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Tag, Image as ImageIcon } from "lucide-react";
import type { Hall } from "@/lib/types";
import BookingModal from "./booking-modal";

interface HallCatalogProps {
  setActiveTab: (value: string) => void;
}

export default function HallCatalog({ setActiveTab }: HallCatalogProps) {
  const { state } = useAppContext();
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Nuestros Salones</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.halls.map((hall) => {
          return (
            <Card key={hall.id} className="flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full bg-muted">
                  {hall.photoUrl ? (
                    <Image
                      src={hall.photoUrl}
                      alt={hall.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <CardTitle className="font-headline text-xl mb-2">{hall.name}</CardTitle>
                <CardDescription className="flex items-center text-muted-foreground mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  Capacidad: {hall.capacity} personas
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                    {hall.features.map(feature => (
                        <Badge key={feature} variant="secondary" className="font-normal"><Tag className="h-3 w-3 mr-1.5"/>{feature}</Badge>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setSelectedHall(hall)}>Reservar Ahora</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {selectedHall && (
        <BookingModal
          hall={selectedHall}
          isOpen={!!selectedHall}
          onClose={() => setSelectedHall(null)}
          onBookingSuccess={() => setActiveTab('bookings')}
        />
      )}
    </div>
  );
}
