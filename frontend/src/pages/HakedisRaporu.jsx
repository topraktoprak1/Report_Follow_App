import { useState, useEffect, useCallback } from 'react';
import {
    FileSpreadsheet, Download, Loader2, Search, AlertCircle,
    Building2, FileText, Calendar, RefreshCw, Upload, Database,
    CheckCircle2, BookOpen,
} from 'lucide-react';
import { hakedisApi } from '../api/hakedis.js';

// ─── Tiny helpers ────────────────────────────────────────────────────────────

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : n ?? '—');

function InfoCard({ label, value }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 2,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '10px 14px', minWidth: 160,
        }}>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{value || '—'}</span>
        </div>
    );
}

// ─── Excel Upload Stations ────────────────────────────────────────────────────

const EXCEL_SLOT_CONFIG = [
    { key: 'database',        label: 'DATABASE',        color: '#2563eb', Icon: Database,       desc: 'Ana veri — personel, disiplin, MH, şirket, proje' },
    { key: 'hourly_rates',    label: 'Hourly Rates',    color: '#7c3aed', Icon: FileText,        desc: 'Saatlik ücret tablosu — personel ve sözleşme bazlı' },
    { key: 'hakedis',         label: 'Hakedis',         color: '#059669', Icon: FileSpreadsheet, desc: 'Hakediş takibi — sözleşme no, firma, dönem, tutar (sözleşme listesi buradan gelir)' },
    { key: 'doviz_kurlari',   label: 'Döviz Kurları',   color: '#d97706', Icon: RefreshCw,       desc: 'Döviz kuru tablosu — haftalık USD/TRY ve EUR/USD' },
    { key: 'sirket_isimleri', label: 'Şirket İsimleri', color: '#dc2626', Icon: Building2,       desc: 'Şirket kısa ad / uzun ad eşleştirme tablosu' },
    { key: 'info',            label: 'Info',            color: '#0891b2', Icon: BookOpen,        desc: 'Kapsam, proje ve birim fiyat referans bilgileri' },
];

