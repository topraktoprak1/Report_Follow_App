import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { personnelData, departmentPerformance } from '../data/mockData';
import { Users, Award, Clock, TrendingUp } from 'lucide-react';

export default function PersonelAnalizRaporlari() {
    const avgPerformance = Math.round(personnelData.reduce((s, p) => s + p.performans, 0) / personnelData.length);
    const totalMH = personnelData.reduce((s, p) => s + p.toplamMH, 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Personel Analiz Raporları</h1>
                <p className="page-subtitle">Personel performans metrikleri ve departman analizleri</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={Users} value={personnelData.length} label="Toplam Personel" color="#00d4ff" />
                <StatCard icon={Award} value={`%${avgPerformance}`} label="Ort. Performans" trend="up" trendValue="+2%" color="#0cdba8" />
                <StatCard icon={Clock} value={totalMH.toLocaleString()} label="Toplam Adam-Saat" color="#8b5cf6" />
                <StatCard icon={TrendingUp} value="317" label="Tamamlanan Görev" trend="up" trendValue="+18" color="#f59e0b" />
            </div>

            <div className="charts-grid">
                <ChartCard title="Personel Performans Karşılaştırması" subtitle="Bireysel performans skorları">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={personnelData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis dataKey="ad" type="category" width={130} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Bar dataKey="performans" name="Performans (%)" fill="#00d4ff" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Departman Performansı" subtitle="Departman bazlı ortalama performans">
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={departmentPerformance}>
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
                            {personnelData.map(p => (
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
