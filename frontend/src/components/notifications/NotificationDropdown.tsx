import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NotificationItem } from '../../types';
import { footballApi } from '../../services/footballApi';

export const NotificationDropdown: React.FC = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const items = await footballApi.getNotifications();
      setNotifications(items);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await footballApi.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 10px',
          color: 'var(--text-main)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        title={t('notifications.title')}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="glass-panel animate-slide-down"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            [language === 'ar' ? 'left' : 'right']: 0,
            width: '340px',
            maxHeight: '420px',
            overflowY: 'auto',
            zIndex: 1100,
            padding: '12px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              marginBottom: '10px',
              borderBottom: '1px solid var(--border-glass)',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {t('notifications.title')}
            </h4>
            {unreadCount > 0 && (
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                {unreadCount} جديد
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t('notifications.empty')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: item.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${item.isRead ? 'transparent' : 'rgba(16, 185, 129, 0.2)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: item.isRead ? 'var(--text-secondary)' : '#34d399' }}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--pitch-green)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: '2px',
                        }}
                        title="تحديد كمقروء"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <Clock size={11} />
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
