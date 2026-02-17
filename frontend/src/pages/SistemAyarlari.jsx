import { useRef, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Bell, CheckCircle, ChevronDown, ChevronUp, Database, FileSpreadsheet, Globe, Loader2, Moon, Save, Settings, Shield, Trash2, Upload, Users, DownloadCloud } from 'lucide-react';
import client from '../api/client';
import { excelApi } from '../api/excel';

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

    // Excel upload state
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [selectedIdCol, setSelectedIdCol] = useState('');
    const [expandedSheet, setExpandedSheet] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [excelImporting, setExcelImporting] = useState(false);
    const [excelImportResult, setExcelImportResult] = useState('');
    const [dataStatus, setDataStatus] = useState(null);
    const fileInputRef = useRef(null);

    // Load Excel data status on component mount
    useState(() => {
        const loadDataStatus = async () => {
            try {
                const status = await excelApi.getDataStatus();
                setDataStatus(status);
            } catch (error) {
                console.error('Failed to load data status:', error);
            }
        };
        loadDataStatus();
    }, []);

    const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    const handleFileUpload = async (file) => {
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls') && !file.name.toLowerCase().endsWith('.xlsb')) {
            setUploadError('Sadece Excel dosyaları (.xlsx, .xls, .xlsb) kabul edilir');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadResult(null);
        setImportResult(null);
        setSelectedIdCol('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/excel/upload-preview', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setUploadResult(res.data);
            // Auto-select first ID candidate
            const dbSheet = res.data.sheets?.DATABASE;
            if (dbSheet?.idCandidates?.length > 0) {
                setSelectedIdCol(dbSheet.idCandidates[0]);
            }
        } catch (err) {
            setUploadError(err.response?.data?.error || 'Dosya yüklenirken hata oluştu');
        } finally {
            setUploading(false);
        }
    };

    const handleImportUsers = async () => {
        if (!selectedIdCol) {
            setUploadError('Lütfen benzersiz ID sütununu seçin');
            return;
        }
        setImporting(true);
        setImportResult(null);
        setUploadError('');

        try {
            const res = await client.post('/excel/import-all', { idColumn: selectedIdCol });
            setImportResult(res.data);
        } catch (err) {
            setUploadError(err.response?.data?.error || 'Veriler içe aktarılırken hata oluştu');
        } finally {
            setImporting(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const handleDeleteFile = async () => {
        if (!window.confirm('Veritabanı dosyasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            await client.delete('/excel/delete');
            setUploadResult(null);
            setImportResult(null);
            setExpandedSheet(null);
            alert('Veritabanı dosyası başarıyla silindi.');
        } catch (err) {
            alert(err.response?.data?.error || 'Dosya silinirken hata oluştu');
        }
    };

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

                    {/* Excel Data Import Section */}
                    <div style={{ marginTop: 20, padding: '16px', backgroundColor: 'rgba(0, 212, 255, 0.05)', borderRadius: 8, border: '1px solid rgba(0, 212, 255, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <DownloadCloud size={16} style={{ color: '#00d4ff' }} />
                            <h4 style={{ margin: 0, color: '#00d4ff', fontSize: '0.9rem', fontWeight: 600 }}>Excel Veri Entegrasyonu</h4>
                        </div>
                        <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            DATABASE xlsb dosyasından verileri sisteme aktarın. Bu işlem mevcut verileri güncelleyecektir.
                        </p>
                        
                        {dataStatus && (
                            <div style={{ marginBottom: 16, fontSize: '0.8rem' }}>
                                <div style={{ color: dataStatus.status?.fileExists ? '#22c55e' : '#ef4444' }}>
                                    ● Dosya Durumu: {dataStatus.status?.fileExists ? 'Bulundu' : 'Bulunamadı'}
                                </div>
                                {dataStatus.status?.totalRecords > 0 && (
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        ● Toplam Kayıt: {dataStatus.status.totalRecords.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="btn"
                            onClick={async () => {
                                setExcelImporting(true);
                                setExcelImportResult('');
                                try {
                                    const result = await excelApi.importData();
                                    if (result.success) {
                                        setExcelImportResult('Excel verileri başarıyla aktarıldı!');
                                        // Refresh data status
                                        const status = await excelApi.getDataStatus();
                                        setDataStatus(status);
                                    } else {
                                        setExcelImportResult('Veri aktarımında hata: ' + result.error);
                                    }
                                } catch (error) {
                                    setExcelImportResult('Excel veri aktarımı başarısız: ' + error.message);
                                } finally {
                                    setExcelImporting(false);
                                }
                            }}
                            disabled={excelImporting}
                            style={{
                                backgroundColor: '#00d4ff',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 6,
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: excelImporting ? 'not-allowed' : 'pointer',
                                opacity: excelImporting ? 0.7 : 1
                            }}
                        >
                            {excelImporting ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                            {excelImporting ? 'Veri Aktarılıyor...' : 'Excel Verilerini Aktar'}
                        </button>

                        {excelImportResult && (
                            <div style={{
                                marginTop: 12,
                                padding: '8px 12px',
                                borderRadius: 6,
                                fontSize: '0.8rem',
                                backgroundColor: excelImportResult.includes('başarı') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: excelImportResult.includes('başarı') ? '#22c55e' : '#ef4444',
                                border: `1px solid ${excelImportResult.includes('başarı') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                            }}>
                                {excelImportResult}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Excel Upload Section - Full Width */}
            <div className="chart-card" style={{ marginTop: 20 }}>
                <div className="chart-card-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileSpreadsheet size={18} style={{ color: '#22c55e' }} />
                        <div className="chart-card-title">Excel Veritabanı Yükleme</div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 10 }}>
                            (DATABASE, Info, Hourly Rates)
                        </span>
                    </div>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={handleDeleteFile}
                        title="Veritabanı dosyasını sil"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}
                    >
                        <Trash2 size={14} /> Dosyayı Sil
                    </button>
                </div>

                {/* Drag & Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragOver ? '#22c55e' : 'var(--border-color)'}`,
                        borderRadius: 12,
                        padding: '40px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: dragOver ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)',
                        marginBottom: 16,
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.xlsb"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div className="spinner" style={{ width: 36, height: 36, border: '3px solid rgba(34,197,94,0.2)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dosya yükleniyor ve analiz ediliyor...</span>
                        </div>
                    ) : (
                        <>
                            <Upload size={36} style={{ color: dragOver ? '#22c55e' : 'var(--text-muted)', marginBottom: 12, transition: 'color 0.3s' }} />
                            <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                                Excel dosyasını sürükleyip bırakın
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                veya dosya seçmek için tıklayın (.xlsx, .xls, .xlsb)
                            </div>
                        </>
                    )}
                </div>

                {/* Error Message */}
                {uploadError && (
                    <div style={{
                        padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
                        color: '#ef4444', fontSize: '0.85rem', marginBottom: 16,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <AlertCircle size={16} />
                        {uploadError}
                    </div>
                )}

                {/* Upload Result - Sheet Preview */}
                {uploadResult && (
                    <div style={{ marginTop: 8 }}>
                        {/* Summary Bar */}
                        <div style={{
                            display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap',
                        }}>
                            <div style={statBoxStyle}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Toplam Sayfa</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{uploadResult.allSheets?.length || 0}</span>
                            </div>
                            <div style={statBoxStyle}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Okunan Sayfa</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{Object.keys(uploadResult.sheets || {}).length}</span>
                            </div>
                            {uploadResult.missingSheets?.length > 0 && (
                                <div style={statBoxStyle}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Eksik Sayfa</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{uploadResult.missingSheets.length}</span>
                                </div>
                            )}
                        </div>

                        {uploadResult.missingSheets?.length > 0 && (
                            <div style={{
                                padding: '10px 14px', background: 'rgba(251,191,36,0.1)',
                                border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8,
                                color: '#fbbf24', fontSize: '0.85rem', marginBottom: 16,
                            }}>
                                ⚠️ Eksik sayfalar: {uploadResult.missingSheets.join(', ')}
                            </div>
                        )}

                        {/* Sheet Details */}
                        {Object.entries(uploadResult.sheets || {}).map(([sheetName, sheetData]) => (
                            <div key={sheetName} style={{
                                border: '1px solid var(--border-color)', borderRadius: 10,
                                marginBottom: 12, overflow: 'hidden',
                                background: 'rgba(255,255,255,0.02)',
                            }}>
                                <div
                                    onClick={() => setExpandedSheet(expandedSheet === sheetName ? null : sheetName)}
                                    style={{
                                        padding: '14px 18px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        borderBottom: expandedSheet === sheetName ? '1px solid var(--border-color)' : 'none',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <FileSpreadsheet size={16} style={{
                                            color: sheetName === 'DATABASE' ? '#22c55e' : sheetName === 'Info' ? '#3b82f6' : '#f59e0b',
                                        }} />
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{sheetName}</span>
                                        <span style={{
                                            fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20,
                                            background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)',
                                        }}>
                                            {sheetData.rowCount} satır · {sheetData.columns.length} sütun
                                        </span>
                                    </div>
                                    {expandedSheet === sheetName ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                </div>

                                {expandedSheet === sheetName && (
                                    <div style={{ padding: 18 }}>
                                        {/* Column List */}
                                        <div style={{ marginBottom: 14 }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
                                                Sütunlar
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {sheetData.columns.map((col, i) => (
                                                    <span key={i} style={{
                                                        fontSize: '0.8rem', padding: '4px 10px', borderRadius: 6,
                                                        background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
                                                        border: '1px solid var(--border-color)',
                                                    }}>
                                                        {col}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sample Data Table */}
                                        {sheetData.sampleData?.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
                                                    Örnek Veriler (İlk 5 satır)
                                                </div>
                                                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                                        <thead>
                                                            <tr>
                                                                {sheetData.columns.map((col, i) => (
                                                                    <th key={i} style={{
                                                                        padding: '8px 12px', textAlign: 'left',
                                                                        background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)',
                                                                        borderBottom: '1px solid var(--border-color)',
                                                                        whiteSpace: 'nowrap', fontWeight: 600,
                                                                    }}>{col}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sheetData.sampleData.map((row, ri) => (
                                                                <tr key={ri}>
                                                                    {sheetData.columns.map((col, ci) => (
                                                                        <td key={ci} style={{
                                                                            padding: '6px 12px',
                                                                            borderBottom: '1px solid var(--border-color)',
                                                                            color: 'var(--text-secondary)',
                                                                            whiteSpace: 'nowrap', maxWidth: 200,
                                                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                                                        }}>{row[col] ?? '-'}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* ID Column candidates for DATABASE sheet */}
                                        {sheetName === 'DATABASE' && sheetData.idCandidates && (
                                            <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(34,197,94,0.06)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.15)' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#22c55e', marginBottom: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Users size={14} />
                                                    Benzersiz Kullanıcı ID Sütunu Seçin
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <select
                                                        className="form-select"
                                                        value={selectedIdCol}
                                                        onChange={e => setSelectedIdCol(e.target.value)}
                                                        style={{ maxWidth: 250 }}
                                                    >
                                                        <option value="">— Sütun Seçin —</option>
                                                        {sheetData.columns.map((col, i) => (
                                                            <option key={i} value={col}>{col}
                                                                {sheetData[`uniqueCount_${col}`] ? ` (${sheetData[`uniqueCount_${col}`]} benzersiz)` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {selectedIdCol && sheetData[`uniqueCount_${selectedIdCol}`] && (
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {sheetData.totalRows} satırdan <strong style={{ color: '#22c55e' }}>{sheetData[`uniqueCount_${selectedIdCol}`]}</strong> benzersiz kullanıcı bulundu
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Import Users Button */}
                        {uploadResult.sheets?.DATABASE && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleImportUsers}
                                    disabled={!selectedIdCol || importing}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        opacity: (!selectedIdCol || importing) ? 0.5 : 1,
                                    }}
                                >
                                    {importing ? (
                                        <><div className="spinner-small" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> İçe Aktarılıyor...</>
                                    ) : (
                                        <><Users size={16} /> Tüm Verileri İçe Aktar (Kullanıcı, Bilgi, Saat Ücretleri)</>
                                    )}
                                </button>
                                {!selectedIdCol && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Önce DATABASE sayfasını genişletip bir ID sütunu seçin
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Import Result */}
                        {importResult && (
                            <div style={{
                                marginTop: 16, padding: '16px 20px', borderRadius: 10,
                                background: importResult.imported > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(251,191,36,0.08)',
                                border: `1px solid ${importResult.imported > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)'}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <CheckCircle size={18} style={{ color: '#22c55e' }} />
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{importResult.message}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem' }}>
                                    <span style={{ color: '#22c55e' }}>✅ Kullanıcı: <strong>{importResult.stats?.users?.imported || 0}</strong></span>
                                    {importResult.stats?.users?.skipped > 0 && <span style={{ color: '#fbbf24' }}>⏭️ Kullanıcı (Atlanan): <strong>{importResult.stats.users.skipped}</strong></span>}
                                    <span style={{ color: '#3b82f6' }}>ℹ️ Bilgi: <strong>{importResult.stats?.info?.imported || 0}</strong></span>
                                    <span style={{ color: '#8b5cf6' }}>💰 Saat Ücreti: <strong>{importResult.stats?.rates?.imported || 0}</strong></span>
                                </div>
                                {importResult.errors?.length > 0 && (
                                    <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#ef4444' }}>
                                        Hatalar: {[
                                            ...(importResult.stats?.users?.errors || []),
                                            ...(importResult.stats?.info?.errors || []),
                                            ...(importResult.stats?.rates?.errors || [])
                                        ].slice(0, 5).join(', ')}
                                        {((importResult.stats?.users?.errors?.length || 0) + (importResult.stats?.info?.errors?.length || 0) + (importResult.stats?.rates?.errors?.length || 0)) > 5 && '... ve fazlası'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button className="btn btn-secondary">İptal</button>
                <button className="btn btn-primary">
                    <Save size={16} /> Kaydet
                </button>
            </div>

            {/* Spinner animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
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

const statBoxStyle = {
    flex: '1 1 120px',
    padding: '14px 18px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
};
