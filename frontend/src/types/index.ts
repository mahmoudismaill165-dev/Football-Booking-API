export type Role = 'PLAYER' | 'OWNER' | 'ORGANIZER' | 'ADMIN';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Field {
  id: number;
  name: string;
  description?: string;
  address: string;
  pricePerHour: number;
  ownerId: number;
  owner?: User;
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: number;
  userId: number;
  fieldId: number;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  field?: Field;
  user?: User;
  payment?: Payment;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  transactionId?: string;
  proofImage?: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  fieldId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
  };
  field?: {
    id: number;
    name: string;
  };
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  organizerId: number;
  organizer?: User;
  participantsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TournamentParticipant {
  id: number;
  tournamentId: number;
  userId: number;
  joinedAt: string;
  user?: User;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  fields: number;
  bookings: number;
  payments: number;
  reviews: number;
  tournaments: number;
  revenue: number;
}