function ExcelUploadStations({ onAnyUpload, onStatusChange }) {
    const [statuses,  setStatuses]  = useState({});
    const [uploading, setUploading] = useState({});
    const [errors,    setErrors]    = useState({});

    const applyStatuses = (newStatuses) => {
        setStatuses(newStatuses);
        if (onStatusChange) onStatusChange(newStatuses);
    };

    useEffect(() => {
        hakedisApi.getExcelStatus().then(res => {
            if (res.success) applyStatuses(res.data || {});
        });
    }, []);

    const handleFile = async (key, file) => {
        if (!file) return;
        setErrors(prev => ({ ...prev, [key]: '' }));
        setUploading(prev => ({ ...prev, [key]: true }));
        try {
            const res = await hakedisApi.uploadExcel(file, key);
            if (!res.success) throw new Error(res.error || 'Upload failed');
            const next = {
                ...statuses,
                [key]: { uploaded: true, filename: res.filename, rows: res.rows, uploadedAt: new Date().toLocaleTimeString('tr-TR') },
            };
            applyStatuses(next);
            if (onAnyUpload) onAnyUpload(key);
        } catch (e) {
            setErrors(prev => ({ ...prev, [key]: e?.response?.data?.error || e.message || 'Yüklenemedi' }));
        } finally {
            setUploading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleDelete = async (key) => {
        await hakedisApi.deleteExcel(key);
        const next = { ...statuses, [key]: { uploaded: false } };
        applyStatuses(next);
        if (onAnyUpload) onAnyUpload(key);
    };

    const uploadedCount = Object.values(statuses).filter(s => s?.uploaded).length;

    return (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FileSpreadsheet size={16} color="#2563eb" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>Excel Dosyaları</span>
                <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8', background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', marginLeft: 4 }}>
                    {uploadedCount} / {EXCEL_SLOT_CONFIG.length} yüklendi
                </span>
                {uploadedCount > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Sözleşme listesi aktif
                    </span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
                {EXCEL_SLOT_CONFIG.map(({ key, label, color, Icon, desc }) => {
                    const st   = statuses[key] || {};
                    const busy = uploading[key];
                    const err  = errors[key];
                    const inputId = `excel-slot-${key}`;

                    return (
                        <div key={key} style={{
                            border: `1.5px solid ${st.uploaded ? color + '60' : '#e2e8f0'}`,
                            borderRadius: 10, padding: '14px 16px',
                            background: st.uploaded ? color + '08' : '#fafafa',
                            transition: 'border-color .15s, background .15s',
                        }}>
                            {/* Card header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                <div style={{ background: color + '18', borderRadius: 8, padding: 8, flexShrink: 0 }}>
                                    <Icon size={15} color={color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{label}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                                </div>
                            </div>

                            {/* Uploaded state */}
                            {st.uploaded ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
                                            <CheckCircle2 size={13} color="#16a34a" />
                                            <span style={{ fontSize: 11, color: '#166534', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {st.filename}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                            <label htmlFor={inputId} style={{ cursor: 'pointer', padding: '3px 7px', background: color + '18', borderRadius: 5, fontSize: 11, color, fontWeight: 600 }}>
                                                ↑ Değiştir
                                            </label>
                                            <button
                                                onClick={() => handleDelete(key)}
                                                style={{ padding: '3px 7px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 5, fontSize: 11, color: '#dc2626', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                    {st.rows != null && (
                                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 5 }}>
                                            {Number(st.rows).toLocaleString('tr-TR')} satır
                                            {st.uploadedAt ? ` · ${st.uploadedAt}` : ''}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Drop / click to upload */
                                <label htmlFor={inputId} style={{ display: 'block', cursor: busy ? 'default' : 'pointer' }}>
                                    <div style={{
                                        border: `2px dashed ${busy ? color : '#cbd5e1'}`,
                                        borderRadius: 7, padding: '10px', textAlign: 'center',
                                        background: busy ? color + '06' : 'white',
                                        transition: 'all .15s',
                                    }}>
                                        {busy ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color }}>
                                                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Yükleniyor…
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.8 }}>
                                                <Upload size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                .xlsx / .xls seçin veya sürükleyin
                                            </div>
                                        )}
                                    </div>
                                </label>
                            )}

                            <input
                                id={inputId}
                                type="file"
                                accept=".xlsx,.xls,.xlsb"
                                style={{ display: 'none' }}
                                onChange={e => { handleFile(key, e.target.files?.[0]); e.target.value = ''; }}
                                disabled={busy}
                            />

                            {err && (
                                <div style={{ marginTop: 6, fontSize: 11, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <AlertCircle size={12} />{err}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HakedisRaporu() {
    // ── Form state ──
    const [company,      setCompany]      = useState('');
    const [employer,     setEmployer]     = useState('');   // İşveren (client) from Access
    const [contractNo,   setContractNo]   = useState('');
    const [scopeFilter,  setScopeFilter]  = useState('');
    const [startDate,    setStartDate]    = useState('');
    const [endDate,      setEndDate]      = useState('');
    const [reportDate,   setReportDate]   = useState(() => new Date().toISOString().slice(0, 10));
    const [periodText,   setPeriodText]   = useState('');
    const [usdToTlRate,  setUsdToTlRate]  = useState('38');

    // ── Excel upload statuses (shared from ExcelUploadStations) ──
    const [excelStatuses, setExcelStatuses] = useState({});
    const autoRateActive = !!excelStatuses?.doviz_kurlari?.uploaded;

    // ── Dropdown options ──
    const [companies,        setCompanies]        = useState([]);
    const [cascadeData,      setCascadeData]       = useState(null); // { employers, contracts, scopes, source }
    const [employerContracts, setEmployerContracts] = useState([]);  // contracts for selected employer
    const [contractScopes,   setContractScopes]    = useState([]);   // scopes for selected contract

    // ── Result state ──
    const [result,     setResult]     = useState(null);
    const [loading,    setLoading]    = useState(false);
    const [dlLoading,  setDlLoading]  = useState(false);
    const [error,      setError]      = useState('');

    const loadCascade = useCallback((emp, year) => {
        hakedisApi.getCascade({ employer: emp || '', year: year || '' }).then(res => {
            if (res.success) setCascadeData(res);
        });
    }, []);

    // ── Load companies + cascade on mount ──
    useEffect(() => {
        const ALLOWED_COMPANIES = new Set([
            'ABCB','ABRAM','ALİ ENES YILDIRIM','DAMA','GEDES','KARATEK',
            'MARTE','OFK','MURAT SEVİLMİŞ','PINAREVLI','POWERMAKS','PRIMALUNA',
            'PROFESSENG','SAADET EMANET','SELÇUK GÜLARI','STATIX','SEY','İ4',
        ]);
        hakedisApi.getCompanies().then(list =>
            setCompanies(list.filter(c => ALLOWED_COMPANIES.has(c)))
        );
        loadCascade('', '');
    }, []);

    // ── Re-load cascade when employer or startDate year changes ──
    useEffect(() => {
        const year = startDate ? startDate.slice(0, 4) : '';
        loadCascade(employer, year);
    }, [employer, startDate]);

    // ── Level 1→2: company changes → populate contract list from DB ──
    useEffect(() => {
        setContractNo('');
        setScopeFilter('');
        setContractScopes([]);
        if (!cascadeData) {
            setEmployerContracts([]);
            return;
        }
        // contracts keyed by DB company name
        const list = (cascadeData.contracts || {})[company] || [];
        setEmployerContracts(list);
        if (list.length === 1) setContractNo(list[0]);
    }, [company, cascadeData]);

    // ── Level 2→3: contract changes → populate scope list ──
    useEffect(() => {
        setScopeFilter('');
        if (!contractNo || !cascadeData) {
            setContractScopes([]);
            return;
        }
        const list = (cascadeData.scopes || {})[contractNo] || [];
        setContractScopes(list);
        if (list.length === 1) setScopeFilter(list[0]);
    }, [contractNo, cascadeData]);

    // ── Preview ──
    const handlePreview = useCallback(async () => {
        if (!company || !startDate || !endDate) {
            setError('Lütfen Şirket ve tarihleri doldurun.');
            return;
        }
        if (reportDate && endDate && reportDate <= endDate) {
            setError('Rapor tarihi, dönem bitiş tarihinden sonra olmalıdır.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await hakedisApi.generatePreview({
                company, employer, contractNo, scope: scopeFilter,
                startDate, endDate, reportDate, periodText,
                usdToTlRate: autoRateActive ? 0 : (parseFloat(usdToTlRate) || 0),
            });
            if (!res.success) throw new Error(res.error || 'Bilinmeyen hata');
            setResult(res);
        } catch (e) {
            setError(e.message || 'Önizleme yüklenemedi.');
        } finally {
            setLoading(false);
        }
    }, [company, employer, contractNo, scopeFilter, startDate, endDate, reportDate, periodText, usdToTlRate, autoRateActive]);

    // ── Download Excel ──
    const handleDownload = useCallback(async () => {
        if (!company || !startDate || !endDate) {
            setError('Lütfen formu eksiksiz doldurun.');
            return;
        }
        if (reportDate && endDate && reportDate <= endDate) {
            setError('Rapor tarihi, dönem bitiş tarihinden sonra olmalıdır.');
            return;
        }
        setError('');
        setDlLoading(true);
        try {
            await hakedisApi.downloadExcel({
                company, employer, contractNo, scope: scopeFilter,
                startDate, endDate, reportDate, periodText,
                usdToTlRate: autoRateActive ? 0 : (parseFloat(usdToTlRate) || 0),
            });
        } catch (e) {
            setError('Excel indirilemedi: ' + (e.message || 'Hata'));
        } finally {
            setDlLoading(false);
        }
    }, [company, employer, contractNo, scopeFilter, startDate, endDate, reportDate, periodText, usdToTlRate, autoRateActive]);

    const formComplete = company && startDate && endDate;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ padding: '24px 28px', fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b' }}>

            {/* ── Page title ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
                    borderRadius: 10, padding: 10, display: 'flex',
                }}>
                    <FileSpreadsheet size={22} color="white" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Hakediş Raporu</h1>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                        Excel dosyalarını yükleyin, ilişkileri kurun ve hakediş raporunu oluşturun
                    </p>
                </div>
            </div>

            {/* ── Excel Upload Stations ── */}
            <ExcelUploadStations
                onAnyUpload={() => {
                    const year = startDate ? startDate.slice(0, 4) : '';
                    loadCascade(employer, year);
                }}
                onStatusChange={setExcelStatuses}
            />

            {/* ── Form card ── */}
            <div style={{
                background: 'white', borderRadius: 14,
                border: '1px solid #e2e8f0', padding: '20px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginBottom: 20,
            }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Search size={16} /> Rapor Parametreleri
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {/* Company (Projeci / Project Designer) */}
                    <label style={labelStyle}>
                        <span style={labelTextStyle}><Building2 size={13} style={{ marginRight: 4 }} />Projeci Şirket *</span>
                        <select value={company} onChange={e => setCompany(e.target.value)} style={selectStyle}>
                            <option value="">— Seçin —</option>
                            {companies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>

                    {/* İşveren (Employer / Client) — Level 1 of cascade */}
                    <label style={labelStyle}>
                        <span style={labelTextStyle}>
                            <Building2 size={13} style={{ marginRight: 4 }} />İşveren
                            {cascadeData?.source === 'access' && (
                                <span style={{ fontSize: 10, color: '#16a34a', marginLeft: 4 }}>● Access</span>
                            )}
                        </span>
                        <select value={employer} onChange={e => setEmployer(e.target.value)} style={selectStyle}>
                            <option value="">— Tümü —</option>
                            {['AP-CB', 'BALTIC'].map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </label>

                    {/* Sözleşme No (20xx-xx-xx) — Level 2 of cascade */}
                    <label style={labelStyle}>
                        <span style={labelTextStyle}>
                            <FileText size={13} style={{ marginRight: 4 }} />Sözleşme No
                        </span>
                        <select value={contractNo} onChange={e => setContractNo(e.target.value)} style={selectStyle}>
                            <option value="">— Tümü —</option>
                            {employerContracts.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>

                    {/* Kapsam / Scope — Level 3 of cascade */}
                    {contractScopes.length > 0 && (
                        <label style={labelStyle}>
                            <span style={labelTextStyle}>Kapsam</span>
                            <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)} style={selectStyle}>
                                <option value="">— Tümü —</option>
                                {contractScopes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </label>
                    )}

                    {/* Start Date */}
                    <label style={labelStyle}>
                        <span style={labelTextStyle}><Calendar size={13} style={{ marginRight: 4 }} />Dönem Başlangıcı *</span>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                    </label>

                    {/* End Date */}
                    <label style={labelStyle}>
                        <span style={labelTextStyle}><Calendar size={13} style={{ marginRight: 4 }} />Dönem Bitişi *</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => {
                                const val = e.target.value;
                                setEndDate(val);
                                if (val) {
                                    // Auto-fill report date = end date + 1 day
                                    const d = new Date(val);
                                    d.setDate(d.getDate() + 1);
                                    setReportDate(d.toISOString().slice(0, 10));
                                }
                            }}
                            style={inputStyle}
                        />
                    </label>

                    {/* Report Date */}
                    <label style={labelStyle}>
                        <span style={labelTextStyle}>Rapor Tarihi</span>
                        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} style={inputStyle} />
                    </label>

                    {/* Period Text */}
                    <label style={labelStyle}>
                        <span style={labelTextStyle}>Dönem Metni</span>
                        <input
                            type="text" value={periodText}
                            onChange={e => setPeriodText(e.target.value)}
                            placeholder="örn. Aralık 2024"
                            style={inputStyle}
                        />
                    </label>

                    {/* USD → TL Rate — hidden when Döviz Kurları Excel is uploaded */}
                    {autoRateActive ? (
                        <label style={labelStyle}>
                            <span style={labelTextStyle}>USD / TL Kuru</span>
                            <div style={{
                                padding: '8px 10px', borderRadius: 8,
                                border: '1.5px solid #d1fae5', background: '#f0fdf4',
                                color: '#166534', fontSize: 12, fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <CheckCircle2 size={14} color="#16a34a" />
                                Otomatik kur (Döviz Kurları)
                            </div>
                        </label>
                    ) : (
                        <label style={labelStyle}>
                            <span style={labelTextStyle}>USD / TL Kuru *</span>
                            <input
                                type="number" min="1" step="0.01"
                                value={usdToTlRate}
                                onChange={e => setUsdToTlRate(e.target.value)}
                                placeholder="örn. 38"
                                style={inputStyle}
                            />
                        </label>
                    )}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                    <button
                        onClick={handlePreview}
                        disabled={!formComplete || loading}
                        style={btnStyle('#2563eb', !formComplete || loading)}
                    >
                        {loading
                            ? <><Loader2 size={15} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />Yükleniyor…</>
                            : <><Search size={15} style={{ marginRight: 6 }} />Önizle</>
                        }
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={!formComplete || dlLoading}
                        style={btnStyle('#16a34a', !formComplete || dlLoading)}
                    >
                        {dlLoading
                            ? <><Loader2 size={15} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />İndiriliyor…</>
                            : <><Download size={15} style={{ marginRight: 6 }} />Excel İndir</>
                        }
                    </button>

                    {result && (
                        <button
                            onClick={() => setResult(null)}
                            style={btnStyle('#64748b', false, true)}
                        >
                            <RefreshCw size={15} style={{ marginRight: 6 }} />Temizle
                        </button>
                    )}
                </div>

                {error && (
                    <div style={{
                        marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
                        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                        padding: '10px 14px', color: '#dc2626', fontSize: 13,
                    }}>
                        <AlertCircle size={16} />{error}
                    </div>
                )}
            </div>

            {/* ── Results ── */}
            {result && (
                <>
                    {/* Meta info cards */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                        {result.meta?.employer && (
                            <InfoCard label="İşveren"       value={result.meta.employer} />
                        )}
                        <InfoCard label="Projeci Şirket"   value={result.meta?.company} />
                        <InfoCard label="Sözleşme No"      value={result.meta?.contractNo} />
                        <InfoCard label="Dönem"            value={`${result.meta?.startDate} → ${result.meta?.endDate}`} />
                        <InfoCard label="Toplam Kayıt"     value={result.meta?.totalRecords} />
                        <InfoCard label="Cari Dönem K."    value={result.meta?.currentRecords} />
                        {result.meta?.periodText && (
                            <InfoCard label="Dönem Metni"  value={result.meta.periodText} />
                        )}
                        {result.meta?.usdToTlRate && (
                            <InfoCard label="USD/TL Kuru"  value={`1 USD = ${result.meta.usdToTlRate} TL`} />
                        )}
                        {result.meta?.autoRate && (
                            <InfoCard label="Kur Modu"  value="Otomatik (Döviz Kurları)" />
                        )}
                        {result.meta?.hourlyRates && (
                            <InfoCard label="Saat Ücreti"  value="Excel'den Hesaplandı" />
                        )}
                        {result.meta?.nsRegion && (
                            <InfoCard label="Bölge"  value={result.meta.nsRegion === 'South' ? 'Güney' : 'Kuzey'} />
                        )}
                    </div>

                    {/* Summary totals */}
                    {result.totals && (
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20,
                        }}>
                            <SummaryTile
                                label="Cari Dönem MH"
                                value={fmt(result.totals.currentMH)}
                                unit="MH"
                                color="#3b82f6"
                            />
                            <SummaryTile
                                label="Cari Dönem Hakediş"
                                value={fmt(result.totals.currentHakedis)}
                                unit={result.meta?.currency || 'USD'}
                                color="#10b981"
                            />
                            <SummaryTile
                                label="Geçmiş Dönem Hakediş"
                                value={fmt(result.totals.previousHakedis)}
                                unit={result.meta?.currency || 'USD'}
                                color="#f59e0b"
                            />
                            <SummaryTile
                                label="Kümülatif Hakediş"
                                value={fmt(result.totals.cumulativeHakedis)}
                                unit={result.meta?.currency || 'USD'}
                                color="#8b5cf6"
                                highlight
                            />
                        </div>
                    )}

                    {/* Data table */}
                    {result.data?.length > 0 ? (
                        <div style={{
                            background: 'white', borderRadius: 14,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                            overflow: 'auto',
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#1e3a5f', color: 'white' }}>
                                        {['Proje', 'PP No', 'Cari MH',
                                          `Cari Hakediş (${result.meta?.currency || 'USD'})`,
                                          'Geçmiş MH',
                                          `Geçmiş Hakediş (${result.meta?.currency || 'USD'})`,
                                          `Kümülatif (${result.meta?.currency || 'USD'})`,
                                          'Personel'].map(h => (
                                            <th key={h} style={thStyle}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.data.map((row, i) => (
                                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                            <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 260 }}>{row.project}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center', color: '#2563eb', fontWeight: 700 }}>
                                                {row.ppNo ? `PP-${row.ppNo}` : '—'}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(row.currentMH)}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                                                {fmt(row.currentHakedis)}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(row.previousMH)}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right', color: '#92400e' }}>
                                                {fmt(row.previousHakedis)}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>
                                                {fmt(row.cumulativeHakedis)}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>{row.personCount || '—'}</td>
                                        </tr>
                                    ))}
                                    {/* Totals */}
                                    <tr style={{ background: '#fef3c7', fontWeight: 700, borderTop: '2px solid #d97706' }}>
                                        <td style={{ ...tdStyle, fontWeight: 800 }}>TOPLAM</td>
                                        <td style={tdStyle} />
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(result.totals.currentMH)}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#059669' }}>
                                            {fmt(result.totals.currentHakedis)}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(result.totals.previousMH)}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#92400e' }}>
                                            {fmt(result.totals.previousHakedis)}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#1d4ed8' }}>
                                            {fmt(result.totals.cumulativeHakedis)}
                                        </td>
                                        <td style={tdStyle} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center', padding: '60px 20px',
                            background: 'white', borderRadius: 14,
                            border: '1px solid #e2e8f0', color: '#94a3b8',
                        }}>
                            <FileSpreadsheet size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <div style={{ fontSize: 15, fontWeight: 600 }}>Seçilen kriterlere uygun kayıt bulunamadı</div>
                            <div style={{ fontSize: 13, marginTop: 4 }}>Tarih aralığını veya şirket bilgisini kontrol edin.</div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                select, input { outline: none; }
                select:focus, input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 2px #93c5fd44; }
            `}</style>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryTile({ label, value, unit, color, highlight }) {
    return (
        <div style={{
            background: highlight ? `linear-gradient(135deg, ${color}20, ${color}10)` : 'white',
            border: `1.5px solid ${highlight ? color : '#e2e8f0'}`,
            borderRadius: 12, padding: '14px 18px', flex: '1 1 180px', minWidth: 160,
            boxShadow: highlight ? `0 2px 8px ${color}30` : '0 1px 3px rgba(0,0,0,.05)',
        }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>
                {value}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{unit}</div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle = {
    display: 'flex', flexDirection: 'column', gap: 5, cursor: 'default',
};

const labelTextStyle = {
    fontSize: 12, fontWeight: 600, color: '#475569',
    display: 'flex', alignItems: 'center',
};

const inputStyle = {
    padding: '8px 10px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 13,
    background: '#fafafa', color: '#1e293b',
    transition: 'border-color .15s, box-shadow .15s',
    width: '100%', boxSizing: 'border-box',
};

const selectStyle = {
    ...inputStyle,
    appearance: 'auto',
};

const btnStyle = (bg, disabled, outline = false) => ({
    display: 'inline-flex', alignItems: 'center',
    padding: '9px 18px', borderRadius: 8,
    border: outline ? `1.5px solid ${bg}` : 'none',
    background: disabled ? '#e2e8f0' : (outline ? 'transparent' : bg),
    color: disabled ? '#94a3b8' : (outline ? bg : 'white'),
    fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity .15s',
    opacity: disabled ? 0.7 : 1,
});

const thStyle = {
    padding: '10px 14px', fontWeight: 600, fontSize: 12,
    textAlign: 'left', whiteSpace: 'nowrap',
    borderBottom: '1px solid rgba(255,255,255,.1)',
};

const tdStyle = {
    padding: '9px 14px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
};
