import { authorizationRoles, authorizationModules, authorizationMatrix } from '../config/authorization';
import { Shield, Check, X, Minus } from 'lucide-react';

export default function YetkilendirmeMatrix() {
    const getStatusStyle = (val) => {
        if (val === 1) return { bg: 'rgba(34,197,94,0.2)', color: '#22c55e', label: '✓' };
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '✕' };
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Yetkilendirme Matrix</h1>
                <p className="page-subtitle">Rol bazlı sayfa erişim yetkileri</p>
            </div>

            <div className="chart-card" style={{ overflow: 'auto' }}>
                <div className="chart-card-header">
                    <div>
                        <div className="chart-card-title">Erişim Matrisi</div>
                        <div className="chart-card-subtitle">Her rolün erişebildiği modüller</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e' }}>
                            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(34,197,94,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✓</span>
                            Erişim Var
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
                            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(239,68,68,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✕</span>
                            Erişim Yok
                        </span>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ ...thStyle, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1 }}>Modül</th>
                            {authorizationRoles.map(role => (
                                <th key={role} style={{ ...thStyle, textAlign: 'center' }}>{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {authorizationModules.map((mod, mi) => (
                            <tr key={mod} style={{ borderBottom: '1px solid var(--border-color)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ ...tdStyle, position: 'sticky', left: 0, background: 'var(--bg-card)', fontWeight: 500 }}>{mod}</td>
                                {authorizationRoles.map((role, ri) => {
                                    const status = getStatusStyle(authorizationMatrix[ri]?.[mi] ?? 0);
                                    return (
                                        <td key={role} style={{ ...tdStyle, textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-flex', width: 28, height: 28, borderRadius: '50%',
                                                alignItems: 'center', justifyContent: 'center',
                                                background: status.bg, color: status.color, fontSize: '0.85rem', fontWeight: 700
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle = { padding: '14px 16px', color: '#8899b4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' };
const tdStyle = { padding: '12px 16px', color: '#e8edf5', fontSize: '0.875rem' };
