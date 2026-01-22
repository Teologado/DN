import type { AppState } from './types';

export const initialData: AppState = {
  halls: [
    {
      id: 'hall-1',
      name: 'Gran Salón San Pedro',
      capacity: 150,
      features: ['Proyector', 'Sistema de Sonido', 'Escenario', 'Acceso a Cocina'],
      photoUrl: 'https://images.unsplash.com/photo-1759477274116-e3cb02d2b9d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxldmVudCUyMGhhbGx8ZW58MHx8fHwxNzY4NTc1ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'hall-2',
      name: 'Sala de Reuniones Santa María',
      capacity: 25,
      features: ['Pizarra Blanca', 'Cafetera'],
      photoUrl: 'https://images.unsplash.com/photo-1579488081757-b212dbd6ee72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxtZWV0aW5nJTIwcm9vbXxlbnwwfHx8fDE3Njg0OTA2Njl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'hall-3',
      name: 'Sala de Conferencias San José',
      capacity: 50,
      features: ['Proyector', 'Teléfono de Conferencia', 'Pizarra Blanca'],
      photoUrl: 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjb25mZXJlbmNlJTIwcm9vbXxlbnwwfHx8fDE3Njg1Njg3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
     {
      id: 'hall-4',
      name: 'Centro Juvenil San Francisco',
      capacity: 80,
      features: ['Escenario', 'Juegos', 'Asientos Informales'],
      photoUrl: 'https://images.unsplash.com/photo-1600034513225-f1df31c23d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjb21tdW5pdHklMjBjZW50ZXJ8ZW58MHx8fHwxNzY4NTc1ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ],
  bookings: [],
  notifications: [],
  settings: {
    appName: 'Reserva de Salones Parroquiales',
    appLogo: 'Church',
    maxBookingDuration: 6,
    bookingNoticeDays: 1,
    bookingWindowDays: 90,
    maxPendingBookings: 3,
  },
  users: [],
  currentUser: null,
};
