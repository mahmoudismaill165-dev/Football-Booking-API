import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Booking } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';

interface VerifyPaymentModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const VerifyPaymentModal: React.FC<VerifyPaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onVerified,
}) => {
  const { t } = useLanguage();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking || !booking.payment) return null;

  const handleAction = async (status: 'VERIFIED' | 'REJECTED') => {
    setLoading(true);
    try {
      await footballApi.verifyPayment(booking.payment!.id, status);
      if (status === 'VERIFIED') {
        success('تم تأكيد الدفع وتأكيد الحجز بنجاح!');
      } else {
        success('تم رفض إيصال الدفع وإشعار اللاعب.');
      }
      onVerified();
      onClose();
    } catch (err: any) {
      error(err.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t('payment.verify')}</h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Summary table */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-glass)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>اسم اللاعب:</span>
              <span style={{ fontWeight: 700 }}>{booking.user?.name || 'عمر شريف'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>المبلغ المحول:</span>
              <span style={{ color: '#34d399', fontWeight: 800 }}>
                {booking.payment.amount} {t('common.egp')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>طريقة التحويل:</span>
              <span className="badge badge-blue">{booking.payment.method}</span>
            </div>
            {booking.payment.transactionId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>رقم المعاملة:</span>
                <span style={{ fontFamily: 'monospace' }}>{booking.payment.transactionId}</span>
              </div>
            )}
          </div>

          {/* Proof Screenshot */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              صورة إيصال التحويل:
            </p>
            {booking.payment.proofImage ? (
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={booking.payment.proofImage}
                  alt="Payment Proof"
                  style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', background: '#000' }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                }}
              >
                لم يتم إرفاق لقطة شاشة للإيصال
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('REJECTED')}
            className="btn btn-danger"
          >
            <XCircle size={16} />
            {t('payment.reject')}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('VERIFIED')}
            className="btn btn-primary"
            style={{ minWidth: '150px' }}
          >
            <CheckCircle size={16} />
            {t('payment.approve')}
          </button>
        </div>
      </div>
    </div>
  );
};
