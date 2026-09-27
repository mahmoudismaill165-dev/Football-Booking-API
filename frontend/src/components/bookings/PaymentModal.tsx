import React, { useState } from 'react';
import { X, CreditCard, Upload, CheckCircle2, Smartphone, DollarSign } from 'lucide-react';
import { Booking } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';

interface PaymentModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [method, setMethod] = useState<'InstaPay' | 'Vodafone Cash' | 'Credit Card' | 'Cash'>('InstaPay');
  const [transactionId, setTransactionId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Payment record
      const payment = await footballApi.createPayment({
        bookingId: booking.id,
        method,
        transactionId: transactionId || `TXN-${Math.floor(Math.random() * 900000)}`,
      });

      // 2. Upload Proof if file selected
      if (proofFile && payment.id) {
        const formData = new FormData();
        formData.append('proofImage', proofFile);
        await footballApi.uploadPaymentProof(payment.id, formData);
      }

      success('تم إرسال بيانات الدفع بنجاح! في انتظار اعتماد صاحب الملعب.');
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'فشل في إتمام عملية الدفع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('payment.title')}</h3>
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
            {/* Amount details banner */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>المبلغ الإجمالي المطلوب سداده</p>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399' }}>
                  {booking.totalPrice} {t('common.egp')}
                </h2>
              </div>
              <span className="badge badge-amber">{booking.status}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">{t('payment.method')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMethod('InstaPay')}
                  className={`btn ${method === 'InstaPay' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem', padding: '10px' }}
                >
                  ⚡ إنستاباي (InstaPay)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Vodafone Cash')}
                  className={`btn ${method === 'Vodafone Cash' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem', padding: '10px' }}
                >
                  📱 فودافون كاش
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Credit Card')}
                  className={`btn ${method === 'Credit Card' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem', padding: '10px' }}
                >
                  💳 بطاقة بنكية
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Cash')}
                  className={`btn ${method === 'Cash' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem', padding: '10px' }}
                >
                  💵 نقدي عند الحضور
                </button>
              </div>
            </div>

            {/* Transfer Instructions based on method */}
            {method === 'InstaPay' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  borderLeft: '3px solid #10b981',
                }}
              >
                حول إلى حساب InstaPay الخاص بالملعب:{' '}
                <strong style={{ color: '#fff' }}>koora-arena@instapay</strong>
              </div>
            )}

            {method === 'Vodafone Cash' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  borderLeft: '3px solid #ef4444',
                }}
              >
                حول إلى رقم فودافون كاش الخاص بالملعب:{' '}
                <strong style={{ color: '#fff' }}>01099887766</strong>
              </div>
            )}

            {/* Transaction ID */}
            {method !== 'Cash' && (
              <div className="form-group">
                <label className="form-label">{t('payment.transactionId')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: REF-983104820"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            )}

            {/* Proof Upload */}
            {method !== 'Cash' && (
              <div className="form-group">
                <label className="form-label">{t('payment.uploadProof')}</label>
                <div
                  style={{
                    border: '2px dashed var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(15, 23, 42, 0.6)',
                  }}
                  onClick={() => document.getElementById('proof-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="proof-file-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  {proofPreview ? (
                    <div>
                      <img
                        src={proofPreview}
                        alt="Proof preview"
                        style={{ maxHeight: '140px', borderRadius: '8px', margin: '0 auto', display: 'block' }}
                      />
                      <p style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '6px' }}>
                        تم اختيار الإيصال، انقر لتغييره
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        اضغط لرفع لقطة شاشة التحويل (PNG, JPG)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '150px' }}>
              {loading ? t('common.loading') : t('payment.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
