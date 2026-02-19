import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { dashboardApi, excelApi } from '../api/excel';
import { Users, Award, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function PersonelAnalizRaporlari() {
    const [personnel, setPersonnel] = useState([]);
    const [projects, setProjects] = useState([]);
    const [deptStats, setDeptStats] = useState([]);
    const [stats, setStats] = useState({ totalPersonnel: 0, avgPerformance: 0, totalMH: 0, completedTasks: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);

                // Try Excel API first, fallback to mock data
                try {
                    const [pData, summaryStats, projData] = await Promise.all([
                        dashboardApi.getPersonnel(),
                        excelApi.getSummaryStats(),
                        dashboardApi.getProjects()
                    ]);

                    setPersonnel(pData);

                    // Normalize project totalMH to 0-100 performance score
                    const maxMH = projData.reduce((m, p) => Math.max(m, p.totalMH || 0), 1);
                    const projWithScore = projData.map(p => ({
                        ...p,
                        performance: Math.round(((p.totalMH || 0) / maxMH) * 100)
                    }));
                    setProjects(projWithScore);

                    if (summaryStats.success) {
                        const s = summaryStats.stats;
                        setStats({
                            totalPersonnel: pData.length,
                            avgPerformance: 75,
                            totalMH: s.total_hours || 0,
                            completedTasks: s.total_records || 0
                        });

                        // Create department statistics from personnel data
                        const deptCounts = {};
                        const deptPerformance = {};

                        pData.forEach(p => {
                            const dept = p.department || 'Other';
                            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                            deptPerformance[dept] = (deptPerformance[dept] || 0) + (p.performance || 0);
                        });

                        const deptStatsArray = Object.entries(deptCounts).map(([name, count]) => ({
                            name,
                            departman: name,
                            value: count,
                            percentage: Math.round((count / pData.length) * 100),
                            ortalama: Math.round(deptPerformance[name] / count)
                        }));

                        setDeptStats(deptStatsArray);
                    } else {
                        throw new Error('Excel stats failed');
                    }
                } catch (excelError) {
                    console.warn('Data fetch failed:', excelError.message);
                    setError('Veri yüklenemedi. Lütfen Excel dosyasının yüklendiğinden emin olun.');
                }
            } catch (error) {
                console.error('Veri çekme hatası:', error);
                setError('Veri yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="page-container">
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '18px', color: '#8899b4' }}>Yükleniyor...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="page-container">
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '18px', color: '#ef4444' }}>{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#00d4ff', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    Yeniden Dene
                </button>
            </div>
        </div>
    );

    if (loading) return <div className="page-container">Yükleniyor...</div>;

    const avgPerformance = stats.avgPerformance;
    const totalMH = stats.totalMH;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Personel Analiz Raporları</h1>
                <p className="page-subtitle">Personel performans metrikleri ve departman analizleri</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={Users} value={stats.totalPersonnel} label="Toplam Personel" color="#00d4ff" />
                <StatCard icon={Award} value={`%${stats.avgPerformance}`} label="Ort. Performans" trend="up" trendValue="+2%" color="#0cdba8" />
                <StatCard icon={Clock} value={stats.totalMH.toLocaleString()} label="Toplam Adam-Saat" color="#8b5cf6" />
                <StatCard icon={TrendingUp} value={stats.completedTasks} label="Tamamlanan Görev" trend="up" trendValue="+18" color="#f59e0b" />
            </div>

            <div className="charts-grid">
                <ChartCard title="Proje Performans Karşılaştırması" subtitle="Proje bazlı toplam adam-saat (MH)">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={projects} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip
                                contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }}
                                formatter={(value, name) => [value, name === 'totalMH' ? 'Toplam MH' : name]}
                            />
                            <Bar dataKey="totalMH" name="Toplam MH" fill="#00d4ff" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Departman Performansı" subtitle="Departman bazlı ortalama performans">
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={deptStats}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="departman" tick={{ fill: '#8899b4', fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#8899b4', fontSize: 10 }} />
                            <Radar name="Ortalama Performans" dataKey="ortalama" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="chart-card">
                <div className="chart-card-header">
                    <div>
                        <div className="chart-card-title">Personel Detay Tablosu</div>
                        <div className="chart-card-subtitle">Tüm personel bilgileri</div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Ad Soyad', 'Departman', 'Pozisyon', 'Toplam MH', 'Görevler', 'Performans'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {personnel.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '12px 16px', color: '#e8edf5', fontWeight: 500 }}>{p.ad}</td>
                                    <td style={{ padding: '12px 16px', color: '#8899b4' }}>{p.departman}</td>
                                    <td style={{ padding: '12px 16px', color: '#8899b4' }}>{p.pozisyon}</td>
                                    <td style={{ padding: '12px 16px', color: '#00d4ff', fontWeight: 600 }}>{p.toplamMH}</td>
                                    <td style={{ padding: '12px 16px', color: '#e8edf5' }}>{p.tamamlanan}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                                                <div style={{ width: `${p.performans}%`, height: '100%', background: p.performans >= 90 ? '#22c55e' : p.performans >= 80 ? '#00d4ff' : '#f59e0b', borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: p.performans >= 90 ? '#22c55e' : p.performans >= 80 ? '#00d4ff' : '#f59e0b' }}>%{p.performans}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
