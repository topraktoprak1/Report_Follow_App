// Role -> page access mapping (mirrors backend)
export const ROLE_PERMISSIONS = {
    admin: [
        'proje-raporlama', 'proje-rapor-dagilimi', 'proje-ongoru-raporu',
        'kullanici-rapor-girisi', 'canli-sistem-kayitlari', 'personel-analiz-raporlari',
        'kullanici-profili', 'yetkilendirme-matrix', 'izin-talep-yonetimi',
        'kullanici-izin-detaylari', 'proje-detay-sayfasi', 'sistem-ayarlari', 'kullanici-yonetimi',
    ],
    project_manager: [
        'proje-raporlama', 'proje-rapor-dagilimi', 'proje-ongoru-raporu',
        'kullanici-rapor-girisi', 'canli-sistem-kayitlari', 'kullanici-profili', 'proje-detay-sayfasi',
    ],
    team_leader: [
        'proje-raporlama', 'proje-rapor-dagilimi', 'kullanici-rapor-girisi',
        'canli-sistem-kayitlari', 'personel-analiz-raporlari', 'kullanici-profili',
        'izin-talep-yonetimi', 'proje-detay-sayfasi',
    ],
    hr: [
        'personel-analiz-raporlari', 'kullanici-profili',
        'izin-talep-yonetimi', 'kullanici-izin-detaylari',
    ],
    personal: [
        'kullanici-rapor-girisi', 'kullanici-profili',
        'kullanici-izin-detaylari', 'proje-detay-sayfasi',
    ],
};

export const ROLE_LABELS = {
    admin: 'Admin',
    project_manager: 'Proje Yöneticisi',
    team_leader: 'Takım Lideri',
    hr: 'İnsan Kaynakları',
    personal: 'Personel',
};

export const PAGE_CONFIG = [
    { key: 'proje-raporlama', label: 'Proje Raporlama', path: '/proje-raporlama', icon: 'BarChart3' },
    { key: 'proje-rapor-dagilimi', label: 'Proje Rapor Dağılımı', path: '/proje-rapor-dagilimi', icon: 'PieChart' },
    { key: 'proje-ongoru-raporu', label: 'Proje Öngörü Raporu', path: '/proje-ongoru-raporu', icon: 'TrendingUp' },
    { key: 'kullanici-rapor-girisi', label: 'Kullanıcı Rapor Girişi', path: '/kullanici-rapor-girisi', icon: 'FileEdit' },
    { key: 'canli-sistem-kayitlari', label: 'Canlı Sistem Kayıtları', path: '/canli-sistem-kayitlari', icon: 'Radio' },
    { key: 'personel-analiz-raporlari', label: 'Personel Analiz Raporları', path: '/personel-analiz-raporlari', icon: 'Users' },
    { key: 'kullanici-profili', label: 'Kullanıcı Profili', path: '/kullanici-profili', icon: 'UserCircle' },
    { key: 'yetkilendirme-matrix', label: 'Yetkilendirme Matrix', path: '/yetkilendirme-matrix', icon: 'Shield' },
    { key: 'izin-talep-yonetimi', label: 'İzin Talep Yönetimi', path: '/izin-talep-yonetimi', icon: 'CalendarCheck' },
    { key: 'kullanici-izin-detaylari', label: 'Kullanıcı İzin Detayları', path: '/kullanici-izin-detaylari', icon: 'CalendarDays' },
    { key: 'proje-detay-sayfasi', label: 'Proje Detay Sayfası', path: '/proje-detay-sayfasi', icon: 'FolderOpen' },
    { key: 'sistem-ayarlari', label: 'Sistem Ayarları', path: '/sistem-ayarlari', icon: 'Settings' },
    { key: 'kullanici-yonetimi', label: 'Kullanıcı Yönetimi', path: '/kullanici-yonetimi', icon: 'UserCog' },
];
