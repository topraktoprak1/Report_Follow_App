import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ProjeRaporlama from './pages/ProjeRaporlama';
import ProjeRaporDagilimi from './pages/ProjeRaporDagilimi';
import ProjeOngoruRaporu from './pages/ProjeOngoruRaporu';
import KullaniciRaporGirisi from './pages/KullaniciRaporGirisi';
import CanliSistemKayitlari from './pages/CanliSistemKayitlari';
import PersonelAnalizRaporlari from './pages/PersonelAnalizRaporlari';
import KullaniciProfili from './pages/KullaniciProfili';
import YetkilendirmeMatrix from './pages/YetkilendirmeMatrix';
import IzinTalepYonetimi from './pages/IzinTalepYonetimi';
import KullaniciIzinDetaylari from './pages/KullaniciIzinDetaylari';
import ProjeDetaySayfasi from './pages/ProjeDetaySayfasi';
import SistemAyarlari from './pages/SistemAyarlari';
import KullaniciYonetimi from './pages/KullaniciYonetimi';

const pages = [
    { path: 'proje-raporlama', key: 'proje-raporlama', element: <ProjeRaporlama /> },
    { path: 'proje-rapor-dagilimi', key: 'proje-rapor-dagilimi', element: <ProjeRaporDagilimi /> },
    { path: 'proje-ongoru-raporu', key: 'proje-ongoru-raporu', element: <ProjeOngoruRaporu /> },
    { path: 'kullanici-rapor-girisi', key: 'kullanici-rapor-girisi', element: <KullaniciRaporGirisi /> },
    { path: 'canli-sistem-kayitlari', key: 'canli-sistem-kayitlari', element: <CanliSistemKayitlari /> },
    { path: 'personel-analiz-raporlari', key: 'personel-analiz-raporlari', element: <PersonelAnalizRaporlari /> },
    { path: 'kullanici-profili', key: 'kullanici-profili', element: <KullaniciProfili /> },
    { path: 'yetkilendirme-matrix', key: 'yetkilendirme-matrix', element: <YetkilendirmeMatrix /> },
    { path: 'izin-talep-yonetimi', key: 'izin-talep-yonetimi', element: <IzinTalepYonetimi /> },
    { path: 'kullanici-izin-detaylari', key: 'kullanici-izin-detaylari', element: <KullaniciIzinDetaylari /> },
    { path: 'proje-detay-sayfasi', key: 'proje-detay-sayfasi', element: <ProjeDetaySayfasi /> },
    { path: 'sistem-ayarlari', key: 'sistem-ayarlari', element: <SistemAyarlari /> },
    { path: 'kullanici-yonetimi', key: 'kullanici-yonetimi', element: <KullaniciYonetimi /> },
];

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/proje-raporlama" replace />} />
                        {pages.map(p => (
                            <Route
                                key={p.path}
                                path={p.path}
                                element={
                                    <ProtectedRoute pageKey={p.key}>
                                        {p.element}
                                    </ProtectedRoute>
                                }
                            />
                        ))}
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
