import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { ROLE_PERMISSIONS } from '../config/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [allowedPages, setAllowedPages] = useState(() => {
        // Always derive from current frontend ROLE_PERMISSIONS so new pages are
        // immediately visible without requiring a re-login.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            return ROLE_PERMISSIONS[parsedUser.role] || [];
        }
        return [];
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            client.get('/auth/me')
                .then((res) => {
                    const userData = res.data.user;
                    // Always derive from frontend ROLE_PERMISSIONS to ensure
                    // newly added pages are visible without requiring a re-login.
                    const pages = ROLE_PERMISSIONS[userData.role] || res.data.allowedPages || [];
                    setUser(userData);
                    setAllowedPages(pages);
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('allowedPages', JSON.stringify(pages));
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
        const { token, user: userData, allowedPages: backendPages } = res.data;
        // Always derive from frontend ROLE_PERMISSIONS so newly added pages
        // are immediately accessible after login.
        const pages = ROLE_PERMISSIONS[userData.role] || backendPages || [];
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
