import client from './client.js';

const BASE = '/analytics';

export const analyticsApi = {
    /**
     * GET /api/analytics/filter-options
     * Returns available filter values for all dimensions.
     * Pass activeFilters to get cascading options.
     */
    getFilterOptions: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (Object.keys(filters).length > 0) {
                params.set('filters', JSON.stringify(filters));
            }
            const response = await client.get(`${BASE}/filter-options?${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            return {};
        }
    },

    /**
     * POST /api/analytics/filter
     * Filter records by dimension values.
     * @param {{ filters: Record<string, string[]> }} payload
     */
    filterRecords: async (payload = { filters: {} }) => {
        try {
            const response = await client.post(`${BASE}/filter`, payload);
            return response.data;
        } catch (error) {
            console.error('Failed to filter records:', error);
            return { records: [] };
        }
    },

    /**
     * GET /api/analytics/mh-summary
     * Returns MH aggregated by person x month.
     * @param {{ year?: string, month?: string, filters?: object }} params
     */
    getMhSummary: async (params = {}) => {
        try {
            const qs = new URLSearchParams();
            if (params.year) qs.set('year', params.year);
            if (params.month) qs.set('month', params.month);
            if (params.filters) qs.set('filters', JSON.stringify(params.filters));
            const response = await client.get(`${BASE}/mh-summary?${qs}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch MH summary:', error);
            return { data: [] };
        }
    },

    /**
     * GET /api/analytics/kar-zarar-trends
     * Monthly KAR-ZARAR or MH trends grouped by a dimension.
     * @param {{ dimension: string, year?: string, metric?: string }} params
     */
    getKarZararTrends: async (params = {}) => {
        try {
            const qs = new URLSearchParams();
            if (params.dimension) qs.set('dimension', params.dimension);
            if (params.year) qs.set('year', params.year);
            if (params.metric) qs.set('metric', params.metric);
            const response = await client.get(`${BASE}/kar-zarar-trends?${qs}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch trends:', error);
            return { data: [] };
        }
    },

    /**
     * GET /api/analytics/total-mh-pie
     * Total MH grouped by a dimension, suitable for pie/bar chart.
     * @param {{ dimension: string, year?: string }} params
     */
    getTotalMhPie: async (params = {}) => {
        try {
            const qs = new URLSearchParams();
            if (params.dimension) qs.set('dimension', params.dimension);
            if (params.year) qs.set('year', params.year);
            const response = await client.get(`${BASE}/total-mh-pie?${qs}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch MH pie:', error);
            return { data: [] };
        }
    },

    /**
     * GET /api/analytics/apcb-pie
     * AP-CB vs Subcon record counts.
     */
    getApcbPie: async () => {
        try {
            const response = await client.get(`${BASE}/apcb-pie`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch AP-CB pie:', error);
            return { data: [] };
        }
    },

    /**
     * POST /api/analytics/recalculate  (admin only)
     * Re-run calculate_auto_fields on every record in the DB.
     */
    recalculate: async () => {
        const response = await client.post(`${BASE}/recalculate`);
        return response.data;
    },

    /**
     * POST /api/analytics/fill-empty-cells  (admin only)
     * Upload an Excel file; receive a processed file with empty cells filled.
     * @param {File} file
     */
    fillEmptyCells: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await client.post(`${BASE}/fill-empty-cells`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'json',
        });
        return response.data;
    },

    /**
     * GET /api/analytics/download/<filename>  (admin only)
     * Returns a blob URL for downloading a processed file.
     * @param {string} filename
     */
    downloadFile: (filename) => {
        return `${client.defaults.baseURL}${BASE}/download/${encodeURIComponent(filename)}`;
    },
};

export default analyticsApi;
