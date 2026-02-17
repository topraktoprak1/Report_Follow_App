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
            // Try to get enhanced data from Excel
            try {
                const [projectsData, disciplinesData, statsData] = await Promise.all([
                    excelApi.getProjects(),
                    excelApi.getDisciplines(),
                    excelApi.getSummaryStats()
                ]);

                if (projectsData.success && disciplinesData.success && statsData.success) {
                    // Process discipline distribution
                    const disciplines = {};
                    disciplinesData.disciplines.forEach(record => {
                        const discipline = record.Discipline || 'Other';
                        disciplines[discipline] = (disciplines[discipline] || 0) + 1;
                    });

                    const colors = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7'];
                    
                    const categoryDistribution = Object.entries(disciplines).map(([name, value], index) => ({
                        name,
                        value,
                        color: colors[index % colors.length]
                    }));

                    // Mock project status distribution
                    const totalProjects = statsData.stats.active_projects || 0;
                    const projectStatus = [
                        { name: 'Devam Ediyor', value: Math.floor(totalProjects * 0.6), color: '#00d4ff' },
                        { name: 'Tamamlandı', value: Math.floor(totalProjects * 0.3), color: '#0cdba8' },
                        { name: 'Beklemede', value: Math.floor(totalProjects * 0.1), color: '#f59e0b' }
                    ];

                    return {
                        activeProjects: totalProjects,
                        totalTasks: statsData.stats.total_records || 0,
                        totalMH: statsData.stats.total_hours || 0,
                        avgProgress: 65,
                        categoryDistribution,
                        projectStatus
                    };
                }
            } catch (error) {
                console.log('Enhanced project stats failed, using fallback:', error.message);
            }

            // Fallback to existing API
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
            // Try Excel data first
            try {
                const employeesData = await excelApi.getEmployees();
                if (employeesData.success && employeesData.employees.length > 0) {
                    return employeesData.employees.map((emp, index) => {
                        const performance = Math.floor(Math.random() * 40) + 60; // Mock performance 60-100%
                        const department = emp.Discipline || 'Unknown';
                        const name = emp.Name || emp['Name Surname'] || 'Unknown';
                        const role = emp['FILYOS FPU\nTitle'] || emp.Title || 'Employee';
                        
                        return {
                            id: emp.ID || index,
                            name: name,
                            ad: name, // Turkish: Ad Soyad
                            department: department,
                            departman: department, // Turkish: Departman
                            role: role,
                            pozisyon: role, // Turkish: Pozisyon
                            performance: performance,
                            performans: performance, // Turkish: Performans
                            toplamMH: Math.floor(Math.random() * 100) + 50, // Mock total MH 50-150
                            tamamlanan: Math.floor(Math.random() * 20) + 5, // Mock completed tasks 5-25
                            company: emp.Company || '',
                            nationality: emp.Nationality || ''
                        };
                    });
                }
            } catch (error) {
                console.log('Excel personnel failed, using fallback:', error.message);
            }

            // Fallback to existing API
            const response = await client.get('/dashboard/personnel');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch personnel:', error);
            throw error;
        }
    },

    // Get enhanced projects list
    getProjects: async () => {
        try {
            // Try Excel data first
            try {
                const projectsData = await excelApi.getProjects();
                if (projectsData.success && projectsData.projects.length > 0) {
                    const projectNames = [...new Set(projectsData.projects.map(p => p.Projects).filter(Boolean))];
                    return projectNames.map(name => ({
                        name,
                        status: 'Active',
                        completion: Math.floor(Math.random() * 40) + 60 // Mock completion 60-100%
                    }));
                }
            } catch (error) {
                console.log('Excel projects failed, using fallback:', error.message);
            }

            // Fallback to existing API
            const response = await client.get('/dashboard/projects');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            throw error;
        }
    }
};