// ===== PROJECT DATA =====
export const projectData = [
    { name: 'Proje Alpha', tamamlanan: 85, devamEden: 12, bekleyen: 3, mh: 1240 },
    { name: 'Proje Beta', tamamlanan: 62, devamEden: 28, bekleyen: 10, mh: 980 },
    { name: 'Proje Gamma', tamamlanan: 94, devamEden: 4, bekleyen: 2, mh: 1560 },
    { name: 'Proje Delta', tamamlanan: 45, devamEden: 40, bekleyen: 15, mh: 720 },
    { name: 'Proje Epsilon', tamamlanan: 78, devamEden: 18, bekleyen: 4, mh: 1100 },
    { name: 'Proje Zeta', tamamlanan: 33, devamEden: 52, bekleyen: 15, mh: 450 },
];

export const projectCategories = [
    { name: 'Yazılım', value: 35, color: '#00d4ff' },
    { name: 'Donanım', value: 25, color: '#8b5cf6' },
    { name: 'Tasarım', value: 20, color: '#0cdba8' },
    { name: 'Test', value: 12, color: '#f59e0b' },
    { name: 'Diğer', value: 8, color: '#ef4444' },
];

export const monthlyTrend = [
    { ay: 'Oca', gerceklesen: 120, planlanan: 130 },
    { ay: 'Şub', gerceklesen: 145, planlanan: 140 },
    { ay: 'Mar', gerceklesen: 160, planlanan: 155 },
    { ay: 'Nis', gerceklesen: 175, planlanan: 170 },
    { ay: 'May', gerceklesen: 190, planlanan: 180 },
    { ay: 'Haz', gerceklesen: 210, planlanan: 200 },
    { ay: 'Tem', gerceklesen: 195, planlanan: 210 },
    { ay: 'Ağu', gerceklesen: 220, planlanan: 215 },
    { ay: 'Eyl', gerceklesen: 240, planlanan: 230 },
    { ay: 'Eki', gerceklesen: 255, planlanan: 245 },
    { ay: 'Kas', gerceklesen: 270, planlanan: 260 },
    { ay: 'Ara', gerceklesen: 290, planlanan: 280 },
];

// ===== FORECAST DATA =====
export const forecastData = [
    { tarih: '2025-01', gercek: 45, tahmin: null },
    { tarih: '2025-02', gercek: 52, tahmin: null },
    { tarih: '2025-03', gercek: 58, tahmin: null },
    { tarih: '2025-04', gercek: 61, tahmin: null },
    { tarih: '2025-05', gercek: 70, tahmin: null },
    { tarih: '2025-06', gercek: 75, tahmin: null },
    { tarih: '2025-07', gercek: 82, tahmin: null },
    { tarih: '2025-08', gercek: 88, tahmin: null },
    { tarih: '2025-09', gercek: 92, tahmin: 92 },
    { tarih: '2025-10', gercek: null, tahmin: 98 },
    { tarih: '2025-11', gercek: null, tahmin: 105 },
    { tarih: '2025-12', gercek: null, tahmin: 112 },
];

// ===== REPORT ENTRIES =====
export const reportEntries = [
    { id: 1, tarih: '2025-09-15', proje: 'Proje Alpha', gorev: 'Frontend Geliştirme', mh: 8, durum: 'Tamamlandı', kategori: 'Yazılım' },
    { id: 2, tarih: '2025-09-15', proje: 'Proje Beta', gorev: 'API Entegrasyonu', mh: 6, durum: 'Devam Ediyor', kategori: 'Yazılım' },
    { id: 3, tarih: '2025-09-14', proje: 'Proje Gamma', gorev: 'Veritabanı Tasarımı', mh: 4, durum: 'Tamamlandı', kategori: 'Yazılım' },
    { id: 4, tarih: '2025-09-14', proje: 'Proje Alpha', gorev: 'UI/UX Tasarım', mh: 7, durum: 'Tamamlandı', kategori: 'Tasarım' },
    { id: 5, tarih: '2025-09-13', proje: 'Proje Delta', gorev: 'Test Senaryoları', mh: 5, durum: 'Bekliyor', kategori: 'Test' },
    { id: 6, tarih: '2025-09-13', proje: 'Proje Epsilon', gorev: 'Performans Optimizasyonu', mh: 6, durum: 'Devam Ediyor', kategori: 'Yazılım' },
    { id: 7, tarih: '2025-09-12', proje: 'Proje Zeta', gorev: 'Dokümantasyon', mh: 3, durum: 'Tamamlandı', kategori: 'Diğer' },
    { id: 8, tarih: '2025-09-12', proje: 'Proje Beta', gorev: 'Güvenlik Testi', mh: 8, durum: 'Devam Ediyor', kategori: 'Test' },
    { id: 9, tarih: '2025-09-11', proje: 'Proje Alpha', gorev: 'Deployment', mh: 4, durum: 'Tamamlandı', kategori: 'Yazılım' },
    { id: 10, tarih: '2025-09-11', proje: 'Proje Gamma', gorev: 'Donanım Kurulumu', mh: 6, durum: 'Bekliyor', kategori: 'Donanım' },
];

