import { BarChart3, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { projectData, projectCategories, monthlyTrend } from '../data/mockData';

const COLORS = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b', '#ef4444'];

export default function ProjeRaporlama() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Proje Raporlama</h1>
                <p className="page-subtitle">Tüm projelerin genel durumu ve performans metrikleri</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={BarChart3} value="6" label="Aktif Proje" trend="up" trendValue="+2" color="#00d4ff" />
                <StatCard icon={CheckCircle2} value="245" label="Tamamlanan Görev" trend="up" trendValue="+12%" color="#22c55e" />
                <StatCard icon={Clock} value="6,050" label="Toplam Adam-Saat" trend="up" trendValue="+8%" color="#8b5cf6" />
                <StatCard icon={TrendingUp} value="%87" label="Ortalama İlerleme" trend="up" trendValue="+3%" color="#0cdba8" />
            </div>

            <div className="charts-grid">
                <ChartCard title="Proje Durum Dağılımı" subtitle="Tamamlanan, devam eden ve bekleyen görevler">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={projectData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Bar dataKey="tamamlanan" name="Tamamlanan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="devamEden" name="Devam Eden" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bekleyen" name="Bekleyen" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Kategori Dağılımı" subtitle="Proje kategorilerine göre dağılım">
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie data={projectCategories} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}>
                                {projectCategories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Legend wrapperStyle={{ color: '#8899b4', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="Aylık Performans Trendi" subtitle="Gerçekleşen vs Planlanan adam-saat">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrend}>
                        <defs>
                            <linearGradient id="colorGercek" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="ay" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                        <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                        <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                        <Area type="monotone" dataKey="gerceklesen" name="Gerçekleşen" stroke="#00d4ff" fill="url(#colorGercek)" strokeWidth={2} />
                        <Area type="monotone" dataKey="planlanan" name="Planlanan" stroke="#8b5cf6" fill="url(#colorPlan)" strokeWidth={2} strokeDasharray="5 5" />
                        <Legend wrapperStyle={{ color: '#8899b4', fontSize: 12 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
}
