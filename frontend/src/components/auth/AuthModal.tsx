import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Role } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, switchRole } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        success('تم تسجيل الدخول بنجاح! مرحباً بك');
      } else {
        await register(name, email, password, phone);
        success('تم إنشاء الحساب بنجاح! مرحباً بك في كورة أرينا');
      }
      onClose();
    } catch (err: any) {
      error(err.message || 'فشل في العملية، يرجى المحاولة ثانية');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: Role) => {
    switchRole(role);
    success(`تم تسجيل الدخول بحساب تجريبي بصلاحية: ${t(`role.${role}`)}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {mode === 'login' ? t('nav.login') : t('nav.register')}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Demo Switcher */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px dashed rgba(16, 185, 129, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> دخول سريع بأحد الحسابات الجاهزة للتجربة:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => fillQuickDemo('PLAYER')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                ⚽ لاعب (عمر)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('OWNER')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                🏟️ صاحب ملعب (حسام)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('ORGANIZER')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                🏆 منظم بطولات (أحمد)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('ADMIN')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              >
                👑 مدير النظام (Admin)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">الاسم بالكامل</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="مثال: عمر شريف"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">رقم الهاتف (اختياري)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">كلمة المرور (8 أحرف على الأقل)</label>
              <input
                type="password"
                required
                minLength={8}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '12px' }}
            >
              {loading ? t('common.loading') : mode === 'login' ? t('nav.login') : t('nav.register')}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <span>
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--pitch-green)', fontWeight: 700, cursor: 'pointer' }}
                >
                  أنشئ حساباً الآن
                </button>
              </span>
            ) : (
              <span>
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--pitch-green)', fontWeight: 700, cursor: 'pointer' }}
                >
                  تسجيل الدخول
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