// ===== SYSTEM RECORDS =====
export const systemRecords = [
    { id: 1, zaman: '14:23:15', kullanici: 'Ahmet Yılmaz', islem: 'Rapor Oluşturma', modul: 'Proje Raporlama', durum: 'Başarılı', ip: '192.168.1.10' },
    { id: 2, zaman: '14:22:08', kullanici: 'Mehmet Kaya', islem: 'Veri Güncelleme', modul: 'Kullanıcı Rapor Girişi', durum: 'Başarılı', ip: '192.168.1.15' },
    { id: 3, zaman: '14:21:45', kullanici: 'Ayşe Demir', islem: 'İzin Talebi', modul: 'İzin Talep Yönetimi', durum: 'Bekliyor', ip: '192.168.1.22' },
    { id: 4, zaman: '14:20:33', kullanici: 'Fatma Şahin', islem: 'Sistem Girişi', modul: 'Kimlik Doğrulama', durum: 'Başarılı', ip: '192.168.1.8' },
    { id: 5, zaman: '14:19:12', kullanici: 'Ali Öztürk', islem: 'Dosya Yükleme', modul: 'Proje Detay', durum: 'Başarısız', ip: '192.168.1.30' },
    { id: 6, zaman: '14:18:50', kullanici: 'Zeynep Arslan', islem: 'Yetki Güncelleme', modul: 'Yetkilendirme Matrix', durum: 'Başarılı', ip: '192.168.1.5' },
    { id: 7, zaman: '14:17:22', kullanici: 'Hasan Çelik', islem: 'Rapor İndirme', modul: 'Proje Raporlama', durum: 'Başarılı', ip: '192.168.1.18' },
    { id: 8, zaman: '14:16:01', kullanici: 'Elif Yıldız', islem: 'Profil Güncelleme', modul: 'Kullanıcı Profili', durum: 'Başarılı', ip: '192.168.1.25' },
];

// ===== PERSONNEL DATA =====
export const personnelData = [
    { id: 1, ad: 'Ahmet Yılmaz', departman: 'Yazılım', pozisyon: 'Kıdemli Geliştirici', toplamMH: 180, tamamlanan: 45, performans: 92 },
    { id: 2, ad: 'Mehmet Kaya', departman: 'Yazılım', pozisyon: 'Geliştirici', toplamMH: 160, tamamlanan: 38, performans: 85 },
    { id: 3, ad: 'Ayşe Demir', departman: 'Tasarım', pozisyon: 'UI/UX Tasarımcı', toplamMH: 150, tamamlanan: 42, performans: 90 },
    { id: 4, ad: 'Fatma Şahin', departman: 'Test', pozisyon: 'Test Mühendisi', toplamMH: 140, tamamlanan: 35, performans: 88 },
    { id: 5, ad: 'Ali Öztürk', departman: 'Donanım', pozisyon: 'Donanım Mühendisi', toplamMH: 170, tamamlanan: 40, performans: 86 },
    { id: 6, ad: 'Zeynep Arslan', departman: 'Yazılım', pozisyon: 'Backend Geliştirici', toplamMH: 165, tamamlanan: 43, performans: 94 },
    { id: 7, ad: 'Hasan Çelik', departman: 'Proje Yönetimi', pozisyon: 'Proje Yöneticisi', toplamMH: 120, tamamlanan: 30, performans: 91 },
    { id: 8, ad: 'Elif Yıldız', departman: 'Yazılım', pozisyon: 'Full Stack Geliştirici', toplamMH: 175, tamamlanan: 44, performans: 93 },
];

