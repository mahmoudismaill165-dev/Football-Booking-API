import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FieldFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  minPrice: string;
  onMinPriceChange: (val: string) => void;
  maxPrice: string;
  onMaxPriceChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  onReset: () => void;
  totalResults: number;
}

export const FieldFilters: React.FC<FieldFiltersProps> = ({
  search,
  onSearchChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sort,
  onSortChange,
  onReset,
  totalResults,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="#10b981" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
            تصفية وفرز الملاعب
          </h4>
          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
            {totalResults} {t('fields.count')}
          </span>
        </div>

        <button
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', gap: '4px' }}
        >
          <RotateCcw size={13} />
          {t('fields.resetFilters')}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Search */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>
            {t('fields.search')}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="مثال: التجمع، زايد، أليانز..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Min Price */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>
            {t('fields.minPrice')}
          </label>
          <input
            type="number"
            className="form-input"
            placeholder="مثال: 300"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>
            {t('fields.maxPrice')}
          </label>
          <input
            type="number"
            className="form-input"
            placeholder="مثال: 600"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>
            {t('fields.sortBy')}
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.88rem' }}
            >
              <option value="">{t('fields.sortDefault')}</option>
              <option value="priceAsc">{t('fields.sortPriceAsc')}</option>
              <option value="priceDesc">{t('fields.sortPriceDesc')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
