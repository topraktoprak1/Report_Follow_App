import { useState, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import StatCard from '../components/StatCard';
import { excelApi } from '../api/excel';
import { Radio, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export default function CanliSistemKayitlari() {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRecords: 0, activeUsers: 0, successRate: 0, totalMH: 0 });

    // Load Excel data on component mount
    useEffect(() => {
        const loadExcelData = async () => {
            try {
                const response = await excelApi.getDatabaseRecords();
                if (response.success && response.records) {
                    // Transform Excel data to system log format
                    const transformedData = response.records.slice(0, 100).map((record, index) => ({
                        id: record.ID || index,
                        zaman: new Date().toLocaleTimeString('tr-TR'),
                        kullanici: record['Name Surname'] || 'Unknown',
                        islem: `${record.Discipline || 'General'} - ${record.Projects || 'Work'}`,
                        modul: record.Company || 'System',
                        durum: record.Status || 'Aktif',
                        ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                        mhours: record['TOTAL\n MH'] || 0,
                        cost: record['General Total\n Cost (USD)'] || 0
                    }));
                    
                    setRowData(transformedData);
                    
                    // Calculate stats
                    const uniqueUsers = new Set(transformedData.map(r => r.kullanici)).size;
                    const totalMH = transformedData.reduce((sum, r) => sum + (parseFloat(r.mhours) || 0), 0);
                    const successCount = transformedData.filter(r => r.durum !== 'Failed').length;
                    
                    setStats({
                        totalRecords: response.records.length,
                        activeUsers: uniqueUsers,
                        successRate: Math.round((successCount / transformedData.length) * 100),
                        totalMH: Math.round(totalMH)
                    });
                }
            } catch (error) {
                console.error('Excel data loading error:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadExcelData();
    }, []);

    const columnDefs = useMemo(() => [
        { field: 'id', headerName: '#', width: 80, sortable: true },
        { field: 'zaman', headerName: 'Zaman', width: 100, sortable: true },
        { field: 'kullanici', headerName: 'Personel', width: 200, filter: true },
        { field: 'islem', headerName: 'Proje/Discipline', flex: 1, minWidth: 250, filter: true },
        { field: 'modul', headerName: 'Şirket', width: 150, filter: true },
        { field: 'mhours', headerName: 'MH', width: 80, valueFormatter: (params) => params.value ? params.value.toFixed(1) : '0' },
        { field: 'cost', headerName: 'Maliyet (USD)', width: 130, valueFormatter: (params) => params.value ? `$${params.value.toFixed(2)}` : '$0' },
        { field: 'ip', headerName: 'IP', width: 120 },
        {
            field: 'durum', headerName: 'Durum', width: 120,
            cellRenderer: (params) => {
                const statusMap = {
                    'Actual': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', dot: '●' },
                    'Yeni': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', dot: '●' },
                    'Active': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', dot: '●' },
                    'Pending': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', dot: '●' },
                };
                const s = statusMap[params.value] || { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af', dot: '●' };
                return `<span style="padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;background:${s.bg};color:${s.color}">${s.dot} ${params.value}</span>`;
            }
        },
    ], []);

    // Live data refresh (optional - refresh Excel data periodically)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await excelApi.getDatabaseRecords();
                if (response.success && response.records) {
                    // Update a few random timestamps to show "live" activity
                    const transformedData = response.records.slice(0, 100).map((record, index) => ({
                        id: record.ID || index,
                        zaman: new Date().toLocaleTimeString('tr-TR'),
                        kullanici: record['Name Surname'] || 'Unknown',
                        islem: `${record.Discipline || 'General'} - ${record.Projects || 'Work'}`,
                        modul: record.Company || 'System',
                        durum: record.Status || 'Aktif',
                        ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                        mhours: record['TOTAL\n MH'] || 0,
                        cost: record['General Total\n Cost (USD)'] || 0
                    }));
                    setRowData(transformedData);
                }
            } catch (error) {
                console.error('Live update failed:', error);
            }
        }, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="page-container">Excel verisi yükleniyor...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Canlı Sistem Kayıtları</h1>
                <p className="page-subtitle">DATABASE Excel dosyasından canlı proje verileri</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={Radio} value={stats.totalRecords} label="Toplam Kayıt" color="#ef4444" />
                <StatCard icon={Users} value={stats.activeUsers} label="Aktif Personel" color="#00d4ff" />
                <StatCard icon={CheckCircle2} value={`%${stats.successRate}`} label="Başarı Oranı" color="#22c55e" />
                <StatCard icon={AlertTriangle} value={stats.totalMH.toLocaleString()} label="Toplam MH" color="#8b5cf6" />
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
