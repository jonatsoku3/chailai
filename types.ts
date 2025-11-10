export type Page = 'home' | 'about' | 'availability' | 'services' | 'profile' | 'booking' | 'technicianDashboard' | 'adminDashboard';
export type UserRole = 'customer' | 'technician' | 'admin';

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image: string;
}

// A base user profile stored in Firestore
export interface UserProfile {
  uid: string;      // Corresponds to Firebase Auth UID
  email: string;
  name: string;
  phone: string;
  lineId: string;
  profilePicture: string;
  role: UserRole;
  position?: string; // Only for employees
}

export interface Customer extends UserProfile {
  role: 'customer';
}

export interface Employee extends UserProfile {
  role: 'technician' | 'admin';
  position: string;
}

export type ActiveUser = Customer | Employee; // Maintained for type guarding

export interface Booking {
  id: string;
  customerId?: string; // customer uid
  customerName: string; // denormalized for easy display
  service: Service; // denormalized service data
  serviceId: string;
  employeeId: string; // employee uid
  date: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  deposit: number;
  finalPrice?: number;
  type: 'online' | 'walk-in';
}

export interface Payment {
    id: string;
    bookingId: string;
    paymentChannel: string;
    amount: number;
    proofImageUrl?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface BookingDetails {
    service: Service | null;
    date: Date | null;
}

export interface AvailabilityBlock {
  id: string;
  employeeId: string; // employee uid
  date: Date;
  type: 'break';
}
