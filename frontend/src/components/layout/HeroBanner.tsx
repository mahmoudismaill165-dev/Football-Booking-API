import React from 'react';
import { Search, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExploreTournaments: () => void;
  onScrollToFields: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onExploreTournaments,
  onScrollToFields,
}) => {
  const { t } = useLanguage();

  return (
    <div
      style={{
        position: 'relative',
        padding: '4.5rem 1.5rem 3.5rem',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-glass)',
        backgroundImage: `
          linear-gradient(to bottom, rgba(11, 17, 32, 0.75), rgba(7, 11, 18, 0.95)),
          url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1800&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Stadium Light Glow Effect */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Tag */}
        <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
          <span
            className="badge badge-green animate-fade-in"
            style={{
              padding: '6px 16px',
              fontSize: '0.85rem',
              gap: '8px',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Sparkles size={16} />
            المنصة الرياضية الأولى لحجز ملاعب النجيل والبطولات
          </span>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.5px',
          }}
        >
          {t('hero.title')}{' '}
          <span
            style={{
              display: 'inline-block',
              filter: 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.6))',
              transform: 'scale(1.15)',
              marginRight: '0.35rem',
              marginLeft: '0.35rem',
            }}
          >
            ⚽
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          {t('hero.subtitle')}
        </p>

        {/* Quick Search Bar */}
        <div
          className="glass-panel"
          style={{
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px var(--pitch-glow)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ color: 'var(--pitch-green)', padding: '0 6px', display: 'flex' }}>
            <Search size={22} />
          </div>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('hero.searchPlaceholder')}
            style={{
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              fontSize: '1.05rem',
              padding: '10px 0',
            }}
          />
          <button
            onClick={onScrollToFields}
            className="btn btn-primary"
            style={{ padding: '10px 24px', flexShrink: 0 }}
          >
            {t('fields.search')}
          </button>
        </div>

        {/* Highlight Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.25rem',
            marginTop: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Zap size={18} color="#10b981" />
            <span>حجز فوري وتأكيد تلقائي</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <ShieldCheck size={18} color="#0ea5e9" />
            <span>دفع آمن (إنستاباي / فودافون كاش)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Award size={18} color="#f59e0b" />
            <span>بطولات وجوائز نقدية كبرى</span>
          </div>
        </div>
      </div>
    </div>
  );
};
