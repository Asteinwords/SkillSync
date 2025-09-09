import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Vite proxy forwards to https://skillsync-cvqg.onrender.com/api
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const { data } = await axios.post('/api/users/refresh', { refreshToken });
        localStorage.setItem('token', data.token);
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        return API(originalRequest);
      } catch (refreshErr) {
        console.error('Refresh token error:', refreshErr);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default API;