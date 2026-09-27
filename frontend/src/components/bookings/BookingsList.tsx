import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  CreditCard,
  Star,
  FileCheck,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { Booking, BookingStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';
import { PaymentModal } from './PaymentModal';
import { VerifyPaymentModal } from './VerifyPaymentModal';
import { ReviewModal } from './ReviewModal';

interface BookingsListProps {
  isOwnerView?: boolean;
}

export const BookingsList: React.FC<BookingsListProps> = ({ isOwnerView = false }) => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [selectedBookingForVerify, setSelectedBookingForVerify] = useState<Booking | null>(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = isOwnerView
        ? await footballApi.getOwnerBookings()
        : await footballApi.getUserBookings();
      setBookings(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isOwnerView]);

  const handleConfirm = async (id: number) => {
    try {
      await footballApi.confirmBooking(id);
      success('تم تأكيد الحجز بنجاح!');
      fetchBookings();
    } catch (err: any) {
      error(err.message || 'فشل في تأكيد الحجز');
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) return;
    try {
      await footballApi.cancelBooking(id);
      success('تم إلغاء الحجز بنجاح');
      fetchBookings();
    } catch (err: any) {
      error(err.message || 'فشل في إلغاء الحجز');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-green">{t('status.CONFIRMED')}</span>;
      case 'PENDING':
        return <span className="badge badge-amber">{t('status.PENDING')}</span>;
      case 'CANCELLED':
        return <span className="badge badge-red">{t('status.CANCELLED')}</span>;
      case 'COMPLETED':
        return <span className="badge badge-blue">{t('status.COMPLETED')}</span>;
      default:
        return <span className="badge badge-amber">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {isOwnerView ? t('nav.ownerBookings') : t('nav.myBookings')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {isOwnerView
              ? 'متابعة وتأكيد حجوزات الملاعب الخاصة بك والتحقق من إيصالات السداد'
              : 'سجل جميع حجوزاتك، تفاصيل المواعيد، السداد وتقييم الملاعب'}
          </p>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {st === 'ALL' ? 'الكل' : t(`status.${st}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {t('common.loading')}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div
          className="glass-panel"
          style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}
        >
          <Calendar size={48} color="#64748b" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
            لا توجد حجوزات في هذه الفئة
          </h3>
          <p style={{ fontSize: '0.85rem' }}>
            {isOwnerView ? 'لم يتم استلام حجوزات جديدة لملاعبك بعد' : 'قم باستكشاف الملاعب واحجز موعدك القادم الآن'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookings.map((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const dateStr = start.toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            return (
              <div
                key={booking.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
                  alignItems: 'center',
                  gap: '1.25rem',
                }}
              >
                {/* Field & Date info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      {booking.field?.name || 'ملعب كرة قدم'}
                    </h4>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <Calendar size={15} color="#10b981" />
                    <span>{dateStr}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Clock size={15} color="#0ea5e9" />
                    <span>{timeStr}</span>
                  </div>
                </div>

                {/* Price & Payment state */}
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                    التكلفة الإجمالية:
                  </span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                    {booking.totalPrice} {t('common.egp')}
                  </span>

                  <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                    {booking.payment ? (
                      <span
                        className={
                          booking.payment.status === 'VERIFIED'
                            ? 'badge badge-green'
                            : booking.payment.status === 'REJECTED'
                            ? 'badge badge-red'
                            : 'badge badge-amber'
                        }
                      >
                        {booking.payment.status === 'VERIFIED'
                          ? 'مدفوع وتم التحقق'
                          : booking.payment.status === 'REJECTED'
                          ? 'إيصال مرفوض'
                          : 'إيصال قيد المراجعة'}
                      </span>
                    ) : (
                      <span className="badge badge-red">في انتظار السداد</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons depending on role & status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* OWNER actions */}
                  {isOwnerView ? (
                    <>
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <Check size={15} />
                          تأكيد الحجز
                        </button>
                      )}

                      {booking.payment && booking.payment.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedBookingForVerify(booking)}
                          className="btn btn-gold btn-sm"
                        >
                          <FileCheck size={15} />
                          مراجعة الإيصال
                        </button>
                      )}

                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                        >
                          <X size={15} />
                          إلغاء
                        </button>
                      )}
                    </>
                  ) : (
                    /* PLAYER actions */
                    <>
                      {(!booking.payment || booking.payment.status === 'PENDING') &&
                        booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setSelectedBookingForPayment(booking)}
                            className="btn btn-primary btn-sm"
                          >
                            <CreditCard size={15} />
                            {booking.payment ? 'تعديل السداد / الإيصال' : 'سداد الحجز'}
                          </button>
                        )}

                      {booking.status === 'COMPLETED' && (
                        <button
                          onClick={() => setSelectedBookingForReview(booking)}
                          className="btn btn-gold btn-sm"
                        >
                          <Star size={15} />
                          تقييم الملعب
                        </button>
                      )}

                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                        >
                          <X size={15} />
                          إلغاء الحجز
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!selectedBookingForPayment}
        booking={selectedBookingForPayment}
        onClose={() => setSelectedBookingForPayment(null)}
        onPaymentSuccess={fetchBookings}
      />

      {/* Verify Payment Modal */}
      <VerifyPaymentModal
        isOpen={!!selectedBookingForVerify}
        booking={selectedBookingForVerify}
        onClose={() => setSelectedBookingForVerify(null)}
        onVerified={fetchBookings}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!selectedBookingForReview}
        booking={selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
        onReviewSuccess={fetchBookings}
      />
    </div>
  );
};
