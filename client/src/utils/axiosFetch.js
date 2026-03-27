import axios from "axios";

// ✅ Create Axios instance
const axiosFetch = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ✅ Interceptor to attach token from localStorage (runs automatically on every request)
axiosFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosFetch;
