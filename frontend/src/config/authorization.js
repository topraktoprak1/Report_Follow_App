export const authorizationRoles = ['Admin', 'Proje Yöneticisi', 'Takım Lideri', 'İnsan Kaynakları', 'Personel'];
export const authorizationModules = [
    'Proje Raporlama', 'Rapor Dağılımı', 'Öngörü Raporu', 'Rapor Girişi',
    'Sistem Kayıtları', 'Personel Analiz', 'Kullanıcı Profili', 'Yetkilendirme',
    'İzin Yönetimi', 'İzin Detayları', 'Proje Detay', 'Sistem Ayarları', 'Kullanıcı Yönetimi',
];
export const authorizationMatrix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Admin
    [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0], // PM
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0], // TL
    [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0], // HR
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0], // Personal
];
