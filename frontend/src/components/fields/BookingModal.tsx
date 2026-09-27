import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Field } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';

interface BookingModalProps {
  field: Field | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  field,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [date, setDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [loading, setLoading] = useState(false);

  // Calculate duration and price
  const { durationHours, totalPrice, isValidTime } = useMemo(() => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal <= startTotal) {
      return { durationHours: 0, totalPrice: 0, isValidTime: false };
    }

    const diffHours = (endTotal - startTotal) / 60;
    const rate = field?.pricePerHour || 0;
    return {
      durationHours: diffHours,
      totalPrice: diffHours * rate,
      isValidTime: true,
    };
  }, [startTime, endTime, field?.pricePerHour]);

  if (!isOpen || !field) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTime) {
      error(t('booking.timeValidation'));
      return;
    }

    setLoading(true);
    try {
      const fullStart = new Date(`${date}T${startTime}:00.000Z`).toISOString();
      const fullEnd = new Date(`${date}T${endTime}:00.000Z`).toISOString();

      await footballApi.createBooking({
        fieldId: field.id,
        startTime: fullStart,
        endTime: fullEnd,
      });

      success(`تم إرسال طلب حجز ${field.name} بنجاح! في انتظار التأكيد والسداد.`);
      onBookingSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t('booking.title')}</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Field Header Mini-Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)',
                marginBottom: '1.25rem',
              }}
            >
              <img
                src={field.imageUrl || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=200&q=80'}
                alt={field.name}
                style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2px' }}>{field.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{field.address}</p>
                <p style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, marginTop: '3px' }}>
                  {field.pricePerHour} {t('fields.perHour')}
                </p>
              </div>
            </div>

            {/* Date Picker */}
            <div className="form-group">
              <label className="form-label">{t('booking.date')}</label>
              <input
                type="date"
                required
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Time Slot Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">{t('booking.startTime')}</label>
                <input
                  type="time"
                  required
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('booking.endTime')}</label>
                <input
                  type="time"
                  required
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Validation Message */}
            {!isValidTime && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  padding: '8px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{t('booking.timeValidation')}</span>
              </div>
            )}

            {/* Calculation Summary Card */}
            {isValidTime && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('booking.duration')}:</span>
                  <span style={{ fontWeight: 700 }}>
                    {durationHours} {t('booking.hours')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>سعر الساعة:</span>
                  <span>{field.pricePerHour} {t('common.egp')}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                  }}
                >
                  <span style={{ color: 'var(--text-main)' }}>{t('booking.totalPrice')}:</span>
                  <span style={{ color: '#34d399' }}>{totalPrice} {t('common.egp')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !isValidTime}
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              {loading ? t('common.loading') : t('booking.confirmBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
