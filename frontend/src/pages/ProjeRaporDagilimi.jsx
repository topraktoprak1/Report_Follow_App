import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
const reportDistribution = [];
const weeklyDistribution = [];
const projectCategories = [];
import { FileText, Layers, CheckCheck, ArrowUpRight } from 'lucide-react';

const COLORS = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b', '#ef4444'];

export default function ProjeRaporDagilimi() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Proje Rapor Dağılımı</h1>
                <p className="page-subtitle">Proje bazlı rapor dağılımları ve kategori analizleri</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={FileText} value="197" label="Toplam Rapor" trend="up" trendValue="+15" color="#00d4ff" />
                <StatCard icon={CheckCheck} value="179" label="Onaylanan" trend="up" trendValue="%91" color="#22c55e" />
                <StatCard icon={Layers} value="5" label="Kategori" color="#8b5cf6" />
                <StatCard icon={ArrowUpRight} value="%12" label="Artış Oranı" trend="up" trendValue="Bu Ay" color="#0cdba8" />
            </div>

            <div className="charts-grid">
                <ChartCard title="Proje Bazlı Rapor Dağılımı" subtitle="Kategorilere göre proje rapor sayıları">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={reportDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="kategori" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Legend wrapperStyle={{ color: '#8899b4', fontSize: 12 }} />
                            <Bar dataKey="alfa" name="Proje Alpha" fill="#00d4ff" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="beta" name="Proje Beta" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="gamma" name="Proje Gamma" fill="#0cdba8" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="delta" name="Proje Delta" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="epsilon" name="Proje Epsilon" fill="#ef4444" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Haftalık Rapor & Onay" subtitle="Son 4 haftanın rapor ve onay sayıları">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={weeklyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="hafta" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Legend wrapperStyle={{ color: '#8899b4', fontSize: 12 }} />
                            <Bar dataKey="rapor" name="Rapor" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="onay" name="Onay" fill="#0cdba8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="Genel Kategori Dağılımı" subtitle="Tüm projelerdeki kategori bazlı rapor dağılımı">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={projectCategories} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                            {projectCategories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                        <Legend wrapperStyle={{ color: '#8899b4', fontSize: 12 }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
}
