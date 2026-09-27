import React, { useState } from 'react';
import { X, Trophy, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTournamentCreated: () => void;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  onTournamentCreated,
}) => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      error('يرجى تحديد اسم البطولة وتاريخ البداية والنهاية');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      error('يجب أن يكون تاريخ النهاية بعد تاريخ البداية');
      return;
    }

    setLoading(true);
    try {
      await footballApi.createTournament({
        name,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      success('تم إطلاق البطولة بنجاح وفتح باب تسجيل الفرق!');
      onTournamentCreated();
      onClose();
    } catch (err: any) {
      error(err.message || 'فشل في إنشاء البطولة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('tournaments.create')}</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('tournaments.name')} *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="مثال: كأس النجوم الرمضاني 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">تاريخ الانطلاق *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">تاريخ الختام *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('tournaments.desc')}</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="اذكر عدد الفرق المسموح، نظام المجموعات، الجوائز النقدية، والشروط الفنية..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn btn-gold" style={{ minWidth: '140px' }}>
              {loading ? t('common.loading') : 'نشر البطولة الآن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
