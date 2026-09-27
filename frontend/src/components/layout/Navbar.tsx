import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Layers,
  Shield,
  User,
  LogOut,
  Globe,
  Radio,
  PlusCircle,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { AuthModal } from '../auth/AuthModal';
import { Role } from '../../types';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateField: () => void;
  onOpenCreateTournament: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenCreateField,
  onOpenCreateTournament,
}) => {
  const { user, role, logout, switchRole, isDemoMode, setDemoMode } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rolesList: { key: Role; label: string; icon: string }[] = [
    { key: 'PLAYER', label: t('role.PLAYER'), icon: '⚽' },
    { key: 'OWNER', label: t('role.OWNER'), icon: '🏟️' },
    { key: 'ORGANIZER', label: t('role.ORGANIZER'), icon: '🏆' },
    { key: 'ADMIN', label: t('role.ADMIN'), icon: '👑' },
  ];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          background: 'rgba(7, 11, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '0.75rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand Logo */}
          <div
            onClick={() => onTabChange('fields')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              ⚽
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    background: 'linear-gradient(to right, #ffffff, #a7f3d0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('brand.name')}
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  PRO
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '-2px' }}>
                ARENA FULL-STACK
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
            }}
            className="desktop-nav"
          >
            <button
              onClick={() => onTabChange('fields')}
              className={`btn btn-sm ${currentTab === 'fields' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Compass size={16} />
              {t('nav.fields')}
            </button>

            <button
              onClick={() => onTabChange('tournaments')}
              className={`btn btn-sm ${currentTab === 'tournaments' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Trophy size={16} />
              {t('nav.tournaments')}
            </button>

            {role === 'PLAYER' && (
              <button
                onClick={() => onTabChange('my-bookings')}
                className={`btn btn-sm ${currentTab === 'my-bookings' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Calendar size={16} />
                {t('nav.myBookings')}
              </button>
            )}

            {role === 'OWNER' && (
              <>
                <button
                  onClick={() => onTabChange('owner-bookings')}
                  className={`btn btn-sm ${currentTab === 'owner-bookings' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Calendar size={16} />
                  {t('nav.ownerBookings')}
                </button>
                <button
                  onClick={onOpenCreateField}
                  className="btn btn-sm btn-outline"
                >
                  <PlusCircle size={16} />
                  {t('fields.addNew')}
                </button>
              </>
            )}

            {role === 'ORGANIZER' && (
              <button
                onClick={onOpenCreateTournament}
                className="btn btn-sm btn-gold"
              >
                <PlusCircle size={16} />
                {t('tournaments.create')}
              </button>
            )}

            {role === 'ADMIN' && (
              <button
                onClick={() => onTabChange('admin')}
                className={`btn btn-sm ${currentTab === 'admin' ? 'btn-gold' : 'btn-secondary'}`}
              >
                <Shield size={16} />
                {t('nav.adminDashboard')}
              </button>
            )}
          </nav>

          {/* Right Controls: Role Switcher, Language, Notifications, Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Role Switcher Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 8px',
                gap: '4px',
              }}
              title={t('common.switchRole')}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                الدور:
              </span>
              <select
                value={role}
                onChange={(e) => switchRole(e.target.value as Role)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--pitch-green)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {rolesList.map((r) => (
                  <option key={r.key} value={r.key} style={{ background: '#0f172a', color: '#fff' }}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Demo / Live Toggle */}
            <button
              onClick={() => setDemoMode(!isDemoMode)}
              style={{
                background: isDemoMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${isDemoMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                color: isDemoMode ? '#fbbf24' : '#34d399',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
              title="انقر للتبديل بين المحاكاة وربط الـ API الحي"
            >
              <Radio size={12} className={isDemoMode ? '' : 'animate-pulse'} />
              <span>{isDemoMode ? 'DEMO' : 'LIVE API'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
              title="تغيير اللغة / Change Language"
            >
              <Globe size={15} />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Profile or Login */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--pitch-green)',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      maxWidth: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '6px',
                  }}
                  title={t('nav.logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <User size={15} />
                {t('nav.login')}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm mobile-menu-btn"
              style={{ display: 'none' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="animate-slide-down"
            style={{
              paddingTop: '1rem',
              marginTop: '0.75rem',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <button
              onClick={() => {
                onTabChange('fields');
                setMobileMenuOpen(false);
              }}
              className={`btn ${currentTab === 'fields' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <Compass size={16} />
              {t('nav.fields')}
            </button>
            <button
              onClick={() => {
                onTabChange('tournaments');
                setMobileMenuOpen(false);
              }}
              className={`btn ${currentTab === 'tournaments' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <Trophy size={16} />
              {t('nav.tournaments')}
            </button>
            {role === 'PLAYER' && (
              <button
                onClick={() => {
                  onTabChange('my-bookings');
                  setMobileMenuOpen(false);
                }}
                className={`btn ${currentTab === 'my-bookings' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                <Calendar size={16} />
                {t('nav.myBookings')}
              </button>
            )}
            {role === 'OWNER' && (
              <button
                onClick={() => {
                  onTabChange('owner-bookings');
                  setMobileMenuOpen(false);
                }}
                className={`btn ${currentTab === 'owner-bookings' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                <Calendar size={16} />
                {t('nav.ownerBookings')}
              </button>
            )}
            {role === 'ADMIN' && (
              <button
                onClick={() => {
                  onTabChange('admin');
                  setMobileMenuOpen(false);
                }}
                className={`btn ${currentTab === 'admin' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                <Shield size={16} />
                {t('nav.adminDashboard')}
              </button>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 859px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};
