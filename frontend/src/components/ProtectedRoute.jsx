import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, pageKey }) {
    const { isAuthenticated, loading, hasAccess } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner" />
                    <p style={{ marginTop: 16 }}>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (pageKey && !hasAccess(pageKey)) {
        return (
            <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--accent-red)', marginBottom: 12 }}>403</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Bu sayfaya erişim yetkiniz bulunmamaktadır.
                </p>
            </div>
        );
    }

    return children;
}
