import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Award, Shield, Trash2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Tournament } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';

interface TournamentsListProps {
  onOpenCreateModal: () => void;
}

export const TournamentsList: React.FC<TournamentsListProps> = ({ onOpenCreateModal }) => {
  const { t } = useLanguage();
  const { role } = useAuth();
  const { success, error } = useToast();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [joinedTournaments, setJoinedTournaments] = useState<number[]>([]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await footballApi.getAllTournaments();
      setTournaments(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleJoin = async (id: number) => {
    try {
      await footballApi.joinTournament(id);
      setJoinedTournaments((prev) => [...prev, id]);
      success('تهانينا! تم تسجيل فريقك في البطولة بنجاح ⚽🏆');
      fetchTournaments();
    } catch (err: any) {
      error(err.message || 'فشل في الانضمام للبطولة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه البطولة؟')) return;
    try {
      await footballApi.deleteTournament(id);
      success('تم حذف البطولة بنجاح');
      fetchTournaments();
    } catch (err: any) {
      error(err.message || 'فشل في حذف البطولة');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={28} color="#f59e0b" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('tournaments.title')}</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            {t('tournaments.subtitle')}
          </p>
        </div>

        {role === 'ORGANIZER' && (
          <button onClick={onOpenCreateModal} className="btn btn-gold">
            <PlusCircle size={18} />
            {t('tournaments.create')}
          </button>
        )}
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {t('common.loading')}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Trophy size={48} color="#64748b" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3>لا توجد بطولات نشطة حالياً</h3>
          {role === 'ORGANIZER' && (
            <button onClick={onOpenCreateModal} className="btn btn-gold" style={{ marginTop: '1rem' }}>
              كن أول من ينظم بطولة الآن
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {tournaments.map((tItem) => {
            const start = new Date(tItem.startDate).toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric',
            });
            const end = new Date(tItem.endDate).toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const isJoined = joinedTournaments.includes(tItem.id);

            return (
              <div
                key={tItem.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f59e0b',
                      flexShrink: 0,
                    }}
                  >
                    <Trophy size={24} />
                  </div>

                  <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                    بطولة رسمية
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.35 }}>
                  {tItem.name}
                </h3>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    flex: 1,
                  }}
                >
                  {tItem.description || 'بطولة حماسية تجمع أمهر الفرق مع جوائز وميداليات تذكارية وتغطية مصورة.'}
                </p>

                {/* Dates & participants */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#10b981" />
                    <span>
                      الفترة: {start} - {end}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} color="#0ea5e9" />
                    <span>
                      الفرق المشاركة: <strong style={{ color: '#fff' }}>{tItem.participantsCount || 8} فرق</strong>
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                  {isJoined ? (
                    <button disabled className="btn btn-secondary" style={{ width: '100%', gap: '6px', opacity: 0.8 }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      {t('tournaments.joined')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(tItem.id)}
                      className="btn btn-gold"
                      style={{ flex: 1 }}
                    >
                      <Trophy size={16} />
                      {t('tournaments.join')}
                    </button>
                  )}

                  {role === 'ORGANIZER' && (
                    <button
                      onClick={() => handleDelete(tItem.id)}
                      className="btn btn-secondary"
                      style={{ color: '#ef4444' }}
                      title="حذف البطولة"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
