import { useState, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import StatCard from '../components/StatCard';
import { systemRecords } from '../data/mockData';
import { Radio, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export default function CanliSistemKayitlari() {
    const [rowData, setRowData] = useState(systemRecords);

    const columnDefs = useMemo(() => [
        { field: 'id', headerName: '#', width: 60, sortable: true },
        { field: 'zaman', headerName: 'Zaman', width: 100, sortable: true },
        { field: 'kullanici', headerName: 'Kullanıcı', width: 150, filter: true },
        { field: 'islem', headerName: 'İşlem', flex: 1, minWidth: 180, filter: true },
        { field: 'modul', headerName: 'Modül', width: 180, filter: true },
        { field: 'ip', headerName: 'IP Adresi', width: 130 },
        {
            field: 'durum', headerName: 'Durum', width: 120,
            cellRenderer: (params) => {
                const s = {
                    'Başarılı': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', dot: '●' },
                    'Başarısız': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '●' },
                    'Bekliyor': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', dot: '●' },
                }[params.value] || { bg: 'transparent', color: '#94a3b8', dot: '' };
                return `<span style="padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;background:${s.bg};color:${s.color}">${s.dot} ${params.value}</span>`;
            }
        },
    ], []);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            const actions = ['Rapor Görüntüleme', 'Veri Sorgulama', 'Dosya İndirme', 'Ayar Güncelleme', 'Sistem Girişi'];
            const modules = ['Proje Raporlama', 'Kullanıcı Profili', 'Sistem Ayarları', 'İzin Yönetimi'];
            const users = ['Ahmet Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Zeynep Arslan'];
            const now = new Date();
            const newRecord = {
                id: Date.now(),
                zaman: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
                kullanici: users[Math.floor(Math.random() * users.length)],
                islem: actions[Math.floor(Math.random() * actions.length)],
                modul: modules[Math.floor(Math.random() * modules.length)],
                durum: Math.random() > 0.1 ? 'Başarılı' : 'Başarısız',
                ip: `192.168.1.${Math.floor(Math.random() * 50)}`,
            };
            setRowData(prev => [newRecord, ...prev].slice(0, 50));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Canlı Sistem Kayıtları</h1>
                <p className="page-subtitle">Gerçek zamanlı sistem aktivite logları</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={Radio} value={rowData.length} label="Toplam Kayıt" color="#00d4ff" />
                <StatCard icon={CheckCircle2} value={rowData.filter(r => r.durum === 'Başarılı').length} label="Başarılı" color="#22c55e" />
                <StatCard icon={AlertTriangle} value={rowData.filter(r => r.durum === 'Başarısız').length} label="Başarısız" color="#ef4444" />
                <StatCard icon={Users} value={[...new Set(rowData.map(r => r.kullanici))].length} label="Aktif Kullanıcı" color="#8b5cf6" />
            </div>

            <div className="data-table-wrapper">
                <div className="ag-theme-alpine-dark" style={{ height: 480, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={{ resizable: true }}
                        animateRows={true}
                        getRowId={(params) => String(params.data.id)}
                    />
                </div>
            </div>
        </div>
    );
}
