import axios from 'axios';

const API_BASE_URL = '/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Attach JWT token to every request
// Clear any stale mock-token that was issued before real JWT was implemented
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // 'mock-token' is a legacy placeholder - clear it and force re-login
        if (token === 'mock-token' || token.split('.').length !== 3) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('allowedPages');
            window.location.href = '/login';
            return Promise.reject(new Error('Stale token cleared - redirecting to login'));
        }
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses (token expired/invalid)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('allowedPages');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
