# **App Name**: Parish Hall Booking

## Core Features:

- User Authentication: Secure registration and login system with ADMIN and USER roles, password change functionality, all data saved in local storage.
- Hall Catalog: Display halls with photos, capacity, and features fetched from local storage.
- Booking Form: Form with date, time, and duration selectors, along with real-time availability check, all saved to local storage.
- User Dashboard: List 'My Bookings' with statuses (Pending, Approved, Rejected), with data coming from local storage.
- Admin Hall Management: Admin CRUD interface for managing halls stored in local storage.
- Admin Booking Management: Approve/reject user booking requests, with updates saved to local storage. Monthly calendar view of bookings.
- Reporting: Export current month's booking list to PDF using jspdf and jspdf-autotable.
- App Configuration: Admin tool to change app name and logo (icon class or URL) in local storage.
- Notification System: Internal notification center for admins (new requests) and users (booking status changes), data saved in local storage.
- PWA Capabilities: manifest.json and service-worker.js for offline functionality and resource caching.

## Style Guidelines:

- Primary color: Professional blue (#3B82F6) evoking trust and stability.
- Background color: Light gray (#F9FAFB) in light mode, dark gray (#111827) in dark mode, ensuring comfortable contrast.
- Accent color: Teal (#2DD4BF) to highlight interactive elements.
- Headline font: 'Poppins', sans-serif, for a modern and clean appearance.
- Body font: 'PT Sans', sans-serif, for readability.
- Lucide-react icons for a consistent and modern look.
- Clean design with rounded cards (rounded-2xl) and clear sections.
- Subtle hover effects and loading transitions for enhanced user experience.