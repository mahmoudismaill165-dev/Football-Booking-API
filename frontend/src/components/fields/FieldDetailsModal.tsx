import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Calendar, MessageSquare, Shield, Check, Info } from 'lucide-react';
import { Field, Review } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { RatingStars } from '../common/RatingStars';
import { footballApi } from '../../services/footballApi';

interface FieldDetailsModalProps {
  field: Field | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (field: Field) => void;
}

export const FieldDetailsModal: React.FC<FieldDetailsModalProps> = ({
  field,
  isOpen,
  onClose,
  onBook,
}) => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (field) {
      setLoading(true);
      footballApi
        .getFieldReviews(field.id)
        .then((res) => {
          setReviews(res.reviews);
          setAvgRating(res.averageRating);
          setTotalReviews(res.totalReviews);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [field]);

  if (!isOpen || !field) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div style={{ position: 'relative', height: '240px' }}>
          <img
            src={field.imageUrl || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'}
            alt={field.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(7, 11, 18, 0.9)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            {field.pricePerHour} {t('fields.perHour')}
          </div>
        </div>

        <div className="modal-body">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>{field.name}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <MapPin size={18} color="#10b981" />
            <span>{field.address}</span>
          </div>

          {/* Rating Snapshot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24' }}>
              {avgRating.toFixed(1)}
            </div>
            <div>
              <RatingStars rating={avgRating} size={18} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                بناءً على {totalReviews} تقييم من لاعبين معتمدين
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
              عن الملعب والتجهيزات
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {field.description || 'ملعب كرة قدم مجهز بالكامل بأعلى المواصفات، مناسب للمباريات الخماسية والسباعية والبطولات الودية.'}
            </p>
          </div>

          {/* Amenities Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
              المميزات والخدمات المتوفرة
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Check size={16} color="#10b981" />
                <span>نجيل صناعي من الفئة الأولى</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Check size={16} color="#10b981" />
                <span>أعمدة إضاءة ليد بدون ظلال</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Check size={16} color="#10b981" />
                <span>غرف ملابس وشاورات مكيفة</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Check size={16} color="#10b981" />
                <span>كافيتريا وباركينج مجاني</span>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MessageSquare size={18} color="#0ea5e9" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>آراء وتقييمات اللاعبين ({reviews.length})</h4>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('common.loading')}</p>
            ) : reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>لا توجد تقييمات مضافة لهذا الملعب حتى الآن.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rev.user?.name || 'لاعب'}</span>
                      <RatingStars rating={rev.rating} size={14} />
                    </div>
                    {rev.comment && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('common.close')}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBook(field);
            }}
            className="btn btn-primary"
          >
            <Calendar size={16} />
            {t('fields.book')}
          </button>
        </div>
      </div>
    </div>
  );
};
