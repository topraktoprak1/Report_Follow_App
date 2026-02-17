import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { dashboardApi } from '../api/excel';
import { BarChart3, TrendingUp, CheckCircle2, Clock, List } from 'lucide-react';

const COLORS = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b', '#ef4444'];

export default function ProjeRaporlama() {
    const [stats, setStats] = useState({ activeProjects: 0, totalTasks: 0, totalMH: 0, avgProgress: 0 });
    const [projectData, setProjectData] = useState([]);
    const [projectCategories, setProjectCategories] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, projects] = await Promise.all([
                    dashboardApi.getProjectStats(),
                    dashboardApi.getProjects()
                ]);

                setStats({
                    activeProjects: statsData.activeProjects,
                    totalTasks: statsData.totalTasks,
                    totalMH: statsData.totalMH,
                    avgProgress: statsData.avgProgress
                });
                setProjectData(statsData.projectStatus);
                setProjectCategories(statsData.categoryDistribution);
                setProjectsList(projects);
            } catch (error) {
                console.error('Excel veri hatası:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="page-container">Yükleniyor...</div>;
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Proje Raporlama</h1>
                <p className="page-subtitle">Tüm projelerin genel durumu ve performans metrikleri</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={BarChart3} value={stats.activeProjects} label="Aktif Proje" color="#00d4ff" />
                <StatCard icon={CheckCircle2} value={stats.totalTasks} label="Tamamlanan Görev" color="#22c55e" />
                <StatCard icon={Clock} value={stats.totalMH.toLocaleString()} label="Toplam Adam-Saat" color="#8b5cf6" />
                <StatCard icon={TrendingUp} value={`%${stats.avgProgress}`} label="Ortalama İlerleme" color="#0cdba8" />
            </div>

            <div className="charts-grid">
                <ChartCard title="Proje Durum Dağılımı" subtitle="Tamamlanan, devam eden ve bekleyen görevler">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={projectData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Bar dataKey="value" name="Adet" fill="#00d4ff" radius={[4, 4, 0, 0]} >
                                {projectData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Kategori Dağılımı" subtitle="Proje kategorilerine göre dağılım">
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie data={projectCategories} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" nameKey="name">
                                {projectCategories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }}
                                itemStyle={{ color: '#e8edf5' }}
                            />
                            <Legend wrapperStyle={{ color: '#8899b4', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="Aylık Performans Trendi" subtitle="Gerçekleşen vs Planlanan adam-saat">
                <div style={{ padding: 20, textAlign: 'center', color: '#8899b4' }}>Veri bulunamadı</div>
            </ChartCard>

            <ChartCard title="Proje Listesi" subtitle="Sistemdeki tüm projeler">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={thStyle}>Proje Adı</th>
                                <th style={thStyle}>Kategori</th>
                                <th style={thStyle}>Personel Sayısı</th>
                                <th style={thStyle}>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectsList.map((p, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                                    <td style={tdStyle}>{p.category}</td>
                                    <td style={{ ...tdStyle, color: '#00d4ff', fontWeight: 600 }}>{p.userCount}</td>
                                    <td style={tdStyle}>
                                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>
        </div>
    );
}

const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', color: '#e8edf5', fontSize: '0.875rem' };
