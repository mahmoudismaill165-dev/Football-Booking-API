import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { Booking } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { RatingStars } from '../common/RatingStars';
import { footballApi } from '../../services/footballApi';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onReviewSuccess,
}) => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await footballApi.createReview({
        fieldId: booking.fieldId,
        rating,
        comment,
      });

      success('شكراً لك! تم إضافة تقييمك بنجاح');
      onReviewSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'فشل في إضافة التقييم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} color="#f59e0b" fill="#f59e0b" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t('review.title')}</h3>
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
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              كيف كانت تجربتك في ملعب{' '}
              <strong style={{ color: '#fff' }}>{booking.field?.name || 'الملعب'}</strong>؟
            </p>

            {/* Interactive Stars */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {t('review.rating')}
              </span>
              <RatingStars rating={rating} size={28} interactive onChange={setRating} />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', marginTop: '6px' }}>
                {rating} / 5 نجوم
              </span>
            </div>

            {/* Comment */}
            <div className="form-group">
              <label className="form-label">{t('review.comment')}</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="اكتب تقييمك لأرضية الملعب، الإضاءة، المعاملة..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn btn-gold" style={{ minWidth: '130px' }}>
              {loading ? t('common.loading') : t('review.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
