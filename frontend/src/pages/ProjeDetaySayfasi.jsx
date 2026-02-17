import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DashboardService from '../api/dashboard';
import { FolderOpen, Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';

const STATUS_STYLES = {
    'Tamamlandı': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    'Devam Ediyor': { bg: 'rgba(0,212,255,0.15)', color: '#00d4ff' },
    'Bekliyor': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
};



export default function ProjeDetaySayfasi() {
    const [project, setProject] = useState(null);
    const [team, setTeam] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsData, personnelData] = await Promise.all([
                    DashboardService.getProjects(),
                    DashboardService.getPersonnelList()
                ]);

                if (projectsData.length > 0) {
                    const currentProj = projectsData[0]; // Pick first project for now

                    // Mock details that aren't in DB yet
                    const details = {
                        ad: currentProj.name,
                        aciklama: 'Excel verisinden otomatik oluşturuldu',
                        baslangic: '2025-01-01',
                        bitis: '2025-12-31',
                        ilerleme: 0,
                        durum: 'Devam Ediyor',
                        yonetici: '-',
                        butce: 0,
                        harcanan: 0,
                    };
                    setProject(details);

                    // Filter team members
                    const projectTeamMembers = personnelData.filter(p =>
                        p.projects && p.projects.includes(currentProj.name)
                    ).map(p => ({
                        ad: p.ad,
                        rol: p.pozisyon,
                        departman: p.departman
                    }));
                    setTeam(projectTeamMembers);
                }
            } catch (error) {
                console.error('Proje verisi hatası:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="page-container">Yükleniyor...</div>;
    if (!project) return <div className="page-container">Henüz proje bulunmamaktadır. Lütfen Excel dosyasını yükleyin.</div>;

    const budgetPercent = project.butce > 0 ? Math.round((project.harcanan / project.butce) * 100) : 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Proje Detay Sayfası</h1>
                <p className="page-subtitle">{project.ad} — {project.aciklama}</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={TrendingUp} value={`%${project.ilerleme}`} label="İlerleme" color="#00d4ff" />
                <StatCard icon={Calendar} value={project.bitis} label="Bitiş Tarihi" color="#8b5cf6" />
                <StatCard icon={DollarSign} value={`₺${(project.butce / 1000).toFixed(0)}K`} label="Bütçe" color="#0cdba8" />
                <StatCard icon={Users} value={team.length} label="Ekip Üyesi" color="#f59e0b" />
            </div>

            {/* Project Overview Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Proje Bilgileri</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <InfoItem label="Proje Adı" value={project.ad} />
                        <InfoItem label="Durum" value={project.durum} />
                        <InfoItem label="Başlangıç" value={project.baslangic} />
                        <InfoItem label="Bitiş" value={project.bitis} />
                        <InfoItem label="Proje Yöneticisi" value={project.yonetici} />
                        <InfoItem label="Bütçe Kullanımı" value={`%${budgetPercent} (₺${project.harcanan.toLocaleString()} / ₺${project.butce.toLocaleString()})`} />
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Genel İlerleme</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00d4ff' }}>%{project.ilerleme}</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${project.ilerleme}%`, height: '100%', background: 'linear-gradient(90deg, #00d4ff, #0cdba8)', borderRadius: 4, transition: 'width 1s ease' }} />
                        </div>
                    </div>
                </div>

                {/* Team Card */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div><div className="chart-card-title">Proje Ekibi</div></div>
                    </div>
                    {team.length === 0 ? <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>Ekip üyesi bulunmamaktadır.</div> :
                        team.map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < team.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${i * 60}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                                    {m.ad.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{m.ad}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.rol} • {m.departman}</div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Tasks Table */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <div>
                        <div className="chart-card-title">Görev Listesi</div>
                        <div className="chart-card-subtitle">Proje görevleri ve ilerleme durumları</div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Görev', 'Atanan', 'Başlangıç', 'Bitiş', 'İlerleme', 'Durum'].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Görev bulunmamaktadır.</td></tr> :
                                tasks.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>{t.gorev}</td>
                                        <td style={tdStyle}>{t.atanan}</td>
                                        <td style={tdStyle}>{t.baslangic}</td>
                                        <td style={tdStyle}>{t.bitis}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                                                    <div style={{ width: `${t.ilerleme}%`, height: '100%', background: t.ilerleme === 100 ? '#22c55e' : '#00d4ff', borderRadius: 3 }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: t.ilerleme === 100 ? '#22c55e' : '#00d4ff' }}>%{t.ilerleme}</span>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, ...STATUS_STYLES[t.durum] }}>
                                                {t.durum}
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

function InfoItem({ label, value }) {
    return (
        <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
        </div>
    );
}

const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', color: '#e8edf5', fontSize: '0.875rem' };
