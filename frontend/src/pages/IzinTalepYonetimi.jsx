import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
const leaveRequests = [];
const leaveStats = [];
const leaveMonthly = [];
import { CalendarCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_STYLES = {
    'Onaylandı': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    'Bekliyor': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    'Reddedildi': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

const LEAVE_COLORS = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b'];

export default function IzinTalepYonetimi() {
    const pending = leaveRequests.filter(l => l.durum === 'Bekliyor').length;
    const approved = leaveRequests.filter(l => l.durum === 'Onaylandı').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">İzin Talep Yönetimi</h1>
                <p className="page-subtitle">İzin talepleri ve onay süreçleri</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={CalendarCheck} value={leaveRequests.length} label="Toplam Talep" color="#00d4ff" />
                <StatCard icon={Clock} value={pending} label="Bekleyen" color="#f59e0b" />
                <StatCard icon={CheckCircle2} value={approved} label="Onaylanan" color="#22c55e" />
                <StatCard icon={XCircle} value={leaveRequests.filter(l => l.durum === 'Reddedildi').length} label="Reddedilen" color="#ef4444" />
            </div>

            <div className="charts-grid">
                <ChartCard title="Aylık İzin Dağılımı" subtitle="Yıl boyunca kullanılan izin günleri">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leaveMonthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="ay" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                            <Bar dataKey="izinGun" name="İzin Günü" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="İzin Türü Dağılımı" subtitle="Kullanılan/toplam izin hakları">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={leaveStats} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="kullanan" nameKey="tur"
                                label={({ tur, kullanan, toplam }) => `${tur}: ${kullanan}/${toplam}`}>
                                {leaveStats.map((_, i) => <Cell key={i} fill={LEAVE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="chart-card">
                <div className="chart-card-header">
                    <div>
                        <div className="chart-card-title">İzin Talepleri</div>
                        <div className="chart-card-subtitle">Tüm izin talepleri ve durumları</div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Personel', 'İzin Türü', 'Başlangıç', 'Bitiş', 'Gün', 'Durum', 'İşlem'].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ ...tdStyle, fontWeight: 500 }}>{r.personel}</td>
                                    <td style={tdStyle}>{r.tur}</td>
                                    <td style={tdStyle}>{r.baslangic}</td>
                                    <td style={tdStyle}>{r.bitis}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: '#00d4ff' }}>{r.gun}</td>
                                    <td style={tdStyle}>
                                        <span style={{ ...STATUS_STYLES[r.durum], padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                                            {r.durum}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {r.durum === 'Bekliyor' && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>Onayla</button>
                                                <button className="btn btn-sm btn-danger">Reddet</button>
                                            </div>
                                        )}
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

const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', color: '#e8edf5', fontSize: '0.875rem' };
