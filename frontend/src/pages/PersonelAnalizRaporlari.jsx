import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { dashboardApi, excelApi } from '../api/excel';
import { Users, Award, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function PersonelAnalizRaporlari() {
    const [personnel, setPersonnel] = useState([]);
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
                    const [pData, summaryStats] = await Promise.all([
                        dashboardApi.getPersonnel(),
                        excelApi.getSummaryStats()
                    ]);

                    setPersonnel(pData);

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
                    console.warn('Excel API failed, using mock data:', excelError.message);
                    
                    // Fallback to mock data
                    const mockPersonnel = [
                        { 
                            id: 1, 
                            name: 'Ahmet Yılmaz', 
                            ad: 'Ahmet Yılmaz', 
                            department: 'Mühendislik', 
                            departman: 'Mühendislik', 
                            pozisyon: 'Sr. Mühendis', 
                            performance: 85, 
                            performans: 85, 
                            toplamMH: 120, 
                            tamamlanan: 15 
                        },
                        { 
                            id: 2, 
                            name: 'Mehmet Kaya', 
                            ad: 'Mehmet Kaya', 
                            department: 'Mühendislik', 
                            departman: 'Mühendislik', 
                            pozisyon: 'Mühendis', 
                            performance: 78, 
                            performans: 78, 
                            toplamMH: 95, 
                            tamamlanan: 12 
                        },
                        { 
                            id: 3, 
                            name: 'Ayşe Demir', 
                            ad: 'Ayşe Demir', 
                            department: 'İnsan Kaynakları', 
                            departman: 'İnsan Kaynakları', 
                            pozisyon: 'İK Uzmanı', 
                            performance: 92, 
                            performans: 92, 
                            toplamMH: 80, 
                            tamamlanan: 18 
                        },
                        { 
                            id: 4, 
                            name: 'Fatma Özkan', 
                            ad: 'Fatma Özkan', 
                            department: 'Finans', 
                            departman: 'Finans', 
                            pozisyon: 'Mali Müşavir', 
                            performance: 88, 
                            performans: 88, 
                            toplamMH: 75, 
                            tamamlanan: 14 
                        },
                        { 
                            id: 5, 
                            name: 'Ali Çelik', 
                            ad: 'Ali Çelik', 
                            department: 'Mühendislik', 
                            departman: 'Mühendislik', 
                            pozisyon: 'Jr. Mühendis', 
                            performance: 76, 
                            performans: 76, 
                            toplamMH: 110, 
                            tamamlanan: 11 
                        },
                        { 
                            id: 6, 
                            name: 'Zeynep Arslan', 
                            ad: 'Zeynep Arslan', 
                            department: 'Pazarlama', 
                            departman: 'Pazarlama', 
                            pozisyon: 'Pazarlama Uzmanı', 
                            performance: 83, 
                            performans: 83, 
                            toplamMH: 65, 
                            tamamlanan: 13 
                        },
                    ];

                    const mockDeptStats = [
                        { 
                            name: 'Mühendislik', 
                            departman: 'Mühendislik', 
                            value: 3, 
                            percentage: 50, 
                            ortalama: 80 
                        },
                        { 
                            name: 'İnsan Kaynakları', 
                            departman: 'İnsan Kaynakları', 
                            value: 1, 
                            percentage: 17, 
                            ortalama: 92 
                        },
                        { 
                            name: 'Finans', 
                            departman: 'Finans', 
                            value: 1, 
                            percentage: 17, 
                            ortalama: 88 
                        },
                        { 
                            name: 'Pazarlama', 
                            departman: 'Pazarlama', 
                            value: 1, 
                            percentage: 17, 
                            ortalama: 83 
                        },
                    ];

                    setPersonnel(mockPersonnel);
                    setDeptStats(mockDeptStats);
                    setStats({
                        totalPersonnel: mockPersonnel.length,
                        avgPerformance: Math.round(mockPersonnel.reduce((sum, p) => sum + p.performance, 0) / mockPersonnel.length),
                        totalMH: 1250,
                        completedTasks: 45
                    });
                    
                    console.log('Mock data set - Personnel:', mockPersonnel);
                    console.log('Mock data set - DeptStats:', mockDeptStats);
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
                <ChartCard title="Personel Performans Karşılaştırması" subtitle="Bireysel performans skorları">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={personnel} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis dataKey="name" type="category" width={130} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Bar dataKey="performance" name="Performans (%)" fill="#00d4ff" radius={[0, 4, 4, 0]} barSize={20} />
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
