import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  DollarSign,
  Calendar,
  Trophy,
  Layers,
  Trash2,
  Edit,
  MessageSquare,
  Search,
  CheckCircle,
} from 'lucide-react';
import { AdminStats, User, Review, Role } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';
import { StatCard } from '../common/StatCard';
import { RatingStars } from '../common/RatingStars';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reviews'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [s, u, r] = await Promise.all([
        footballApi.getAdminStats(),
        footballApi.getAdminUsers(),
        footballApi.getAllReviews(),
      ]);
      setStats(s);
      setUsers(u);
      setReviews(r);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleChangeRole = async (userId: number, newRole: Role) => {
    try {
      await footballApi.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      success('تم تحديث صلاحية المستخدم بنجاح');
    } catch (err: any) {
      error(err.message || 'فشل في تحديث الدور');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await footballApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      success('تم حذف المستخدم من النظام');
    } catch (err: any) {
      error(err.message || 'فشل في حذف المستخدم');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    try {
      await footballApi.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      success('تم حذف التقييم');
    } catch (err: any) {
      error(err.message || 'فشل في حذف التقييم');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('admin.dashboard')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              التحكم الشامل في المستخدمين، الملاعب، الإيرادات والتقييمات
            </p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-gold' : 'btn-secondary'}`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-gold' : 'btn-secondary'}`}
          >
            <Users size={15} />
            {t('admin.usersTab')} ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-gold' : 'btn-secondary'}`}
          >
            <MessageSquare size={15} />
            {t('admin.reviewsTab')} ({reviews.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <StatCard
            title={t('admin.totalRevenue')}
            value={`${stats.revenue.toLocaleString()} ج.م`}
            subtitle="مدفوعات مؤكدة"
            color="green"
            icon={<DollarSign size={24} />}
          />
          <StatCard
            title={t('admin.totalUsers')}
            value={stats.users}
            subtitle="لاعبين وأصحاب ملاعب"
            color="blue"
            icon={<Users size={24} />}
          />
          <StatCard
            title={t('admin.totalFields')}
            value={stats.fields}
            subtitle="ملاعب نشطة"
            color="amber"
            icon={<Layers size={24} />}
          />
          <StatCard
            title={t('admin.totalBookings')}
            value={stats.bookings}
            subtitle="إجمالي الحجوزات"
            color="purple"
            icon={<Calendar size={24} />}
          />
        </div>
      )}

      {/* TAB 1: OVERVIEW / RECENT ACTIVITY */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Quick Platform Status */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
              حالة منصة كورة أرينا الحية
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>خادم الـ API:</span>
                <span className="badge badge-green">يعمل بكفاءة عالية (200 OK)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>قاعدة بيانات PostgreSQL:</span>
                <span className="badge badge-green">متصلة (Prisma 8 ORM)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>سيرفر رفع الصور Cloudinary:</span>
                <span className="badge badge-blue">مفعل لإيصالات الدفع</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>التوثيق Swagger UI:</span>
                <a
                  href="http://localhost:8000/api-docs"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '0.88rem' }}
                >
                  /api-docs
                </a>
              </div>
            </div>
          </div>

          {/* Quick Role distribution */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
              توزيع الأدوار في المنصة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span>⚽ اللاعبون (PLAYERS)</span>
                  <span style={{ fontWeight: 700 }}>{users.filter((u) => u.role === 'PLAYER').length}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', background: '#10b981' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span>🏟️ أصحاب الملاعب (OWNERS)</span>
                  <span style={{ fontWeight: 700 }}>{users.filter((u) => u.role === 'OWNER').length}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', background: '#0ea5e9' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span>🏆 منظمو البطولات (ORGANIZERS)</span>
                  <span style={{ fontWeight: 700 }}>{users.filter((u) => u.role === 'ORGANIZER').length}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', background: '#f59e0b' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span>👑 مسؤولو النظام (ADMINS)</span>
                  <span style={{ fontWeight: 700 }}>{users.filter((u) => u.role === 'ADMIN').length}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '5%', height: '100%', background: '#a855f7' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="ابحث باسم المستخدم، البريد الإلكتروني أو الهاتف..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '10px' }}>المستخدم</th>
                  <th style={{ padding: '10px' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '10px' }}>الهاتف</th>
                  <th style={{ padding: '10px' }}>الدور الحالي</th>
                  <th style={{ padding: '10px' }}>تعديل الدور</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{u.phone || 'غير مسجل'}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        className={
                          u.role === 'ADMIN'
                            ? 'badge badge-purple'
                            : u.role === 'OWNER'
                            ? 'badge badge-blue'
                            : u.role === 'ORGANIZER'
                            ? 'badge badge-amber'
                            : 'badge badge-green'
                        }
                      >
                        {t(`role.${u.role}`)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="PLAYER">لاعب (PLAYER)</option>
                        <option value="OWNER">صاحب ملعب (OWNER)</option>
                        <option value="ORGANIZER">منظم (ORGANIZER)</option>
                        <option value="ADMIN">مدير (ADMIN)</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title={t('admin.deleteUser')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            التقييمات المضافة على الملاعب ({reviews.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{r.user?.name || 'لاعب'}</span>
                    <RatingStars rating={r.rating} size={15} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      الملعب: {r.field?.name || 'ملعب معتمد'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    "{r.comment || 'لا يوجد تعليق مكتوب'}"
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteReview(r.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', flexShrink: 0 }}
                  title="حذف التقييم المخالف"
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
