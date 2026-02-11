# Role -> allowed pages mapping
ROLE_PERMISSIONS = {
    'admin': [
        'proje-raporlama',
        'proje-rapor-dagilimi',
        'proje-ongoru-raporu',
        'kullanici-rapor-girisi',
        'canli-sistem-kayitlari',
        'personel-analiz-raporlari',
        'kullanici-profili',
        'yetkilendirme-matrix',
        'izin-talep-yonetimi',
        'kullanici-izin-detaylari',
        'proje-detay-sayfasi',
        'sistem-ayarlari',
        'kullanici-yonetimi',
    ],
    'project_manager': [
        'proje-raporlama',
        'proje-rapor-dagilimi',
        'proje-ongoru-raporu',
        'kullanici-rapor-girisi',
        'canli-sistem-kayitlari',
        'kullanici-profili',
        'proje-detay-sayfasi',
    ],
    'team_leader': [
        'proje-raporlama',
        'proje-rapor-dagilimi',
        'kullanici-rapor-girisi',
        'canli-sistem-kayitlari',
        'personel-analiz-raporlari',
        'kullanici-profili',
        'izin-talep-yonetimi',
        'proje-detay-sayfasi',
    ],
    'hr': [
        'personel-analiz-raporlari',
        'kullanici-profili',
        'izin-talep-yonetimi',
        'kullanici-izin-detaylari',
    ],
    'personal': [
        'kullanici-rapor-girisi',
        'kullanici-profili',
        'kullanici-izin-detaylari',
        'proje-detay-sayfasi',
    ],
}


def has_access(role, page):
    """Check if a role has access to a specific page."""
    allowed = ROLE_PERMISSIONS.get(role, [])
    return page in allowed


def get_allowed_pages(role):
    """Get list of allowed pages for a role."""
    return ROLE_PERMISSIONS.get(role, [])
