import { useState } from 'react';
import { Settings, Bell, Moon, Globe, Shield, Database, Save } from 'lucide-react';

export default function SistemAyarlari() {
    const [settings, setSettings] = useState({
        siteName: 'ANTI-KARMA',
        siteDesc: 'Veri Analiz Platformu',
        language: 'tr',
        darkMode: true,
        notifications: true,
        emailNotifications: true,
        autoLogout: 30,
        sessionTimeout: 24,
        twoFactor: false,
        maintenanceMode: false,
        dbBackup: true,
        backupFrequency: 'daily',
    });

    const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Sistem Ayarları</h1>
                <p className="page-subtitle">Platform yapılandırma ve genel ayarlar</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
                {/* General */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Settings size={18} style={{ color: 'var(--accent-cyan)' }} />
                            <div className="chart-card-title">Genel Ayarlar</div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Site Adı</label>
                        <input className="form-input" value={settings.siteName} onChange={e => update('siteName', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Site Açıklaması</label>
                        <input className="form-input" value={settings.siteDesc} onChange={e => update('siteDesc', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Dil</label>
                        <select className="form-select" value={settings.language} onChange={e => update('language', e.target.value)}>
                            <option value="tr">Türkçe</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <ToggleItem label="Karanlık Mod" checked={settings.darkMode} onChange={v => update('darkMode', v)} />
                </div>

                {/* Notifications */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Bell size={18} style={{ color: 'var(--accent-purple)' }} />
                            <div className="chart-card-title">Bildirim Ayarları</div>
                        </div>
                    </div>
                    <ToggleItem label="Uygulama Bildirimleri" checked={settings.notifications} onChange={v => update('notifications', v)} />
                    <ToggleItem label="E-posta Bildirimleri" checked={settings.emailNotifications} onChange={v => update('emailNotifications', v)} />
                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="form-label">Otomatik Çıkış (dakika)</label>
                        <input className="form-input" type="number" value={settings.autoLogout} onChange={e => update('autoLogout', Number(e.target.value))} />
                    </div>
                </div>

                {/* Security */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Shield size={18} style={{ color: 'var(--accent-teal)' }} />
                            <div className="chart-card-title">Güvenlik Ayarları</div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Oturum Süresi (saat)</label>
                        <input className="form-input" type="number" value={settings.sessionTimeout} onChange={e => update('sessionTimeout', Number(e.target.value))} />
                    </div>
                    <ToggleItem label="İki Faktörlü Doğrulama" checked={settings.twoFactor} onChange={v => update('twoFactor', v)} />
                    <ToggleItem label="Bakım Modu" checked={settings.maintenanceMode} onChange={v => update('maintenanceMode', v)} />
                </div>

                {/* Database */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Database size={18} style={{ color: 'var(--accent-orange)' }} />
                            <div className="chart-card-title">Veritabanı Ayarları</div>
                        </div>
                    </div>
                    <ToggleItem label="Otomatik Yedekleme" checked={settings.dbBackup} onChange={v => update('dbBackup', v)} />
                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="form-label">Yedekleme Sıklığı</label>
                        <select className="form-select" value={settings.backupFrequency} onChange={e => update('backupFrequency', e.target.value)}>
                            <option value="hourly">Saatlik</option>
                            <option value="daily">Günlük</option>
                            <option value="weekly">Haftalık</option>
                            <option value="monthly">Aylık</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button className="btn btn-secondary">İptal</button>
                <button className="btn btn-primary">
                    <Save size={16} /> Kaydet
                </button>
            </div>
        </div>
    );
}

function ToggleItem({ label, checked, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{label}</span>
            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: checked ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'background 0.2s'
                }}
            >
                <span style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
            </button>
        </div>
    );
}
