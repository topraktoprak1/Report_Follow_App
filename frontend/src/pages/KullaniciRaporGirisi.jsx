import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
const reportEntries = [];

export default function KullaniciRaporGirisi() {
    const [rowData] = useState(reportEntries);

    const columnDefs = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70, sortable: true },
        { field: 'tarih', headerName: 'Tarih', width: 120, sortable: true, filter: true },
        { field: 'proje', headerName: 'Proje', width: 150, sortable: true, filter: true },
        { field: 'gorev', headerName: 'Görev', flex: 1, minWidth: 200, filter: true },
        {
            field: 'kategori', headerName: 'Kategori', width: 120, filter: true,
            cellRenderer: (params) => {
                const colors = { 'Yazılım': '#00d4ff', 'Tasarım': '#8b5cf6', 'Test': '#f59e0b', 'Donanım': '#0cdba8', 'Diğer': '#94a3b8' };
                return `<span style="padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;background:${colors[params.value] || '#94a3b8'}20;color:${colors[params.value] || '#94a3b8'}">${params.value}</span>`;
            }
        },
        {
            field: 'mh', headerName: 'MH', width: 80, sortable: true,
            cellStyle: { fontWeight: 600, color: '#00d4ff' }
        },
        {
            field: 'durum', headerName: 'Durum', width: 130, filter: true,
            cellRenderer: (params) => {
                const styles = {
                    'Tamamlandı': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
                    'Devam Ediyor': { bg: 'rgba(0,212,255,0.15)', color: '#00d4ff' },
                    'Bekliyor': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
                };
                const s = styles[params.value] || styles['Bekliyor'];
                return `<span style="padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;background:${s.bg};color:${s.color}">${params.value}</span>`;
            }
        },
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Kullanıcı Rapor Girişi</h1>
                <p className="page-subtitle">Günlük rapor girişleri ve görev takibi</p>
            </div>

            <div className="data-table-wrapper">
                <div className="ag-theme-alpine-dark" style={{ height: 520, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        pagination={true}
                        paginationPageSize={10}
                    />
                </div>
            </div>
        </div>
    );
}
