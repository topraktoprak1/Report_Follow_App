import client from './client.js';

// Excel Data API methods
export const excelApi = {
    // Import data from Excel file
    importData: async () => {
        try {
            const response = await client.post('/excel/import');
            return response.data;
        } catch (error) {
            console.error('Failed to import Excel data:', error);
            throw error;
        }
    },

    // Get all database records with optional filters
    getDatabaseRecords: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key.toLowerCase(), value);
            });

            const response = await client.get(`/excel/data/database?${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch database records:', error);
            throw error;
        }
    },

    // Get employee information
    getEmployees: async (employeeId = null) => {
        try {
            const params = employeeId ? `?id=${employeeId}` : '';
            const response = await client.get(`/excel/data/employees${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch employee data:', error);
            throw error;
        }
    },

    // Get hourly rates
    getHourlyRates: async (employeeId = null) => {
        try {
            const params = employeeId ? `?id=${employeeId}` : '';
            const response = await client.get(`/excel/data/hourly-rates${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch hourly rates:', error);
            throw error;
        }
    },

    // Get project data
    getProjects: async (projectName = null) => {
        try {
            const params = projectName ? `?name=${encodeURIComponent(projectName)}` : '';
            const response = await client.get(`/excel/data/projects${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch project data:', error);
            throw error;
        }
    },

    // Get company data
    getCompanies: async (companyName = null) => {
        try {
            const params = companyName ? `?name=${encodeURIComponent(companyName)}` : '';
            const response = await client.get(`/excel/data/companies${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch company data:', error);
            throw error;
        }
    },

    // Get discipline data
    getDisciplines: async (disciplineName = null) => {
        try {
            const params = disciplineName ? `?name=${encodeURIComponent(disciplineName)}` : '';
            const response = await client.get(`/excel/data/disciplines${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch discipline data:', error);
            throw error;
        }
    },

    // Get summary statistics
    getSummaryStats: async () => {
        try {
            const response = await client.get('/excel/data/summary');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch summary stats:', error);
            throw error;
        }
    },

    // Get monthly data for charts
    getMonthlyData: async (year) => {
        try {
            const response = await client.get(`/excel/data/monthly/${year}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch monthly data:', error);
            throw error;
        }
    },

    // Search records
    searchRecords: async (searchTerm) => {
        try {
            const params = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
            const response = await client.get(`/excel/search${params}`);
            return response.data;
        } catch (error) {
            console.error('Failed to search records:', error);
            throw error;
        }
    },

    // Get data status
    getDataStatus: async () => {
        try {
            const response = await client.get('/excel/data/status');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch data status:', error);
            throw error;
        }
    }
};

// Enhanced dashboard API with Excel integration
export const dashboardApi = {
    // Get dashboard statistics with Excel data
    getStats: async () => {
        try {
            // Try Excel service first, fallback to existing API
            try {
                const excelStats = await excelApi.getSummaryStats();
                if (excelStats.success && excelStats.stats) {
                    const stats = excelStats.stats;
                    return {
                        activeProjects: stats.active_projects || 0,
                        totalTasks: stats.total_records || 0,
                        totalMH: stats.total_hours || 0,
                        avgProgress: 75 // Mock average progress
                    };
                }
            } catch (error) {
                console.log('Excel stats failed, using fallback:', error.message);
            }

            // Fallback to existing API
            const response = await client.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            throw error;
        }
    },

    // Get enhanced project statistics
    getProjectStats: async () => {
        try {
            const response = await client.get('/dashboard/project-stats');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch project stats:', error);
            throw error;
        }
    },

    // Get enhanced personnel list
    getPersonnel: async () => {
        try {
            // Use dashboard API which now returns real data
            const response = await client.get('/dashboard/personnel');
            const data = response.data;

            // Ensure consistent field names for frontend
            return data.map((p, index) => ({
                id: p.id || index,
                name: p.ad || 'Unknown',
                ad: p.ad || 'Unknown',
                department: p.departman || 'Genel',
                departman: p.departman || 'Genel',
                role: p.pozisyon || 'Personel',
                pozisyon: p.pozisyon || 'Personel',
                performance: p.performans || 0,
                performans: p.performans || 0,
                toplamMH: p.toplamMH || 0,
                tamamlanan: p.tamamlanan || 0,
                projects: p.projects || ''
            }));
        } catch (error) {
            console.error('Failed to fetch personnel:', error);
            throw error;
        }
    },

    // Get enhanced projects list
    getProjects: async () => {
        try {
            // Use dashboard API which now returns real data
            const response = await client.get('/dashboard/projects');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            throw error;
        }
    }
};