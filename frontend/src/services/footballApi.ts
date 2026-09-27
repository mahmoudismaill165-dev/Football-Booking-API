import { request } from './api';
import {
  Field,
  Booking,
  Tournament,
  Review,
  NotificationItem,
  User,
  AdminStats,
  Role,
} from '../types';
import {
  mockFields,
  mockBookings,
  mockTournaments,
  mockReviews,
  mockNotifications,
  mockUsers,
  mockAdminStats,
} from './mockData';

let localFields = [...mockFields];
let localBookings = [...mockBookings];
let localTournaments = [...mockTournaments];
let localReviews = [...mockReviews];
let localNotifications = [...mockNotifications];
let localUsers = [...mockUsers];

export const footballApi = {
  // Demo Mode check
  isDemoMode: (): boolean => {
    const val = localStorage.getItem('demo_mode');
    return val === null ? true : val === 'true';
  },

  setDemoMode: (val: boolean) => {
    localStorage.setItem('demo_mode', String(val));
  },

  // ---------------- AUTH ----------------
  register: async (payload: { name: string; email: string; password: string; phone?: string }) => {
    if (footballApi.isDemoMode()) {
      const newUser: User = {
        id: localUsers.length + 1,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: 'PLAYER',
        createdAt: new Date().toISOString(),
      };
      localUsers.push(newUser);
      return { user: newUser, token: 'demo-jwt-token-' + newUser.id };
    }
    const res = await request<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  login: async (payload: { email: string; password: string }) => {
    if (footballApi.isDemoMode()) {
      const found = localUsers.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
      if (found) {
        return { user: found, token: 'demo-jwt-token-' + found.id };
      }
      // If not found in mock, create a player on the fly
      const fallbackUser: User = {
        id: localUsers.length + 1,
        name: payload.email.split('@')[0],
        email: payload.email,
        role: 'PLAYER',
      };
      localUsers.push(fallbackUser);
      return { user: fallbackUser, token: 'demo-jwt-token-' + fallbackUser.id };
    }
    const res = await request<{ message: string; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  getProfile: async () => {
    if (footballApi.isDemoMode()) {
      return { user: localUsers[0] };
    }
    return await request<{ message: string; user: User }>('/auth/profile');
  },

  getAdminStats: async (): Promise<AdminStats> => {
    if (footballApi.isDemoMode()) {
      return {
        ...mockAdminStats,
        users: localUsers.length,
        fields: localFields.length,
        bookings: localBookings.length,
        reviews: localReviews.length,
        tournaments: localTournaments.length,
      };
    }
    try {
      const res = await request<{ message: string; stats: AdminStats }>('/auth/admin/stats');
      return res.stats;
    } catch {
      return mockAdminStats;
    }
  },

  getAdminUsers: async (): Promise<User[]> => {
    if (footballApi.isDemoMode()) {
      return localUsers;
    }
    try {
      const res = await request<{ message: string; users: User[] }>('/auth/admin/users');
      return res.users;
    } catch {
      return localUsers;
    }
  },

  updateUserRole: async (userId: number, role: Role) => {
    if (footballApi.isDemoMode()) {
      localUsers = localUsers.map((u) => (u.id === userId ? { ...u, role } : u));
      return { message: 'User role updated', user: localUsers.find((u) => u.id === userId) };
    }
    return await request<{ message: string; user: User }>(`/auth/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  deleteUser: async (userId: number) => {
    if (footballApi.isDemoMode()) {
      localUsers = localUsers.filter((u) => u.id !== userId);
      return { message: 'User deleted' };
    }
    return await request<{ message: string; user: User }>(`/auth/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // ---------------- FIELDS ----------------
  getAllFields: async (params?: { search?: string; minPrice?: number; maxPrice?: number; sort?: string }): Promise<{ fields: Field[]; pagination: any }> => {
    if (footballApi.isDemoMode()) {
      let filtered = [...localFields];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((f) => f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q));
      }
      if (params?.minPrice !== undefined) {
        filtered = filtered.filter((f) => f.pricePerHour >= (params.minPrice || 0));
      }
      if (params?.maxPrice !== undefined) {
        filtered = filtered.filter((f) => f.pricePerHour <= (params.maxPrice || Infinity));
      }
      if (params?.sort === 'priceAsc') {
        filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
      } else if (params?.sort === 'priceDesc') {
        filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
      }
      return {
        fields: filtered,
        pagination: { page: 1, limit: 10, total: filtered.length, totalPages: 1 },
      };
    }
    try {
      const qParams = new URLSearchParams();
      if (params?.search) qParams.append('search', params.search);
      if (params?.minPrice) qParams.append('minPrice', String(params.minPrice));
      if (params?.maxPrice) qParams.append('maxPrice', String(params.maxPrice));
      if (params?.sort) qParams.append('sort', params.sort);
      const url = `/fields${qParams.toString() ? `?${qParams.toString()}` : ''}`;
      const res = await request<{ message: string; data: { fields: Field[]; pagination: any } }>(url);
      return res.data;
    } catch {
      return { fields: localFields, pagination: { total: localFields.length } };
    }
  },

  getFieldById: async (id: number): Promise<Field> => {
    if (footballApi.isDemoMode()) {
      const f = localFields.find((item) => item.id === id);
      if (!f) throw new Error('Field not found');
      return f;
    }
    const res = await request<{ message: string; data: Field }>(`/fields/${id}`);
    return res.data;
  },

  createField: async (data: { name: string; description?: string; address: string; pricePerHour: number }) => {
    if (footballApi.isDemoMode()) {
      const newField: Field = {
        id: localFields.length + 1,
        name: data.name,
        description: data.description,
        address: data.address,
        pricePerHour: data.pricePerHour,
        ownerId: 2,
        rating: 5.0,
        reviewsCount: 1,
        imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
      };
      localFields.unshift(newField);
      return newField;
    }
    const res = await request<{ message: string; data: Field }>('/fields', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // ---------------- BOOKINGS ----------------
  getUserBookings: async (): Promise<Booking[]> => {
    if (footballApi.isDemoMode()) {
      return localBookings;
    }
    try {
      const res = await request<{ message: string; bookings: Booking[] }>('/bookings');
      return res.bookings;
    } catch {
      return localBookings;
    }
  },

  getOwnerBookings: async (): Promise<Booking[]> => {
    if (footballApi.isDemoMode()) {
      return localBookings;
    }
    try {
      const res = await request<{ message: string; bookings: Booking[] }>('/bookings/owner');
      return res.bookings;
    } catch {
      return localBookings;
    }
  },

  createBooking: async (data: { fieldId: number; startTime: string; endTime: string }) => {
    if (footballApi.isDemoMode()) {
      const field = localFields.find((f) => f.id === data.fieldId) || localFields[0];
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const totalPrice = hours * field.pricePerHour;

      const newBooking: Booking = {
        id: localBookings.length + 101,
        userId: 4,
        fieldId: field.id,
        startTime: data.startTime,
        endTime: data.endTime,
        totalPrice,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        field,
      };
      localBookings.unshift(newBooking);
      localNotifications.unshift({
        id: localNotifications.length + 1,
        userId: 4,
        title: 'تم إنشاء طلب الحجز ⚽',
        message: `تم حجز ملعب ${field.name} بقيمة ${totalPrice} ج.م بانتظار التأكيد والسداد.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      return newBooking;
    }
    const res = await request<{ message: string; booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.booking;
  },

  confirmBooking: async (bookingId: number) => {
    if (footballApi.isDemoMode()) {
      localBookings = localBookings.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b));
      return { message: 'Booking confirmed' };
    }
    return await request<{ message: string; booking: Booking }>(`/bookings/${bookingId}/confirm`, {
      method: 'PATCH',
    });
  },

  cancelBooking: async (bookingId: number) => {
    if (footballApi.isDemoMode()) {
      localBookings = localBookings.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      return { message: 'Booking cancelled' };
    }
    return await request<{ message: string; booking: Booking }>(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  },

  // ---------------- PAYMENTS ----------------
  createPayment: async (data: { bookingId: number; method: string; transactionId?: string }) => {
    if (footballApi.isDemoMode()) {
      const booking = localBookings.find((b) => b.id === data.bookingId);
      const newPayment = {
        id: Math.floor(Math.random() * 1000) + 300,
        bookingId: data.bookingId,
        amount: booking?.totalPrice || 500,
        method: data.method,
        transactionId: data.transactionId || 'TXN-' + Math.floor(Math.random() * 900000),
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      };
      if (booking) {
        booking.payment = newPayment;
      }
      return newPayment;
    }
    const res = await request<{ message: string; payment: any }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.payment;
  },

  uploadPaymentProof: async (paymentId: number, formData: FormData) => {
    if (footballApi.isDemoMode()) {
      const booking = localBookings.find((b) => b.payment?.id === paymentId);
      if (booking && booking.payment) {
        booking.payment.proofImage = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80';
      }
      return { message: 'Proof uploaded' };
    }
    return await request<{ message: string; payment: any }>(`/payments/${paymentId}/proof`, {
      method: 'POST',
      body: formData,
    });
  },

  verifyPayment: async (paymentId: number, status: 'VERIFIED' | 'REJECTED') => {
    if (footballApi.isDemoMode()) {
      const booking = localBookings.find((b) => b.payment?.id === paymentId);
      if (booking && booking.payment) {
        booking.payment.status = status;
        if (status === 'VERIFIED') {
          booking.status = 'CONFIRMED';
        }
      }
      return { message: 'Payment verified' };
    }
    return await request<{ message: string; payment: any }>(`/payments/${paymentId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // ---------------- REVIEWS ----------------
  getFieldReviews: async (fieldId: number): Promise<{ reviews: Review[]; averageRating: number; totalReviews: number }> => {
    if (footballApi.isDemoMode()) {
      const revs = localReviews.filter((r) => r.fieldId === fieldId);
      const avg = revs.length ? revs.reduce((acc, r) => acc + r.rating, 0) / revs.length : 5.0;
      return {
        reviews: revs,
        averageRating: Number(avg.toFixed(1)),
        totalReviews: revs.length,
      };
    }
    try {
      const res = await request<{ reviews: Review[]; averageRating: number; totalReviews: number }>(`/reviews/field/${fieldId}`);
      return res;
    } catch {
      return { reviews: localReviews, averageRating: 4.8, totalReviews: localReviews.length };
    }
  },

  getAllReviews: async (): Promise<Review[]> => {
    if (footballApi.isDemoMode()) {
      return localReviews;
    }
    try {
      const res = await request<Review[]>('/reviews/admin/all');
      return res;
    } catch {
      return localReviews;
    }
  },

  createReview: async (data: { fieldId: number; rating: number; comment?: string }) => {
    if (footballApi.isDemoMode()) {
      const newRev: Review = {
        id: localReviews.length + 1,
        userId: 4,
        fieldId: data.fieldId,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date().toISOString(),
        user: { id: 4, name: 'عمر شريف' },
        field: { id: data.fieldId, name: localFields.find((f) => f.id === data.fieldId)?.name || 'الملعب' },
      };
      localReviews.unshift(newRev);
      return newRev;
    }
    const res = await request<{ message: string; review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.review;
  },

  deleteReview: async (id: number) => {
    if (footballApi.isDemoMode()) {
      localReviews = localReviews.filter((r) => r.id !== id);
      return { message: 'Review deleted' };
    }
    return await request<{ message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // ---------------- TOURNAMENTS ----------------
  getAllTournaments: async (): Promise<Tournament[]> => {
    if (footballApi.isDemoMode()) {
      return localTournaments;
    }
    try {
      const res = await request<Tournament[]>('/tournaments');
      return res;
    } catch {
      return localTournaments;
    }
  },

  getTournamentById: async (id: number): Promise<Tournament> => {
    if (footballApi.isDemoMode()) {
      const t = localTournaments.find((item) => item.id === id);
      if (!t) throw new Error('Tournament not found');
      return t;
    }
    return await request<Tournament>(`/tournaments/${id}`);
  },

  createTournament: async (data: { name: string; description?: string; startDate: string; endDate: string }) => {
    if (footballApi.isDemoMode()) {
      const newT: Tournament = {
        id: localTournaments.length + 1,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        organizerId: 3,
        organizer: mockUsers[2],
        participantsCount: 1,
        createdAt: new Date().toISOString(),
      };
      localTournaments.unshift(newT);
      return newT;
    }
    return await request<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  joinTournament: async (id: number) => {
    if (footballApi.isDemoMode()) {
      localTournaments = localTournaments.map((t) =>
        t.id === id ? { ...t, participantsCount: (t.participantsCount || 0) + 1 } : t
      );
      return { message: 'Joined tournament' };
    }
    return await request<{ message: string }>(`/tournaments/${id}/join`, {
      method: 'POST',
    });
  },

  deleteTournament: async (id: number) => {
    if (footballApi.isDemoMode()) {
      localTournaments = localTournaments.filter((t) => t.id !== id);
      return { message: 'Tournament deleted' };
    }
    return await request<{ message: string }>(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  },

  // ---------------- NOTIFICATIONS ----------------
  getNotifications: async (): Promise<NotificationItem[]> => {
    if (footballApi.isDemoMode()) {
      return localNotifications;
    }
    try {
      const res = await request<{ message: string; notifications: NotificationItem[] }>('/notifications');
      return res.notifications;
    } catch {
      return localNotifications;
    }
  },

  markNotificationAsRead: async (id: number) => {
    if (footballApi.isDemoMode()) {
      localNotifications = localNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return { message: 'Marked as read' };
    }
    return await request<{ message: string; notification: NotificationItem }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};
