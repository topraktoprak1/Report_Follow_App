import { useState, useEffect } from 'react';
import client from '../api/client';
import { ROLE_LABELS } from '../config/permissions';
import { UserCog, Plus, Edit, Trash2, X, Search } from 'lucide-react';

export default function KullaniciYonetimi() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'personal', isActive: true });
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await client.get('/users');
            setUsers(res.data.users);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openNew = () => {
        setEditUser(null);
        setForm({ email: '', password: '', firstName: '', lastName: '', role: 'personal', isActive: true });
        setError('');
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditUser(user);
        setForm({ email: user.email, password: '', firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editUser) {
                const data = { ...form };
                if (!data.password) delete data.password;
                await client.put(`/users/${editUser.id}`, data);
            } else {
                await client.post('/users', form);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Bir hata oluştu');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bu kullanıcıyı devre dışı bırakmak istediğinize emin misiniz?')) return;
        try {
            await client.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Bir hata oluştu');
        }
    };

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Kullanıcı Yönetimi</h1>
                    <p className="page-subtitle">Kullanıcı ekleme, düzenleme ve yetkilendirme</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>
                    <Plus size={16} /> Yeni Kullanıcı
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 20, position: 'relative', maxWidth: 400 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                    placeholder="Kullanıcı ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="chart-card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Ad Soyad', 'E-posta', 'Rol', 'Durum', 'Kayıt Tarihi', 'İşlem'].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>Kullanıcı bulunamadı</td></tr>
                            ) : filtered.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ ...tdStyle, fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--bg-primary)', flexShrink: 0 }}>
                                                {(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}
                                            </div>
                                            {u.firstName} {u.lastName}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{u.email}</td>
                                    <td style={tdStyle}><span className={`badge badge-${u.role}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                                    <td style={tdStyle}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <span className={`status-dot ${u.isActive ? 'status-active' : 'status-inactive'}`} />
                                            {u.isActive ? 'Aktif' : 'Devre Dışı'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{u.createdAt?.slice(0, 10) || '-'}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}><Edit size={14} /></button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 className="modal-title" style={{ margin: 0 }}>
                                {editUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontSize: '0.85rem', marginBottom: 16 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Ad</label>
                                    <input className="form-input" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Soyad</label>
                                    <input className="form-input" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">E-posta</label>
                                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{editUser ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre'}</label>
                                <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} {...(!editUser && { required: true })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rol</label>
                                <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            {editUser && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Hesap Aktif</span>
                                    <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))} style={{
                                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: form.isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                                        position: 'relative', transition: 'background 0.2s'
                                    }}>
                                        <span style={{
                                            width: 18, height: 18, borderRadius: '50%', background: '#fff',
                                            position: 'absolute', top: 3, left: form.isActive ? 23 : 3, transition: 'left 0.2s',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                        }} />
                                    </button>
                                </div>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">{editUser ? 'Güncelle' : 'Oluştur'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', color: '#e8edf5', fontSize: '0.875rem' };
