import client from './client.js';

const BASE = '/hakedis';

export const hakedisApi = {
    /** GET /api/hakedis/companies → string[] */
    getCompanies: async () => {
        try {
            const res = await client.get(`${BASE}/companies`);
            return res.data?.data || [];
        } catch (err) {
            console.error('getCompanies failed:', err);
            return [];
        }
    },

    /** GET /api/hakedis/contracts?company=... → { data, scopes, projects, hasContracts } */
    getContracts: async (company = '') => {
        try {
            const params = company ? `?company=${encodeURIComponent(company)}` : '';
            const res = await client.get(`${BASE}/contracts${params}`);
            // Return full response so caller can access scopes, projects, hasContracts
            return res.data || { data: [], scopes: [], projects: [], hasContracts: false };
        } catch (err) {
            console.error('getContracts failed:', err);
            return { data: [], scopes: [], projects: [], hasContracts: false };
        }
    },

    /**
     * POST /api/hakedis/generate  →  JSON preview
     * body: { company, contractNo, startDate, endDate, reportDate, periodText, format: 'json' }
     */
    generatePreview: async (params) => {
        try {
            const res = await client.post(`${BASE}/generate`, { ...params, format: 'json' });
            return res.data;
        } catch (err) {
            console.error('generatePreview failed:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * POST /api/hakedis/generate  →  Excel file download
     */
    downloadExcel: async (params) => {
        const res = await client.post(
            `${BASE}/generate`,
            { ...params, format: 'excel' },
            { responseType: 'blob' }
        );
        const url = URL.createObjectURL(new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }));
        const link = document.createElement('a');
        link.href = url;
        const company = params.company?.replace(/\s+/g, '_') || 'rpt';
        const period  = params.startDate?.slice(0, 7) || 'period';
        link.download = `Hakedis_${company}_${params.contractNo}_${period}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * POST /api/hakedis/upload-access  →  parsed Access structure
     * @param {File} file - .accdb or .mdb file
     * @param {function} onProgress - called with 0-100
     */
    uploadAccess: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await client.post(`${BASE}/upload-access`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 600000, // 10 minutes for large Access files
            onUploadProgress: (e) => {
                if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
            },
        });
        return res.data;
    },

    /** GET /api/hakedis/access-structure → last parsed structure */
    getAccessStructure: async () => {
        try {
            const res = await client.get(`${BASE}/access-structure`);
            return res.data;
        } catch (err) {
            return { success: false };
        }
    },

    /** GET /api/hakedis/access-contracts?company=... → contracts from Access Sözleşme table or DB */
    getAccessContracts: async (company = '') => {
        try {
            const params = company ? `?company=${encodeURIComponent(company)}` : '';
            const res = await client.get(`${BASE}/access-contracts${params}`);
            return res.data;
        } catch (err) {
            return { success: false, data: [] };
        }
    },

    /**
     * GET /api/hakedis/cascade
     * Returns 3-level cascade built from Hakedis Excel + DB:
     *   { employers, contracts: { company → [contractNo] }, scopes: { contractNo → [scope] } }
     * @param {object} params - optional { employer, year }
     */
    getCascade: async ({ employer = '', year = '' } = {}) => {
        try {
            const qs = new URLSearchParams();
            if (employer) qs.set('employer', employer);
            if (year)     qs.set('year', year);
            const q = qs.toString() ? `?${qs.toString()}` : '';
            const res = await client.get(`${BASE}/cascade${q}`);
            return res.data;
        } catch (err) {
            console.error('getCascade failed:', err);
            return { success: false, employers: [], contracts: {}, scopes: {} };
        }
    },

    /** GET /api/hakedis/excel-status → status of all 6 Excel slots */
    getExcelStatus: async () => {
        try {
            const res = await client.get(`${BASE}/excel-status`);
            return res.data;
        } catch (err) {
            return { success: false, data: {} };
        }
    },

    /**
     * POST /api/hakedis/upload-excel  →  upload one Excel file
     * @param {File} file
     * @param {string} type  - one of: database, hourly_rates, hakedis, doviz_kurlari, sirket_isimleri, info
     * @param {function} [onProgress]
     */
    uploadExcel: async (file, type, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        const res = await client.post(`${BASE}/upload-excel`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
            onUploadProgress: (e) => {
                if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
            },
        });
        return res.data;
    },

    /**
     * DELETE /api/hakedis/delete-excel/:type  →  remove uploaded file
     * @param {string} type
     */
    deleteExcel: async (type) => {
        try {
            const res = await client.delete(`${BASE}/delete-excel/${type}`);
            return res.data;
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /**
     * POST /api/hakedis/bulk-generate
     * Generates all companies' Excel files for the given period and returns a ZIP.
     */
    bulkDownload: async (params) => {
        const res = await client.post(
            `${BASE}/bulk-generate`,
            params,
            { responseType: 'blob', timeout: 300000 }
        );
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        const period = params.startDate?.slice(0, 7) || 'period';
        link.download = `Toplu_Hakedis_${period}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
};
