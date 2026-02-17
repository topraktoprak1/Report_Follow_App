import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
const forecastData = [];
import { TrendingUp, Target, Calendar, AlertTriangle } from 'lucide-react';

export default function ProjeOngoruRaporu() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Proje Öngörü Raporu</h1>
                <p className="page-subtitle">Proje ilerleme tahminleri ve trend analizi</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={TrendingUp} value="%92" label="Mevcut İlerleme" trend="up" trendValue="+4%" color="#00d4ff" />
                <StatCard icon={Target} value="%112" label="Tahmini Bitiş" color="#0cdba8" />
                <StatCard icon={Calendar} value="Ara 2025" label="Tahmini Bitiş Tarihi" color="#8b5cf6" />
                <StatCard icon={AlertTriangle} value="2" label="Risk Faktörü" color="#f59e0b" />
            </div>

            <ChartCard title="Proje İlerleme Öngörüsü" subtitle="Gerçekleşen ve tahmin edilen ilerleme eğrisi">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={forecastData}>
                        <defs>
                            <linearGradient id="gercekGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="tarih" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                        <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} domain={[0, 130]} />
                        <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                        <Legend wrapperStyle={{ color: '#8899b4', fontSize: 12 }} />
                        <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="8 4" label={{ value: 'Hedef %100', fill: '#f59e0b', fontSize: 12 }} />
                        <Line type="monotone" dataKey="gercek" name="Gerçekleşen" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 5 }} activeDot={{ r: 7 }} connectNulls={false} />
                        <Line type="monotone" dataKey="tahmin" name="Tahmin" stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" dot={{ fill: '#f59e0b', r: 4 }} connectNulls={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <div className="chart-card" style={{ marginTop: 20 }}>
                <div className="chart-card-header">
                    <div>
                        <div className="chart-card-title">Öngörü Verileri</div>
                        <div className="chart-card-subtitle">Aylık ilerleme detayları</div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={thStyle}>Tarih</th>
                                <th style={thStyle}>Gerçekleşen (%)</th>
                                <th style={thStyle}>Tahmin (%)</th>
                                <th style={thStyle}>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={tdStyle}>{row.tarih}</td>
                                    <td style={tdStyle}>{row.gercek ?? '-'}</td>
                                    <td style={tdStyle}>{row.tahmin ?? '-'}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                                            background: row.gercek ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                            color: row.gercek ? '#22c55e' : '#fbbf24'
                                        }}>
                                            {row.gercek ? 'Gerçekleşen' : 'Tahmin'}
                                        </span>
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

const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 };
const tdStyle = { padding: '12px 16px', color: '#e8edf5', fontSize: '0.875rem' };
