import type { AppState, Hall, Booking, Notification, AppSettings, User, UserRole } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { areIntervalsOverlapping, parse, addHours } from 'date-fns';

export type Action =
  | { type: 'INITIALIZE_STATE'; payload: AppState }
  | { type: 'CREATE_HALL'; payload: Omit<Hall, 'id'> }
  | { type: 'UPDATE_HALL'; payload: Hall }
  | { type: 'DELETE_HALL'; payload: string }
  | { type: 'CREATE_BOOKING'; payload: Omit<Booking, 'id' | 'status' | 'createdAt' | 'rejectionReason'> }
  | { type: 'ADMIN_CREATE_BOOKING'; payload: Omit<Booking, 'id' | 'status' | 'createdAt' | 'rejectionReason'> }
  | { type: 'UPDATE_BOOKING_STATUS'; payload: { bookingId: string; status: 'Approved' | 'Rejected'; rejectionReason?: string } }
  | { type: 'DELETE_BOOKING'; payload: { bookingId: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'createdAt' | 'isRead'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'REGISTER_USER'; payload: Omit<User, 'id' | 'uid' | 'role'> & {password: string} }
  | { type: 'LOGIN'; payload: {email: string, password: string} }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: { userId: string; name: string } }
  | { type: 'CHANGE_PASSWORD'; payload: { userId: string; currentPassword: string; newPassword: string } }
  | { type: 'ADMIN_UPDATE_USER_ROLE'; payload: { userId: string; role: UserRole } }
  | { type: 'ADMIN_DELETE_USER'; payload: { userId: string } };