export const departmentPerformance = [
    { departman: 'Yazılım', ortalama: 91, kisi: 4 },
    { departman: 'Tasarım', ortalama: 90, kisi: 1 },
    { departman: 'Test', ortalama: 88, kisi: 1 },
    { departman: 'Donanım', ortalama: 86, kisi: 1 },
    { departman: 'Proje Yönetimi', ortalama: 91, kisi: 1 },
];

// ===== AUTHORIZATION MATRIX =====
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

// ===== LEAVE DATA =====
export const leaveRequests = [
    { id: 1, personel: 'Ahmet Yılmaz', tur: 'Yıllık İzin', baslangic: '2025-10-01', bitis: '2025-10-05', gun: 5, durum: 'Onaylandı' },
    { id: 2, personel: 'Mehmet Kaya', tur: 'Hastalık İzni', baslangic: '2025-09-28', bitis: '2025-09-29', gun: 2, durum: 'Bekliyor' },
    { id: 3, personel: 'Ayşe Demir', tur: 'Yıllık İzin', baslangic: '2025-10-10', bitis: '2025-10-14', gun: 5, durum: 'Bekliyor' },
    { id: 4, personel: 'Fatma Şahin', tur: 'Mazeret İzni', baslangic: '2025-09-25', bitis: '2025-09-25', gun: 1, durum: 'Onaylandı' },
    { id: 5, personel: 'Ali Öztürk', tur: 'Yıllık İzin', baslangic: '2025-11-01', bitis: '2025-11-08', gun: 8, durum: 'Reddedildi' },
    { id: 6, personel: 'Zeynep Arslan', tur: 'Doğum İzni', baslangic: '2025-12-01', bitis: '2026-02-28', gun: 90, durum: 'Onaylandı' },
    { id: 7, personel: 'Hasan Çelik', tur: 'Yıllık İzin', baslangic: '2025-10-20', bitis: '2025-10-24', gun: 5, durum: 'Bekliyor' },
];

export const leaveStats = [
    { tur: 'Yıllık İzin', kullanan: 28, toplam: 45 },
    { tur: 'Hastalık İzni', kullanan: 12, toplam: 15 },
    { tur: 'Mazeret İzni', kullanan: 8, toplam: 10 },
    { tur: 'Doğum İzni', kullanan: 1, toplam: 2 },
];

export const leaveMonthly = [
    { ay: 'Oca', izinGun: 15 }, { ay: 'Şub', izinGun: 12 },
    { ay: 'Mar', izinGun: 18 }, { ay: 'Nis', izinGun: 22 },
    { ay: 'May', izinGun: 20 }, { ay: 'Haz', izinGun: 35 },
    { ay: 'Tem', izinGun: 45 }, { ay: 'Ağu', izinGun: 42 },
    { ay: 'Eyl', izinGun: 18 }, { ay: 'Eki', izinGun: 25 },
    { ay: 'Kas', izinGun: 14 }, { ay: 'Ara', izinGun: 30 },
];

// ===== USER LEAVE DETAILS =====
export const userLeaveDetails = [
    { id: 1, tur: 'Yıllık İzin', hakEdilen: 14, kullanan: 8, kalan: 6 },
    { id: 2, tur: 'Hastalık İzni', hakEdilen: 10, kullanan: 3, kalan: 7 },
    { id: 3, tur: 'Mazeret İzni', hakEdilen: 5, kullanan: 2, kalan: 3 },
];

export const userLeaveHistory = [
    { id: 1, tur: 'Yıllık İzin', baslangic: '2025-03-10', bitis: '2025-03-14', gun: 5, durum: 'Onaylandı' },
    { id: 2, tur: 'Hastalık İzni', baslangic: '2025-05-22', bitis: '2025-05-23', gun: 2, durum: 'Onaylandı' },
    { id: 3, tur: 'Yıllık İzin', baslangic: '2025-07-01', bitis: '2025-07-03', gun: 3, durum: 'Onaylandı' },
    { id: 4, tur: 'Hastalık İzni', baslangic: '2025-08-15', bitis: '2025-08-15', gun: 1, durum: 'Onaylandı' },
    { id: 5, tur: 'Mazeret İzni', baslangic: '2025-09-05', bitis: '2025-09-06', gun: 2, durum: 'Onaylandı' },
];

