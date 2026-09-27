import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand
    'brand.name': 'كورة أرينا',
    'brand.slogan': 'منصتك الأولى لحجز ملاعب كرة القدم وتنظيم البطولات',

    // Nav
    'nav.fields': 'استكشف الملاعب',
    'nav.tournaments': 'البطولات',
    'nav.myBookings': 'حجوزاتي',
    'nav.ownerFields': 'ملاعبي',
    'nav.ownerBookings': 'إدارة الحجوزات',
    'nav.organizerTournaments': 'تنظيم البطولات',
    'nav.adminDashboard': 'لوحة التحكم',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'حساب جديد',
    'nav.logout': 'تسجيل الخروج',
    'nav.demoMode': 'وضع العرض التجريبي',
    'nav.liveMode': 'وضع الخادم المباشر',

    // Hero
    'hero.title': 'احجز ملعبك المفضل في ثوانٍ معدودة',
    'hero.subtitle': 'أكثر من 50+ ملعب بمواصفات دولية، حجز فوري، دفع آمن، وتنظيم بطولات تنافسية',
    'hero.searchPlaceholder': 'ابحث باسم الملعب، المنطقة أو المدينة...',
    'hero.bookNow': 'احجز ملعبك الآن',
    'hero.exploreTournaments': 'تصفح البطولات الحالية',

    // Roles
    'role.PLAYER': 'لاعب',
    'role.OWNER': 'صاحب ملعب',
    'role.ORGANIZER': 'منظم بطولات',
    'role.ADMIN': 'مدير النظام',

    // Field Filters & Cards
    'fields.title': 'الملاعب المتاحة للحجز',
    'fields.count': 'ملعب متوفر',
    'fields.search': 'بحث بالاسم أو العنوان',
    'fields.minPrice': 'أدنى سعر / ساعة',
    'fields.maxPrice': 'أقصى سعر / ساعة',
    'fields.sortBy': 'ترتيب حسب',
    'fields.sortDefault': 'الافتراضي',
    'fields.sortPriceAsc': 'السعر: من الأقل للأعلى',
    'fields.sortPriceDesc': 'السعر: من الأعلى للأقل',
    'fields.resetFilters': 'إعادة ضبط الفلاتر',
    'fields.perHour': 'ج.م / ساعة',
    'fields.book': 'حجز الملعب',
    'fields.details': 'تفاصيل الملعب والتقييمات',
    'fields.noResults': 'لم يتم العثور على ملاعب مطابقة لبحثك',
    'fields.addNew': 'إضافة ملعب جديد',

    // Booking modal
    'booking.title': 'حجز ملعب',
    'booking.date': 'تاريخ الحجز',
    'booking.startTime': 'وقت البدء',
    'booking.endTime': 'وقت الانتهاء',
    'booking.duration': 'المدة الإجمالية',
    'booking.hours': 'ساعة',
    'booking.totalPrice': 'الإجمالي المقدر',
    'booking.confirmBtn': 'تأكيد وحجز الآن',
    'booking.timeValidation': 'يجب أن يكون وقت الانتهاء بعد وقت البدء',
    'booking.conflict': 'هذا الوقت محجوز بالفعل، يرجى اختيار موعد آخر',

    // Statuses
    'status.PENDING': 'قيد الانتظار',
    'status.CONFIRMED': 'مؤكد',
    'status.CANCELLED': 'ملغي',
    'status.COMPLETED': 'مكتمل',
    'status.VERIFIED': 'تم التحقق والدفع',
    'status.REJECTED': 'مرفوض',

    // Payments
    'payment.title': 'سداد الحجز',
    'payment.method': 'طريقة الدفع',
    'payment.vodafone': 'فودافون كاش / محافظ إلكترونية',
    'payment.instapay': 'إنستاباي (InstaPay)',
    'payment.card': 'بطاقة بنكية (فيزا / ماستركارد)',
    'payment.cash': 'دفع نقدي عند الحضور',
    'payment.transactionId': 'رقم المعاملة / التحويل',
    'payment.uploadProof': 'رفع إيصال أو لقطة شاشة التحويل',
    'payment.submit': 'إتمام الدفع',
    'payment.proofUploaded': 'تم رفع إيصال الدفع بنجاح',
    'payment.verify': 'مراجعة وتأكيد الدفع',
    'payment.approve': 'قبول وتأكيد',
    'payment.reject': 'رفض الإيصال',

    // Reviews
    'review.title': 'تقييم الملعب',
    'review.rating': 'التقييم من 5 نجوم',
    'review.comment': 'اكتب رأيك عن جودة الملعب والخدمات...',
    'review.submit': 'نشر التقييم',
    'review.onlyCompleted': 'يمكنك تقييم الملعب فقط بعد اكتمال حجزك',

    // Tournaments
    'tournaments.title': 'البطولات والمنافسات الرياضية',
    'tournaments.subtitle': 'انضم إلى أقوى البطولات الرمضانية والصيفية ونافس على الجوائز الكبرى',
    'tournaments.create': 'إنشاء بطولة جديدة',
    'tournaments.name': 'اسم البطولة',
    'tournaments.desc': 'وصف البطولة والشروط',
    'tournaments.dates': 'الفترة الزمنية',
    'tournaments.join': 'تسجيل الفريق في البطولة',
    'tournaments.joined': 'أنت مسجل بالفعل',
    'tournaments.participants': 'المشاركون',
    'tournaments.viewParticipants': 'عرض الفرق المشاركة',

    // Admin
    'admin.dashboard': 'لوحة الإحصائيات العامة',
    'admin.totalRevenue': 'إجمالي الإيرادات المؤكدة',
    'admin.totalUsers': 'المستخدمين المسجلين',
    'admin.totalFields': 'إجمالي الملاعب',
    'admin.totalBookings': 'الحجوزات',
    'admin.totalTournaments': 'البطولات',
    'admin.usersTab': 'إدارة المستخدمين',
    'admin.reviewsTab': 'إدارة التقييمات',
    'admin.changeRole': 'تعديل الصلاحية',
    'admin.deleteUser': 'حذف الحساب',
    'admin.confirmDelete': 'هل أنت متأكد من الحذف؟',

    // Notifications
    'notifications.title': 'الإشعارات والتنبيهات',
    'notifications.empty': 'لا توجد إشعارات جديدة',
    'notifications.markAllRead': 'تحديد الكل كمقروء',

    // Common
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.close': 'إغلاق',
    'common.loading': 'جاري التحميل...',
    'common.success': 'تمت العملية بنجاح',
    'common.error': 'حدث خطأ، يرجى المحاولة مرة أخرى',
    'common.switchRole': 'تجربة دور آخر (Demo)',
    'common.egp': 'ج.م',
  },
  en: {
    // Brand
    'brand.name': 'KOORA ARENA',
    'brand.slogan': 'Your premier football pitch booking & tournament platform',

    // Nav
    'nav.fields': 'Explore Pitches',
    'nav.tournaments': 'Tournaments',
    'nav.myBookings': 'My Bookings',
    'nav.ownerFields': 'My Fields',
    'nav.ownerBookings': 'Manage Bookings',
    'nav.organizerTournaments': 'My Tournaments',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.login': 'Sign In',
    'nav.register': 'Create Account',
    'nav.logout': 'Sign Out',
    'nav.demoMode': 'Demo Showcase Mode',
    'nav.liveMode': 'Live API Mode',

    // Hero
    'hero.title': 'Book Your Football Pitch in Seconds',
    'hero.subtitle': '50+ world-class pitches, real-time availability, instant confirmation, secure payments & thrilling tournaments',
    'hero.searchPlaceholder': 'Search by pitch name, area or city...',
    'hero.bookNow': 'Book A Pitch Now',
    'hero.exploreTournaments': 'Explore Tournaments',

    // Roles
    'role.PLAYER': 'Player',
    'role.OWNER': 'Field Owner',
    'role.ORGANIZER': 'Tournament Organizer',
    'role.ADMIN': 'Administrator',

    // Field Filters & Cards
    'fields.title': 'Available Football Pitches',
    'fields.count': 'pitches available',
    'fields.search': 'Search by name or address',
    'fields.minPrice': 'Min Price / Hr',
    'fields.maxPrice': 'Max Price / Hr',
    'fields.sortBy': 'Sort By',
    'fields.sortDefault': 'Default',
    'fields.sortPriceAsc': 'Price: Low to High',
    'fields.sortPriceDesc': 'Price: High to Low',
    'fields.resetFilters': 'Reset Filters',
    'fields.perHour': 'EGP / hr',
    'fields.book': 'Book Pitch',
    'fields.details': 'Details & Reviews',
    'fields.noResults': 'No football pitches matched your criteria',
    'fields.addNew': 'Add New Field',

    // Booking modal
    'booking.title': 'Pitch Booking',
    'booking.date': 'Booking Date',
    'booking.startTime': 'Start Time',
    'booking.endTime': 'End Time',
    'booking.duration': 'Total Duration',
    'booking.hours': 'Hours',
    'booking.totalPrice': 'Estimated Total',
    'booking.confirmBtn': 'Confirm & Reserve',
    'booking.timeValidation': 'End time must be after start time',
    'booking.conflict': 'This time slot is already booked. Please choose another time.',

    // Statuses
    'status.PENDING': 'Pending',
    'status.CONFIRMED': 'Confirmed',
    'status.CANCELLED': 'Cancelled',
    'status.COMPLETED': 'Completed',
    'status.VERIFIED': 'Verified & Paid',
    'status.REJECTED': 'Rejected',

    // Payments
    'payment.title': 'Pay for Booking',
    'payment.method': 'Payment Method',
    'payment.vodafone': 'Vodafone Cash / E-Wallets',
    'payment.instapay': 'InstaPay Transfer',
    'payment.card': 'Credit / Debit Card',
    'payment.cash': 'Cash at Pitch',
    'payment.transactionId': 'Transaction / Reference ID',
    'payment.uploadProof': 'Upload Payment Proof / Screenshot',
    'payment.submit': 'Complete Payment',
    'payment.proofUploaded': 'Proof receipt uploaded successfully',
    'payment.verify': 'Review & Verify Payment',
    'payment.approve': 'Approve & Confirm',
    'payment.reject': 'Reject Proof',

    // Reviews
    'review.title': 'Review Field',
    'review.rating': 'Rating (1 - 5 stars)',
    'review.comment': 'Share your experience with this pitch...',
    'review.submit': 'Post Review',
    'review.onlyCompleted': 'You can only review a field after completing your booking',

    // Tournaments
    'tournaments.title': 'Championships & Tournaments',
    'tournaments.subtitle': 'Compete in community leagues and win championship trophies & cash prizes',
    'tournaments.create': 'Host A Tournament',
    'tournaments.name': 'Tournament Name',
    'tournaments.desc': 'Description & Rules',
    'tournaments.dates': 'Schedule Range',
    'tournaments.join': 'Join Tournament',
    'tournaments.joined': 'Already Registered',
    'tournaments.participants': 'Participants',
    'tournaments.viewParticipants': 'View Enrolled Teams',

    // Admin
    'admin.dashboard': 'Platform Overview',
    'admin.totalRevenue': 'Total Verified Revenue',
    'admin.totalUsers': 'Registered Users',
    'admin.totalFields': 'Active Pitches',
    'admin.totalBookings': 'Total Bookings',
    'admin.totalTournaments': 'Tournaments',
    'admin.usersTab': 'User Management',
    'admin.reviewsTab': 'Reviews Moderation',
    'admin.changeRole': 'Change Role',
    'admin.deleteUser': 'Delete User',
    'admin.confirmDelete': 'Are you sure you want to delete this user?',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.empty': 'No new notifications',
    'notifications.markAllRead': 'Mark all as read',

    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.success': 'Operation successful',
    'common.error': 'An error occurred, please try again',
    'common.switchRole': 'Demo Switch Role',
    'common.egp': 'EGP',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  direction: 'rtl',
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'ar';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem('app_language', language);
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
