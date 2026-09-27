import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'purple' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'green',
}) => {
  const colorMap = {
    green: {
      border: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.15)',
      iconBg: 'rgba(16, 185, 129, 0.2)',
      text: '#10b981',
    },
    blue: {
      border: 'rgba(14, 165, 233, 0.3)',
      glow: 'rgba(14, 165, 233, 0.15)',
      iconBg: 'rgba(14, 165, 233, 0.2)',
      text: '#0ea5e9',
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.3)',
      glow: 'rgba(245, 158, 11, 0.15)',
      iconBg: 'rgba(245, 158, 11, 0.2)',
      text: '#f59e0b',
    },
    purple: {
      border: 'rgba(139, 92, 246, 0.3)',
      glow: 'rgba(139, 92, 246, 0.15)',
      iconBg: 'rgba(139, 92, 246, 0.2)',
      text: '#8b5cf6',
    },
    red: {
      border: 'rgba(239, 68, 68, 0.3)',
      glow: 'rgba(239, 68, 68, 0.15)',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      text: '#ef4444',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        border: `1px solid ${scheme.border}`,
        boxShadow: `0 8px 25px ${scheme.glow}`,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.text,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '2px' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: scheme.text, marginTop: '2px', fontWeight: 600 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
