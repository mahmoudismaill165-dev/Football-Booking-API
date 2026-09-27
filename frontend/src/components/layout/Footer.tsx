import React from 'react';
import { Trophy, Heart, Code2, Database, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        background: '#05080f',
        borderTop: '1px solid var(--border-glass)',
        padding: '3rem 1.5rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.6rem' }}>⚽</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
              {t('brand.name')}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            المنصة الرقمية المتكاملة لحجز ملاعب كرة القدم بالشرق الأوسط، إدارة الحجوزات والمدفوعات وتنظيم البطولات التنافسية.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-green">React + Vite</span>
            <span className="badge badge-blue">Express + Node.js</span>
            <span className="badge badge-purple">Prisma 8 ORM</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
            روابط سريعة
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <li><a href="#fields" style={{ transition: 'color 0.2s' }}>استكشاف ملاعب كرة القدم</a></li>
            <li><a href="#tournaments" style={{ transition: 'color 0.2s' }}>البطولات والمنافسات الرسمية</a></li>
            <li><a href="#my-bookings" style={{ transition: 'color 0.2s' }}>إدارة الحجوزات والمدفوعات</a></li>
            <li><a href="http://localhost:8000/api-docs" target="_blank" rel="noreferrer" style={{ color: 'var(--pitch-green)' }}>توثيق الـ API (Swagger UI) ↗</a></li>
          </ul>
        </div>

        {/* Security & Reliability */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
            الأمان والدعم
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '10px' }}>
            جميع المعاملات المالية محمية بنظام تشفير عالي وتوثيق إيصالات الدفع اللحظي عبر محافظ كاش وإنستاباي.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.82rem' }}>
            <Shield size={16} />
            <span>نظام صلاحيات وحماية JWT & Role Guards</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}
      >
        <p>© 2026 كورة أرينا (KOORA ARENA). جميع الحقوق محفوظة.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>صُمم وطُوّر بواسطة المهندس</span>
          <strong style={{ color: 'var(--text-main)' }}>محمود إسماعيل (Mahmoud Ismail)</strong>
        </p>
      </div>
    </footer>
  );
};
