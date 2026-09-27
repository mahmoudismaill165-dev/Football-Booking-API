import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroBanner } from './components/layout/HeroBanner';
import { Footer } from './components/layout/Footer';
import { FieldCard } from './components/fields/FieldCard';
import { FieldFilters } from './components/fields/FieldFilters';
import { BookingModal } from './components/fields/BookingModal';
import { FieldDetailsModal } from './components/fields/FieldDetailsModal';
import { CreateFieldModal } from './components/fields/CreateFieldModal';
import { BookingsList } from './components/bookings/BookingsList';
import { TournamentsList } from './components/tournaments/TournamentsList';
import { CreateTournamentModal } from './components/tournaments/CreateTournamentModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { Field } from './types';
import { footballApi } from './services/footballApi';

const MainAppContent: React.FC = () => {
  const { t } = useLanguage();
  const { role } = useAuth();
  const { error } = useToast();

  const [currentTab, setCurrentTab] = useState<string>('fields');

  // Fields filter state
  const [fields, setFields] = useState<Field[]>([]);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [loadingFields, setLoadingFields] = useState(false);

  // Modals state
  const [bookingField, setBookingField] = useState<Field | null>(null);
  const [detailsField, setDetailsField] = useState<Field | null>(null);
  const [createFieldOpen, setCreateFieldOpen] = useState(false);
  const [createTournamentOpen, setCreateTournamentOpen] = useState(false);

  const fieldsSectionRef = useRef<HTMLDivElement>(null);

  const fetchFields = async () => {
    setLoadingFields(true);
    try {
      const res = await footballApi.getAllFields({
        search: search || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: sort || undefined,
      });
      setFields(res.fields);
    } catch (err: any) {
      error(err.message || 'فشل في تحميل الملاعب');
    } finally {
      setLoadingFields(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [search, minPrice, maxPrice, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSort('');
  };

  const scrollToFields = () => {
    if (currentTab !== 'fields') {
      setCurrentTab('fields');
    }
    setTimeout(() => {
      fieldsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCreateField={() => setCreateFieldOpen(true)}
        onOpenCreateTournament={() => setCreateTournamentOpen(true)}
      />

      {/* VIEW: FIELDS / HOME */}
      {currentTab === 'fields' && (
        <main style={{ flex: 1 }}>
          <HeroBanner
            searchQuery={search}
            onSearchChange={setSearch}
            onExploreTournaments={() => setCurrentTab('tournaments')}
            onScrollToFields={scrollToFields}
          />

          <div
            ref={fieldsSectionRef}
            id="fields"
            style={{ maxWidth: '1240px', margin: '0 auto', padding: '3rem 1.5rem' }}
          >
            {/* Filter Bar */}
            <FieldFilters
              search={search}
              onSearchChange={setSearch}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              sort={sort}
              onSortChange={setSort}
              onReset={handleResetFilters}
              totalResults={fields.length}
            />

            {/* Pitches Grid */}
            {loadingFields ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                {t('common.loading')}
              </div>
            ) : fields.length === 0 ? (
              <div
                className="glass-panel"
                style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {t('fields.noResults')}
                </h3>
                <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                  {t('fields.resetFilters')}
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.75rem',
                }}
              >
                {fields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    onBook={(f) => setBookingField(f)}
                    onViewDetails={(f) => setDetailsField(f)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW: TOURNAMENTS */}
      {currentTab === 'tournaments' && (
        <main style={{ flex: 1 }}>
          <TournamentsList onOpenCreateModal={() => setCreateTournamentOpen(true)} />
        </main>
      )}

      {/* VIEW: MY BOOKINGS (PLAYER) */}
      {currentTab === 'my-bookings' && (
        <main style={{ flex: 1 }}>
          <BookingsList isOwnerView={false} />
        </main>
      )}

      {/* VIEW: OWNER BOOKINGS (FIELD OWNER) */}
      {currentTab === 'owner-bookings' && (
        <main style={{ flex: 1 }}>
          <BookingsList isOwnerView={true} />
        </main>
      )}

      {/* VIEW: ADMIN DASHBOARD */}
      {currentTab === 'admin' && (
        <main style={{ flex: 1 }}>
          <AdminDashboard />
        </main>
      )}

      {/* FOOTER */}
      <Footer />

      {/* Interactive Booking Wizard Modal */}
      <BookingModal
        isOpen={!!bookingField}
        field={bookingField}
        onClose={() => setBookingField(null)}
        onBookingSuccess={() => {
          if (role === 'PLAYER') {
            setCurrentTab('my-bookings');
          }
        }}
      />

      {/* Field Details & Reviews Modal */}
      <FieldDetailsModal
        isOpen={!!detailsField}
        field={detailsField}
        onClose={() => setDetailsField(null)}
        onBook={(f) => {
          setDetailsField(null);
          setBookingField(f);
        }}
      />

      {/* Create Field Modal (Owner) */}
      <CreateFieldModal
        isOpen={createFieldOpen}
        onClose={() => setCreateFieldOpen(false)}
        onFieldCreated={fetchFields}
      />

      {/* Create Tournament Modal (Organizer) */}
      <CreateTournamentModal
        isOpen={createTournamentOpen}
        onClose={() => setCreateTournamentOpen(false)}
        onTournamentCreated={() => {
          setCurrentTab('tournaments');
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
