import { useState, useEffect, useRef } from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { analyticsApi } from '../api/analytics';
import { useAuth } from '../context/AuthContext';
import {
    BarChart2, TrendingUp, PieChart as PieIcon, RefreshCw, Upload,
    Filter, X, ChevronDown, AlertCircle, CheckCircle, Loader
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#fb923c', '#34d399'];

const DIMENSION_OPTIONS = [
    { value: 'projects', label: 'Projeler' },
    { value: 'discipline', label: 'Disiplin' },
    { value: 'company', label: 'Şirket' },
    { value: 'scope', label: 'Kapsam' },
    { value: 'northSouth', label: 'North/South' },
    { value: 'lsUnitRate', label: 'LS/Unit Rate' },
];

const METRIC_OPTIONS = [
    { value: 'karZarar', label: 'KAR-ZARAR ($)' },
    { value: 'totalMH', label: 'Toplam MH' },
];

const YEAR_OPTIONS = [2022, 2023, 2024, 2025].map(y => ({ value: String(y), label: String(y) }));




function MultiSelect({ label, options = [], value = [], onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleOption = (opt) => {
        if (value.includes(opt)) onChange(value.filter(v => v !== opt));
        else onChange([...value, opt]);
    };

    return (
        <div ref={ref} style={{ position: 'relative', minWidth: 140 }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--card-bg, #1e2130)', border: '1px solid var(--border-color, #2d3148)',
                    borderRadius: 8, padding: '6px 12px', color: 'var(--text-primary, #e2e8f0)',
                    cursor: 'pointer', fontSize: 13, width: '100%', justifyContent: 'space-between'
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value.length > 0 ? `${label}: ${value.length}` : label}
                </span>
                <ChevronDown size={14} />
            </button>
            {value.length > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onChange([]); }}
                    style={{
                        position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2
                    }}
                ><X size={12} /></button>
            )}
            {open && (
                <div style={{
                    position: 'absolute', top: '110%', left: 0, zIndex: 100, minWidth: '100%', maxHeight: 200,
                    overflowY: 'auto', background: 'var(--card-bg, #1e2130)',
                    border: '1px solid var(--border-color, #2d3148)', borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,.4)'
                }}>
                    {options.map(opt => (
                        <label key={opt} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 12px', cursor: 'pointer', fontSize: 13,
                            color: 'var(--text-primary, #e2e8f0)',
                            background: value.includes(opt) ? 'rgba(99,102,241,.15)' : 'transparent'
                        }}>
                            <input
                                type="checkbox"
                                checked={value.includes(opt)}
                                onChange={() => toggleOption(opt)}
                                style={{ accentColor: '#6366f1' }}
                            />
                            {opt}
                        </label>
                    ))}
                    {options.length === 0 && (
                        <div style={{ padding: '8px 12px', color: '#64748b', fontSize: 12 }}>Seçenek yok</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function GelismisAnaliz() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const fileInputRef = useRef(null);

    // Filter state
    const [filterOptions, setFilterOptions] = useState({});
    const [activeFilters, setActiveFilters] = useState({});
    const [filtersLoading, setFiltersLoading] = useState(false);

    // Trend chart state
    const [trendDimension, setTrendDimension] = useState('projects');
    const [trendYear, setTrendYear] = useState('2024');
    const [trendMetric, setTrendMetric] = useState('karZarar');
    const [trendData, setTrendData] = useState([]);
    const [trendLoading, setTrendLoading] = useState(false);

    // Pie chart state
    const [mhPieDimension, setMhPieDimension] = useState('discipline');
    const [mhPieData, setMhPieData] = useState([]);
    const [mhPieLoading, setMhPieLoading] = useState(false);
    const [apcbData, setApcbData] = useState([]);
    const [apcbLoading, setApcbLoading] = useState(false);

    // Summary stats
    const [summaryStats, setSummaryStats] = useState(null);

    // Admin actions state
    const [recalculating, setRecalculating] = useState(false);
    const [recalcMsg, setRecalcMsg] = useState(null);
    const [fillUploading, setFillUploading] = useState(false);
    const [fillMsg, setFillMsg] = useState(null);
    const [fillDownloadUrl, setFillDownloadUrl] = useState(null);

    // Load filter options once on mount
    useEffect(() => {
        setFiltersLoading(true);
        analyticsApi.getFilterOptions({}).then(data => {
            setFilterOptions(data || {});
        }).catch(console.warn).finally(() => setFiltersLoading(false));
    }, []);

    // Load summary stats from filtered records
    useEffect(() => {
        analyticsApi.filterRecords({ filters: activeFilters }).then(data => {
            const records = data?.data || data?.records || [];
            if (records.length >= 0) {
                const totalMH = records.reduce((s, r) => {
                    const v = parseFloat(
                        r['TOTAL MH'] ?? r['TOTAL\n MH'] ?? r['Total MH'] ?? 0
                    );
                    return s + (isNaN(v) ? 0 : v);
                }, 0);
                const totalKZ = records.reduce((s, r) => {
                    const actual = parseFloat(r['İşveren- Hakediş (USD)'] ?? r['İşveren- Hakediş'] ?? 0);
                    const cost   = parseFloat(r['General Total Cost (USD)'] ?? r['General Total\n Cost (USD)'] ?? 0);
                    const kz = isNaN(actual - cost) ? (parseFloat(r['KAR-ZARAR'] ?? 0) || 0) : (actual - cost);
                    return s + kz;
                }, 0);
                const projects = new Set(
                    records.map(r => r['Projects/Group'] || r['Projects'] || r['Proje']).filter(Boolean)
                );
                setSummaryStats({
                    totalRecords: records.length,
                    totalMH: Math.round(totalMH),
                    totalKarZarar: Math.round(totalKZ),
                    uniqueProjects: projects.size
                });
            }
        }).catch(console.warn);
    }, [activeFilters]);

    // Load trend chart — backend returns long format, convert to wide for recharts
    useEffect(() => {
        setTrendLoading(true);
        analyticsApi.getKarZararTrends({
            dimension: trendDimension,
            year: trendYear,
            metric: trendMetric,
        }).then(res => {
            const series = res?.data || [];
            // Collect all months and build wide-format rows
            const monthSet = new Set();
            series.forEach(s => s.data?.forEach(d => monthSet.add(d.month)));
            const months = Array.from(monthSet).sort();
            const wide = months.map(month => {
                const row = { month };
                series.forEach(s => {
                    const entry = s.data?.find(d => d.month === month);
                    row[s.name] = entry ? entry.value : 0;
                });
                return row;
            });
            setTrendData(wide);
        })
            .catch(() => setTrendData([]))
            .finally(() => setTrendLoading(false));
    }, [trendDimension, trendYear, trendMetric]);

    // Load MH pie
    useEffect(() => {
        setMhPieLoading(true);
        analyticsApi.getTotalMhPie({ dimension: mhPieDimension })
            .then(data => setMhPieData(data?.data || []))
            .catch(() => setMhPieData([]))
            .finally(() => setMhPieLoading(false));
    }, [mhPieDimension]);

    // Load AP-CB pie once — backend returns {apcb, subcon} counts
    useEffect(() => {
        setApcbLoading(true);
        analyticsApi.getApcbPie()
            .then(res => {
                if (res?.data) {
                    setApcbData(res.data);
                } else {
                    const arr = [];
                    if (res?.apcb  > 0) arr.push({ name: 'AP-CB',  value: res.apcb  });
                    if (res?.subcon > 0) arr.push({ name: 'Subcon', value: res.subcon });
                    setApcbData(arr);
                }
            })
            .catch(() => setApcbData([]))
            .finally(() => setApcbLoading(false));
    }, []);

    const handleFilterChange = (key, values) => {
        const next = { ...activeFilters };
        if (values.length === 0) delete next[key];
        else next[key] = values;
        setActiveFilters(next);
    };

    const clearAllFilters = () => setActiveFilters({});

    const handleRecalculate = async () => {
        setRecalculating(true);
        setRecalcMsg(null);
        try {
            const res = await analyticsApi.recalculate();
            setRecalcMsg({ type: 'success', text: res?.message || `${res?.updated || 0} kayıt güncellendi.` });
        } catch (e) {
            setRecalcMsg({ type: 'error', text: e?.response?.data?.error || 'Yeniden hesaplama başarısız.' });
        } finally {
            setRecalculating(false);
        }
    };

    const handleFillUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFillUploading(true);
        setFillMsg(null);
        setFillDownloadUrl(null);
        try {
            const res = await analyticsApi.fillEmptyCells(file);
            setFillMsg({ type: 'success', text: `İşlem tamamlandı. ${res.filled_cells || 0} hücre dolduruldu.` });
            if (res.download_url) setFillDownloadUrl(res.download_url);
        } catch (e) {
            setFillMsg({ type: 'error', text: e?.response?.data?.error || 'Dosya işleme başarısız.' });
        } finally {
            setFillUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Determine trend line keys (other than 'month')
    const trendKeys = trendData.length > 0
        ? Object.keys(trendData[0]).filter(k => k !== 'month').slice(0, 8)
        : [];

    const cardStyle = {
        background: 'var(--card-bg, #1e2130)',
        border: '1px solid var(--border-color, #2d3148)',
        borderRadius: 12,
        padding: '20px 24px',
    };

    const labelStyle = { fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' };
    const selectStyle = {
        background: 'var(--card-bg, #1e2130)', border: '1px solid var(--border-color, #2d3148)',
        borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary, #e2e8f0)',
        fontSize: 13, cursor: 'pointer'
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Header */}
            <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #e2e8f0)' }}>
                    Gelişmiş Analiz
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#94a3b8' }}>
                    KAR-ZARAR, MH trendleri ve disiplin analizleri
                </p>
            </div>

            {/* Filter Bar */}
            <div style={{ ...cardStyle, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Filter size={16} color="#6366f1" />
                    <span style={{ fontSize: 13, color: '#94a3b8', marginRight: 8 }}>Filtreler:</span>

                    {[
                        { key: 'discipline', label: 'Disiplin' },
                        { key: 'company', label: 'Şirket' },
                        { key: 'projects', label: 'Proje' },
                        { key: 'scope', label: 'Kapsam' },
                        { key: 'northSouth', label: 'North/South' },
                        { key: 'lsUnitRate', label: 'LS/Unit Rate' },
                    ].map(({ key, label }) => {
                        // backend returns [{label, value}] objects — extract plain strings
                        const rawOpts = filterOptions[key] || [];
                        const opts = rawOpts.map(o => (typeof o === 'object' ? o.value : o));
                        return (
                            <MultiSelect
                                key={key}
                                label={filtersLoading ? '…' : label}
                                options={opts}
                                value={activeFilters[key] || []}
                                onChange={(vals) => handleFilterChange(key, vals)}
                            />
                        );
                    })}

                    {Object.keys(activeFilters).length > 0 && (
                        <button
                            onClick={clearAllFilters}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                background: 'rgba(244,63,94,.15)', border: '1px solid rgba(244,63,94,.3)',
                                borderRadius: 8, padding: '6px 12px', color: '#f43f5e',
                                cursor: 'pointer', fontSize: 12
                            }}
                        >
                            <X size={12} /> Temizle
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <StatCard
                    label="Toplam Kayıt"
                    value={summaryStats?.totalRecords ?? '—'}
                    icon={BarChart2}
                    color="#6366f1"
                />
                <StatCard
                    label="Toplam MH"
                    value={summaryStats?.totalMH ?? '—'}
                    icon={TrendingUp}
                    color="#22d3ee"
                />
                <StatCard
                    label="KAR-ZARAR ($)"
                    value={summaryStats?.totalKarZarar != null
                        ? (summaryStats.totalKarZarar >= 0 ? `+${summaryStats.totalKarZarar.toLocaleString()}` : summaryStats.totalKarZarar.toLocaleString())
                        : '—'}
                    icon={TrendingUp}
                    color={summaryStats?.totalKarZarar >= 0 ? '#10b981' : '#f43f5e'}
                />
                <StatCard
                    label="Benzersiz Proje"
                    value={summaryStats?.uniqueProjects ?? '—'}
                    icon={PieIcon}
                    color="#f59e0b"
                />
            </div>

            {/* Trend Chart */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>
                        Aylık Trend Analizi
                    </h2>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div>
                            <label style={labelStyle}>Boyut</label>
                            <select value={trendDimension} onChange={e => setTrendDimension(e.target.value)} style={selectStyle}>
                                {DIMENSION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Yıl</label>
                            <select value={trendYear} onChange={e => setTrendYear(e.target.value)} style={selectStyle}>
                                {YEAR_OPTIONS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Metrik</label>
                            <select value={trendMetric} onChange={e => setTrendMetric(e.target.value)} style={selectStyle}>
                                {METRIC_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {trendLoading ? (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <Loader size={24} className="spin" />
                    </div>
                ) : trendData.length === 0 ? (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
                        Veri bulunamadı
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={trendData}>
                            <defs>
                                {trendKeys.map((key, i) => (
                                    <linearGradient key={key} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {trendKeys.map((key, i) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={COLORS[i % COLORS.length]}
                                    fill={`url(#grad_${i})`}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Two Pie Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Total MH Pie */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>
                            Toplam MH Dağılımı
                        </h2>
                        <select value={mhPieDimension} onChange={e => setMhPieDimension(e.target.value)} style={selectStyle}>
                            {DIMENSION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                    </div>
                    {mhPieLoading ? (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <Loader size={20} />
                        </div>
                    ) : mhPieData.length === 0 ? (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
                            Veri yok
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={mhPieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    labelLine={false}
                                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                                >
                                    {mhPieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }}
                                    formatter={(v, n) => [v.toLocaleString(), n]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* AP-CB vs Subcon Pie */}
                <div style={cardStyle}>
                    <div style={{ marginBottom: 16 }}>
                        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>
                            AP-CB / Subcon Dağılımı
                        </h2>
                    </div>
                    {apcbLoading ? (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <Loader size={20} />
                        </div>
                    ) : apcbData.length === 0 ? (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
                            Veri yok
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={apcbData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                                >
                                    {apcbData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }}
                                    formatter={(v, n) => [v.toLocaleString(), n]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Admin Section */}
            {isAdmin && (
                <div style={cardStyle}>
                    <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>
                        Yönetici İşlemleri
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                        {/* Recalculate */}
                        <div style={{
                            background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)',
                            borderRadius: 10, padding: 20
                        }}>
                            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#a5b4fc' }}>
                                Alanları Yeniden Hesapla
                            </h3>
                            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                                Tüm kayıtlar için North/South, KAR-ZARAR, Hourly Rate ve diğer hesaplanmış
                                alanları Excel referans verilerine göre yeniden hesaplar.
                            </p>
                            <button
                                onClick={handleRecalculate}
                                disabled={recalculating}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: '#6366f1', border: 'none', borderRadius: 8,
                                    padding: '8px 16px', color: '#fff', cursor: recalculating ? 'not-allowed' : 'pointer',
                                    fontSize: 13, fontWeight: 500, opacity: recalculating ? 0.7 : 1
                                }}
                            >
                                <RefreshCw size={14} className={recalculating ? 'spin' : ''} />
                                {recalculating ? 'Hesaplanıyor…' : 'Yeniden Hesapla'}
                            </button>
                            {recalcMsg && (
                                <div style={{
                                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 13, color: recalcMsg.type === 'success' ? '#10b981' : '#f43f5e'
                                }}>
                                    {recalcMsg.type === 'success'
                                        ? <CheckCircle size={14} />
                                        : <AlertCircle size={14} />}
                                    {recalcMsg.text}
                                </div>
                            )}
                        </div>

                        {/* Fill Empty Cells */}
                        <div style={{
                            background: 'rgba(34,211,238,.08)', border: '1px solid rgba(34,211,238,.2)',
                            borderRadius: 10, padding: 20
                        }}>
                            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#67e8f9' }}>
                                Boş Hücreleri Doldur
                            </h3>
                            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                                Bir Excel dosyası yükleyin. Mevcut veriler korunarak boş hücreler
                                hesaplama motoruyla otomatik doldurulur ve indirilebilir dosya oluşturulur.
                            </p>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xlsb,.xls"
                                    onChange={handleFillUpload}
                                    style={{ display: 'none' }}
                                    id="fill-file-input"
                                />
                                <label
                                    htmlFor="fill-file-input"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        background: '#22d3ee', border: 'none', borderRadius: 8,
                                        padding: '8px 16px', color: '#0c1c2b', cursor: fillUploading ? 'not-allowed' : 'pointer',
                                        fontSize: 13, fontWeight: 500, opacity: fillUploading ? 0.7 : 1
                                    }}
                                >
                                    <Upload size={14} />
                                    {fillUploading ? 'İşleniyor…' : 'Dosya Seç ve İşle'}
                                </label>
                                {fillDownloadUrl && (
                                    <a
                                        href={fillDownloadUrl}
                                        download
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)',
                                            borderRadius: 8, padding: '6px 12px', color: '#10b981',
                                            textDecoration: 'none', fontSize: 13
                                        }}
                                    >
                                        İndir
                                    </a>
                                )}
                            </div>
                            {fillMsg && (
                                <div style={{
                                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 13, color: fillMsg.type === 'success' ? '#10b981' : '#f43f5e'
                                }}>
                                    {fillMsg.type === 'success'
                                        ? <CheckCircle size={14} />
                                        : <AlertCircle size={14} />}
                                    {fillMsg.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; display: inline-block; }
            `}</style>
        </div>
    );
}
