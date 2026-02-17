import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../config/permissions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '../components/ChartCard';
import { Mail, Shield, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function KullaniciProfili() {
    const { user } = useAuth();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Kullanıcı Profili</h1>
                <p className="page-subtitle">Hesap bilgileri ve aktivite özeti</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
                {/* Profile Card */}
                <div className="chart-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
                        background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-white)' }}>
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <span className={`badge badge-${user?.role}`} style={{ marginTop: 8, display: 'inline-flex' }}>
                        {ROLE_LABELS[user?.role] || user?.role}
                    </span>

                    <div style={{ marginTop: 24, textAlign: 'left' }}>
                        <ProfileField icon={Mail} label="E-posta" value={user?.email} />
                        <ProfileField icon={Shield} label="Yetki" value={ROLE_LABELS[user?.role]} />
                        <ProfileField icon={Calendar} label="Kayıt Tarihi" value={user?.createdAt?.slice(0, 10) || '-'} />
                        <ProfileField icon={Clock} label="Durum" value={user?.isActive ? 'Aktif' : 'Devre Dışı'} color={user?.isActive ? '#22c55e' : '#ef4444'} />
                    </div>
                </div>

                {/* Activity */}
                <div>
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(0,212,255,0.15)' }}>
                                <FileText size={22} style={{ color: '#00d4ff' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">0</div>
                                <div className="stat-label">Toplam Rapor</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>
                                <CheckCircle2 size={22} style={{ color: '#22c55e' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">0</div>
                                <div className="stat-label">Tamamlanan Görev</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                <Clock size={22} style={{ color: '#8b5cf6' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">0</div>
                                <div className="stat-label">Toplam MH</div>
                            </div>
                        </div>
                    </div>

                    <ChartCard title="Aylık Aktivite" subtitle="Rapor ve görev tamamlama trendi">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={[]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="ay" tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                <YAxis tick={{ fill: '#8899b4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                <Tooltip contentStyle={{ background: '#111d33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8edf5' }} />
                                <Line type="monotone" dataKey="rapor" name="Rapor" stroke="#00d4ff" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="gorev" name="Görev" stroke="#0cdba8" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}

function ProfileField({ icon: Icon, label, value, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <Icon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: color || 'var(--text-primary)', marginTop: 2 }}>{value}</div>
            </div>
        </div>
    );
}
