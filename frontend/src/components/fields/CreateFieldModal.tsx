import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { footballApi } from '../../services/footballApi';

interface CreateFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldCreated: () => void;
}

export const CreateFieldModal: React.FC<CreateFieldModalProps> = ({
  isOpen,
  onClose,
  onFieldCreated,
}) => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !pricePerHour) {
      error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await footballApi.createField({
        name,
        address,
        pricePerHour: Number(pricePerHour),
        description,
      });

      success('تمت إضافة الملعب بنجاح وهو متاح الآن للحجز!');
      onFieldCreated();
      onClose();
    } catch (err: any) {
      error(err.message || 'حدث خطأ أثناء إضافة الملعب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('fields.addNew')}</h3>
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
              <label className="form-label">اسم الملعب *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="مثال: ستاد أليانز التجمع"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">العنوان بالتفصيل *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="مثال: التجمع الخامس، شارع التسعين الشمالي، القاهرة"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">سعر الساعة (ج.م) *</label>
              <input
                type="number"
                required
                min={50}
                className="form-input"
                placeholder="مثال: 450"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">وصف الملعب والخدمات (اختياري)</label>
              <textarea
                className="form-textarea"
                placeholder="اذكر نوع النجيل، مواصفات الإضاءة، المرافق المتاحة كالكافيه وغرف الملابس..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '130px' }}>
              {loading ? t('common.loading') : 'حفظ ونشر الملعب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
