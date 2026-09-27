import React from 'react';
import { MapPin, Clock, Star, Zap, Eye, Calendar } from 'lucide-react';
import { Field } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { RatingStars } from '../common/RatingStars';

interface FieldCardProps {
  field: Field;
  onBook: (field: Field) => void;
  onViewDetails: (field: Field) => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, onBook, onViewDetails }) => {
  const { t } = useLanguage();

  const defaultImage =
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="glass-panel glass-panel-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Pitch Image Cover */}
      <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
        <img
          src={field.imageUrl || defaultImage}
          alt={field.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
          }}
        />

        {/* Price Tag Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(7, 11, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            color: '#34d399',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
          }}
        >
          {field.pricePerHour}{' '}
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {t('fields.perHour')}
          </span>
        </div>

        {/* Rating Badge Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(7, 11, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#fbbf24',
          }}
        >
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span>{field.rating ? field.rating.toFixed(1) : '5.0'}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            ({field.reviewsCount || 12})
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            marginBottom: '6px',
            color: 'var(--text-main)',
            lineHeight: 1.3,
          }}
        >
          {field.name}
        </h3>

        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            marginBottom: '10px',
          }}
        >
          <MapPin size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ lineHeight: 1.4 }}>{field.address}</span>
        </div>

        {/* Description snippet */}
        {field.description && (
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {field.description}
          </p>
        )}

        {/* Amenities badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.25rem' }}>
          <span className="badge badge-green">نجيل تركي معتمد</span>
          <span className="badge badge-blue">إضاءة ليد كاشفة</span>
          <span className="badge badge-amber">كافيه وغرف تبديل</span>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            marginTop: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '8px',
          }}
        >
          <button onClick={() => onBook(field)} className="btn btn-primary">
            <Calendar size={16} />
            {t('fields.book')}
          </button>

          <button
            onClick={() => onViewDetails(field)}
            className="btn btn-secondary"
            title={t('fields.details')}
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
