import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PAGE_CONFIG, ROLE_LABELS } from '../config/permissions';
import {
    BarChart3, PieChart, TrendingUp, FileEdit, Radio, Users,
    UserCircle, Shield, CalendarCheck, CalendarDays, FolderOpen,
    Settings, UserCog, LogOut, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import './Layout.css';

const ICON_MAP = {
    BarChart3, PieChart, TrendingUp, FileEdit, Radio, Users,
    UserCircle, Shield, CalendarCheck, CalendarDays, FolderOpen,
    Settings, UserCog,
};

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout, allowedPages } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const visiblePages = PAGE_CONFIG.filter(p => allowedPages.includes(p.key));

    // Group pages by section
    const sections = [
        { title: 'Raporlar', keys: ['proje-raporlama', 'proje-rapor-dagilimi', 'proje-ongoru-raporu', 'kullanici-rapor-girisi'] },
        { title: 'Analiz', keys: ['canli-sistem-kayitlari', 'personel-analiz-raporlari'] },
        { title: 'Yönetim', keys: ['kullanici-profili', 'yetkilendirme-matrix', 'izin-talep-yonetimi', 'kullanici-izin-detaylari', 'proje-detay-sayfasi'] },
        { title: 'Sistem', keys: ['sistem-ayarlari', 'kullanici-yonetimi'] },
    ];

    const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';

    return (
        <div className={`layout${collapsed ? ' collapsed' : ''}`}>
            <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Activity size={18} />
                    </div>
                    <span className="sidebar-logo-text">ANTI-KARMA</span>
                </div>

                <nav className="sidebar-nav">
                    {sections.map(section => {
                        const sectionPages = visiblePages.filter(p => section.keys.includes(p.key));
                        if (sectionPages.length === 0) return null;
                        return (
                            <div key={section.title}>
                                <div className="sidebar-section-title">{section.title}</div>
                                {sectionPages.map(page => {
                                    const Icon = ICON_MAP[page.icon] || BarChart3;
                                    return (
                                        <NavLink
                                            key={page.key}
                                            to={page.path}
                                            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                                        >
                                            <Icon size={18} className="sidebar-link-icon" />
                                            <span className="sidebar-link-text">{page.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
            </aside>

            <div className="main-wrapper">
                <header className="header">
                    <div className="header-left">
                        <div className="header-breadcrumb">
                            <span>ANTI-KARMA</span> — Veri Analiz Platformu
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="header-user">
                            <div className="header-user-info">
                                <div className="header-user-name">{user?.firstName} {user?.lastName}</div>
                                <div className="header-user-role">{ROLE_LABELS[user?.role] || user?.role}</div>
                            </div>
                            <div className="header-avatar">{userInitials}</div>
                        </div>
                        <button className="header-logout" onClick={handleLogout} title="Çıkış Yap">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
