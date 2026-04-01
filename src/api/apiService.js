import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC BASE URL — works on both web browser and physical Android device
//
// HOW TO SET YOUR LAN IP BEFORE BUILDING FOR A PHYSICAL DEVICE:
//   1. Run `ipconfig` (Windows) or `ip a` (Linux/Mac) on your laptop.
//   2. Find your Wi-Fi IPv4 address (e.g. 192.168.1.42).
//   3. Replace the placeholder below:  '192.168.X.X'
//      ↓↓↓  PASTE YOUR IP ADDRESS HERE  ↓↓↓
const LAN_IP = '10.31.135.136'; // ← your laptop's Wi-Fi IP (auto-detected)
//      ↑↑↑  PASTE YOUR IP ADDRESS HERE  ↑↑↑
//
// ALTERNATIVELY — use a .env file so you never have to touch this file:
//   Create a file called `.env.local` in the project root and add:
//     VITE_API_URL=http://192.168.1.42:8000/api
//   Then run: npm run build
//
// Priority: VITE_API_URL env var → LAN_IP fallback
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE_URL =
    import.meta.env.VITE_API_URL || `http://${LAN_IP}:8000/api`;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 s — generous timeout for mobile / spotty Wi-Fi
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('eagle_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('eagle_token');
            localStorage.removeItem('eagle_user');
            // Redirect to login (will be handled by App.jsx)
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const apiService = {
    // Auth endpoints
    login: (email, password) =>
        axiosInstance.post('/auth/login', { email, password }),

    // Dashboard & Module endpoints
    getDashboard: () =>
        axiosInstance.get('/trainee/dashboard'),

    getModuleDetails: (moduleId) =>
        axiosInstance.get(`/trainee/module/${moduleId}`),

    // Results history endpoint — real data from DB
    getResults: () =>
        axiosInstance.get('/trainee/results'),

    // Offline sync endpoint
    syncOfflineResults: (testAttempts) =>
        axiosInstance.post('/sync/offline-results', { attempts: testAttempts }),

    // Generic GET
    get: (endpoint) =>
        axiosInstance.get(endpoint),

    // Generic POST
    post: (endpoint, data) =>
        axiosInstance.post(endpoint, data),

    // Generic PUT
    put: (endpoint, data) =>
        axiosInstance.put(endpoint, data),

    // Generic DELETE
    delete: (endpoint) =>
        axiosInstance.delete(endpoint),
};

export default apiService;