export const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INITIALIZE_STATE':
      return action.payload;
    
    case 'CREATE_HALL': {
      const newHall: Hall = { id: `hall-${Date.now()}`, ...action.payload };
      return { ...state, halls: [...state.halls, newHall] };
    }

    case 'UPDATE_HALL':
      return {
        ...state,
        halls: state.halls.map(h => h.id === action.payload.id ? action.payload : h),
      };

    case 'DELETE_HALL':
        const bookingsToKeep = state.bookings.filter(b => b.hallId !== action.payload);
        return {
            ...state,
            halls: state.halls.filter(h => h.id !== action.payload),
            bookings: bookingsToKeep,
        };

    case 'CREATE_BOOKING': {
      const { userId, date, startTime, duration, hallId } = action.payload;

      const pendingBookingsCount = state.bookings.filter(
        b => b.userId === userId && b.status === 'Pending'
      ).length;

      if (pendingBookingsCount >= state.settings.maxPendingBookings) {
        throw new Error(`Has alcanzado el límite de ${state.settings.maxPendingBookings} reservas pendientes. Espera a que se aprueben para poder crear más.`);
      }

      const bookingStart = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const bookingEnd = addHours(bookingStart, duration);

      const conflictingBooking = state.bookings.find(b => {
        if (b.hallId !== hallId || b.date !== date || b.status === 'Rejected') return false;
        
        const existingStart = parse(`${b.date} ${b.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
        const existingEnd = addHours(existingStart, b.duration);
        
        return areIntervalsOverlapping({ start: bookingStart, end: bookingEnd }, { start: existingStart, end: existingEnd }, { inclusive: false });
      });

      if (conflictingBooking) {
        throw new Error(`El horario seleccionado ya no está disponible. Entra en conflicto con una reserva existente.`);
      }

      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      const hallName = state.halls.find(h => h.id === newBooking.hallId)?.name;
      const bookingDate = format(new Date(`${newBooking.date}T00:00:00`), 'PPP', { locale: es });
      const adminNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: 'all-admins',
        message: `Nueva solicitud para ${hallName} el ${bookingDate}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        bookingId: newBooking.id,
      };
      return {
        ...state,
        bookings: [...state.bookings, newBooking],
        notifications: [...state.notifications, adminNotification],
      };
    }
    
    case 'ADMIN_CREATE_BOOKING': {
      const { date, startTime, duration, hallId, userId } = action.payload;
      const bookingStart = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const bookingEnd = addHours(bookingStart, duration);

      const conflictingBooking = state.bookings.find(b => {
        if (b.hallId !== hallId || b.date !== date || b.status === 'Rejected') return false;
        
        const existingStart = parse(`${b.date} ${b.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
        const existingEnd = addHours(existingStart, b.duration);
        
        return areIntervalsOverlapping({ start: bookingStart, end: bookingEnd }, { start: existingStart, end: existingEnd }, { inclusive: false });
      });

      if (conflictingBooking) {
        throw new Error(`El horario seleccionado ya no está disponible. Entra en conflicto con una reserva existente.`);
      }

      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        status: 'Approved', // Approved by default
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      
      const hallName = state.halls.find(h => h.id === newBooking.hallId)?.name;
      const bookingDate = format(new Date(`${newBooking.date}T00:00:00`), 'PPP', { locale: es });
      const userNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: userId,
        message: `ℹ️ Un administrador ha creado una reserva para ti en ${hallName} el ${bookingDate}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        bookingId: newBooking.id,
      };

      return {
        ...state,
        bookings: [...state.bookings, newBooking],
        notifications: [...state.notifications, userNotification],
      };
    }

    case 'UPDATE_BOOKING_STATUS': {
      const { bookingId, status, rejectionReason } = action.payload;
      const booking = state.bookings.find(b => b.id === bookingId);
      if (!booking) return state;

      const hallName = state.halls.find(h => h.id === booking.hallId)?.name;
      const bookingDate = format(new Date(`${booking.date}T00:00:00`), 'PPP', { locale: es });
      
      let message = status === 'Approved' 
        ? `✅ Tu reserva para ${hallName} el ${bookingDate} ha sido Aprobada.`
        : `❌ Tu reserva para ${hallName} el ${bookingDate} ha sido Rechazada.`;

      if (status === 'Rejected' && rejectionReason) {
        message += ` Motivo: ${rejectionReason}`;
      }

      const userNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: booking.userId,
        message: message,
        isRead: false,
        createdAt: new Date().toISOString(),
        bookingId: bookingId,
      };

      return {
        ...state,
        bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status, rejectionReason: status === 'Rejected' ? rejectionReason : undefined } : b),
        notifications: [...state.notifications, userNotification],
      };
    }

    case 'DELETE_BOOKING': {
        const { bookingId } = action.payload;
        const bookingToDelete = state.bookings.find(b => b.id === bookingId);
        if (!bookingToDelete) {
            return state;
        }

        const hallName = state.halls.find(h => h.id === bookingToDelete.hallId)?.name;
        const bookingDate = format(new Date(`${bookingToDelete.date}T00:00:00`), 'PPP', { locale: es });
        const userNotification: Notification = {
            id: `notif-${Date.now()}`,
            userId: bookingToDelete.userId,
            message: `ℹ️ Tu reserva para ${hallName} el ${bookingDate} ha sido eliminada por un administrador.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            bookingId: bookingId,
        };

        return {
            ...state,
            bookings: state.bookings.filter(b => b.id !== bookingId),
            notifications: [...state.notifications, userNotification],
        };
    }

    case 'ADD_NOTIFICATION': {
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            isRead: false,
            createdAt: new Date().toISOString(),
            ...action.payload,
        };
        return {
            ...state,
            notifications: [...state.notifications, newNotification],
        };
    }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, isRead: true } : n),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'REGISTER_USER': {
      if (state.users.find(u => u.email === action.payload.email)) {
        throw new Error('Ya existe una cuenta con este correo electrónico.');
      }
      const isFirstUser = state.users.length === 0;
      const id = `user-${Date.now()}`;
      const newUser: User = {
        id,
        uid: id,
        role: isFirstUser ? 'ADMIN' : 'USER',
        ...action.payload,
      };
      return {
        ...state,
        users: [...state.users, newUser],
      };
    }

    case 'LOGIN': {
      const user = state.users.find(u => u.email === action.payload.email);

      if (!user || user.password !== action.payload.password) {
        throw new Error("Correo electrónico o contraseña no válidos.");
      }

      return {
        ...state,
        currentUser: user,
      };
    }

    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
      };

    case 'UPDATE_PROFILE': {
        const { userId, name } = action.payload;
        return {
            ...state,
            users: state.users.map(u => (u.id === userId ? { ...u, name } : u)),
            currentUser: state.currentUser?.id === userId ? { ...state.currentUser, name } : state.currentUser,
        };
    }

    case 'CHANGE_PASSWORD': {
        const { userId, currentPassword, newPassword } = action.payload;
        const userIndex = state.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error("Usuario no encontrado.");
        }
        const user = state.users[userIndex];
        if (user.password !== currentPassword) {
            throw new Error("La contraseña actual es incorrecta.");
        }
        const updatedUser = { ...user, password: newPassword };
        const updatedUsers = [...state.users];
        updatedUsers[userIndex] = updatedUser;
        
        return {
            ...state,
            users: updatedUsers,
            currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
        };
    }
    
    case 'ADMIN_UPDATE_USER_ROLE': {
        const { userId, role } = action.payload;
        if (state.currentUser?.role !== 'ADMIN') {
          throw new Error('No tienes permiso para realizar esta acción.');
        }
        return {
            ...state,
            users: state.users.map(u => u.id === userId ? { ...u, role } : u),
        };
    }

    case 'ADMIN_DELETE_USER': {
        const { userId } = action.payload;
        if (state.currentUser?.role !== 'ADMIN') {
          throw new Error('No tienes permiso para realizar esta acción.');
        }
        if (state.currentUser?.id === userId) {
          throw new Error('No puedes eliminar tu propia cuenta.');
        }
        return {
            ...state,
            users: state.users.filter(u => u.id !== userId),
            bookings: state.bookings.filter(b => b.userId !== userId),
            notifications: state.notifications.filter(n => n.userId !== userId),
        };
    }


    default:
      return state;
  }
};