// ===== PROJECT DETAIL =====
export const projectDetail = {
    ad: 'Proje Alpha',
    aciklama: 'Kurumsal veri analiz platformu geliştirme projesi',
    baslangic: '2025-01-15',
    bitis: '2025-12-31',
    ilerleme: 72,
    durum: 'Devam Ediyor',
    yonetici: 'Hasan Çelik',
    butce: 450000,
    harcanan: 324000,
};

export const projectTasks = [
    { id: 1, gorev: 'Gereksinim Analizi', atanan: 'Hasan Çelik', baslangic: '2025-01-15', bitis: '2025-02-15', ilerleme: 100, durum: 'Tamamlandı' },
    { id: 2, gorev: 'Veritabanı Tasarımı', atanan: 'Zeynep Arslan', baslangic: '2025-02-01', bitis: '2025-03-15', ilerleme: 100, durum: 'Tamamlandı' },
    { id: 3, gorev: 'Backend Geliştirme', atanan: 'Zeynep Arslan', baslangic: '2025-03-01', bitis: '2025-06-30', ilerleme: 90, durum: 'Devam Ediyor' },
    { id: 4, gorev: 'Frontend Geliştirme', atanan: 'Ahmet Yılmaz', baslangic: '2025-04-01', bitis: '2025-08-31', ilerleme: 75, durum: 'Devam Ediyor' },
    { id: 5, gorev: 'UI/UX Tasarım', atanan: 'Ayşe Demir', baslangic: '2025-02-15', bitis: '2025-05-31', ilerleme: 100, durum: 'Tamamlandı' },
    { id: 6, gorev: 'Test & QA', atanan: 'Fatma Şahin', baslangic: '2025-06-01', bitis: '2025-10-31', ilerleme: 40, durum: 'Devam Ediyor' },
    { id: 7, gorev: 'Deployment', atanan: 'Elif Yıldız', baslangic: '2025-10-01', bitis: '2025-12-31', ilerleme: 0, durum: 'Bekliyor' },
];

export const projectTeam = [
    { ad: 'Hasan Çelik', rol: 'Proje Yöneticisi', departman: 'Proje Yönetimi' },
    { ad: 'Ahmet Yılmaz', rol: 'Frontend Geliştirici', departman: 'Yazılım' },
    { ad: 'Zeynep Arslan', rol: 'Backend Geliştirici', departman: 'Yazılım' },
    { ad: 'Ayşe Demir', rol: 'UI/UX Tasarımcı', departman: 'Tasarım' },
    { ad: 'Fatma Şahin', rol: 'Test Mühendisi', departman: 'Test' },
    { ad: 'Elif Yıldız', rol: 'DevOps Mühendisi', departman: 'Yazılım' },
];

// ===== REPORT DISTRIBUTION =====
export const reportDistribution = [
    { kategori: 'Yazılım', alfa: 45, beta: 30, gamma: 55, delta: 20, epsilon: 38 },
    { kategori: 'Tasarım', alfa: 20, beta: 15, gamma: 10, delta: 25, epsilon: 18 },
    { kategori: 'Test', alfa: 15, beta: 20, gamma: 18, delta: 12, epsilon: 22 },
    { kategori: 'Donanım', alfa: 10, beta: 25, gamma: 12, delta: 30, epsilon: 15 },
    { kategori: 'Diğer', alfa: 10, beta: 10, gamma: 5, delta: 13, epsilon: 7 },
];

export const weeklyDistribution = [
    { hafta: 'Hafta 1', rapor: 42, onay: 38 },
    { hafta: 'Hafta 2', rapor: 55, onay: 48 },
    { hafta: 'Hafta 3', rapor: 38, onay: 35 },
    { hafta: 'Hafta 4', rapor: 62, onay: 58 },
];

// ===== PROFILE ACTIVITY =====
export const profileActivity = [
    { ay: 'Oca', rapor: 12, gorev: 18 },
    { ay: 'Şub', rapor: 15, gorev: 22 },
    { ay: 'Mar', rapor: 18, gorev: 20 },
    { ay: 'Nis', rapor: 14, gorev: 25 },
    { ay: 'May', rapor: 20, gorev: 28 },
    { ay: 'Haz', rapor: 22, gorev: 30 },
];
