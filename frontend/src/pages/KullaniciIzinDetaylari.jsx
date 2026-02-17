import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
const userLeaveDetails = [];
const userLeaveHistory = [];
import { CalendarDays, Calendar, CalendarCheck, CalendarX } from 'lucide-react';

const totalHak = userLeaveDetails.reduce((s, d) => s + d.hakEdilen, 0);
const totalUsed = userLeaveDetails.reduce((s, d) => s + d.kullanan, 0);
const totalRemaining = userLeaveDetails.reduce((s, d) => s + d.kalan, 0);

export default function KullaniciIzinDetaylari() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Kullanıcı İzin Detayları</h1>
                <p className="page-subtitle">Kişisel izin hakları ve geçmiş</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={CalendarDays} value={totalHak} label="Toplam Hak" color="#00d4ff" />
                <StatCard icon={CalendarCheck} value={totalUsed} label="Kullanılan" color="#f59e0b" />
                <StatCard icon={Calendar} value={totalRemaining} label="Kalan" color="#22c55e" />
                <StatCard icon={CalendarX} value={userLeaveHistory.length} label="Geçmiş Kayıt" color="#8b5cf6" />
            </div>

            <div className="charts-grid">
                <ChartCard title="İzin Hakkı Özeti" subtitle="Türe göre hak edilen, kullanılan ve kalan">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={userLeaveDetails}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="tur" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Bar dataKey="hakEdilen" name="Hak Edilen" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="kullanan" name="Kullanılan" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="kalan" name="Kalan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Summary cards */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">İzin Hakkı Tablosu</div>
                            <div className="chart-card-subtitle">Detaylı izin bakiyesi</div>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['İzin Türü', 'Hak Edilen', 'Kullanılan', 'Kalan'].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {userLeaveDetails.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ ...tdStyle, fontWeight: 500 }}>{d.tur}</td>
                                    <td style={{ ...tdStyle, color: '#00d4ff', fontWeight: 600 }}>{d.hakEdilen}</td>
                                    <td style={{ ...tdStyle, color: '#f59e0b', fontWeight: 600 }}>{d.kullanan}</td>
                                    <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 600 }}>{d.kalan}</td>
                                </tr>
                            ))}
                            <tr style={{ borderTop: '2px solid var(--border-light)' }}>
                                <td style={{ ...tdStyle, fontWeight: 700 }}>Toplam</td>
                                <td style={{ ...tdStyle, color: '#00d4ff', fontWeight: 700 }}>{totalHak}</td>
                                <td style={{ ...tdStyle, color: '#f59e0b', fontWeight: 700 }}>{totalUsed}</td>
                                <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 700 }}>{totalRemaining}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leave history */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <div>
                        <div className="chart-card-title">İzin Geçmişi</div>
                        <div className="chart-card-subtitle">Son kullanılan izinler</div>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            {['İzin Türü', 'Başlangıç', 'Bitiş', 'Gün', 'Durum'].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {userLeaveHistory.map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ ...tdStyle, fontWeight: 500 }}>{h.tur}</td>
                                <td style={tdStyle}>{h.baslangic}</td>
                                <td style={tdStyle}>{h.bitis}</td>
                                <td style={{ ...tdStyle, fontWeight: 600, color: '#00d4ff' }}>{h.gun}</td>
                                <td style={tdStyle}>
                                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                                        {h.durum}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', color: '#e8edf5', fontSize: '0.875rem' };
