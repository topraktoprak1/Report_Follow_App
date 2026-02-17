import client from './client';

const DashboardService = {
    getStats: async () => {
        const response = await client.get('/dashboard/stats');
        return response.data;
    },
    getPersonnelList: async () => {
        const response = await client.get('/dashboard/personnel');
        return response.data;
    },
    getDepartmentStats: async () => {
        const response = await client.get('/dashboard/department-performance');
        return response.data;
    },
    getProjects: async () => {
        const response = await client.get('/dashboard/projects');
        return response.data;
    },
    getProjectStats: async () => {
        const response = await client.get('/dashboard/project-stats');
        return response.data;
    }
};

export default DashboardService;
