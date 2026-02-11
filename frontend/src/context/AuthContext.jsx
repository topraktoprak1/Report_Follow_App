import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [allowedPages, setAllowedPages] = useState(() => {
        const stored = localStorage.getItem('allowedPages');
        return stored ? JSON.parse(stored) : [];
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            client.get('/auth/me')
                .then((res) => {
                    setUser(res.data.user);
                    setAllowedPages(res.data.allowedPages);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    localStorage.setItem('allowedPages', JSON.stringify(res.data.allowedPages));
                })
                .catch(() => {
                    logout();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await client.post('/auth/login', { email, password });
        const { token, user: userData, allowedPages: pages } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('allowedPages', JSON.stringify(pages));
        setUser(userData);
        setAllowedPages(pages);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('allowedPages');
        setUser(null);
        setAllowedPages([]);
    };

    const isAuthenticated = !!user;
    const hasAccess = (page) => allowedPages.includes(page);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, allowedPages, hasAccess }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
