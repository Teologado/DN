export type UserRole = 'ADMIN' | 'USER';

// WARNING: Storing passwords, even in localStorage, is highly insecure and not suitable for production.
// This is for local prototyping purposes only.
export interface User {
  id: string;
  uid: string; // For compatibility, same as id
  email: string;
  role: UserRole;
  name: string;
  password?: string;
}

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  photoUrl: string;
}

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Booking {
  id: string;
  userId: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:mm"
  duration: number; // in hours
  status: BookingStatus;
  createdAt: string; // ISO string
  eventDescription: string;
  rejectionReason?: string;
}

export interface Notification {
  id: string;
  userId: string; // 'all-admins' or a specific user UID
  message: string;
  isRead: boolean;
  createdAt: string; // ISO string
  bookingId?: string;
}

export interface AppSettings {
  appName: string;
  appLogo: string; // icon name from lucide-react
  maxBookingDuration: number;
  bookingNoticeDays: number;
  bookingWindowDays: number;
  maxPendingBookings: number;
}

export interface AppState {
  halls: Hall[];
  bookings: Booking[];
  notifications: Notification[];
  settings: AppSettings;
  users: User[];
  currentUser: User | null;
}
