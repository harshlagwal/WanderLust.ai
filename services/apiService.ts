import axios from 'axios';
import { TripItinerary, TripFormData } from '../types';

// Standardized API URL with trailing slash
const API_URL = 'http://localhost:5000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for logging
api.interceptors.request.use(config => {
    // Log the full resulting URL for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${fullUrl}`);
    return config;
}, error => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
});

// Helper to set the Auth token
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Use relative paths WITHOUT leading slashes to ensure they are appended to /api/
export const login = async (email, password) => {
    try {
        const response = await api.post('auth/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const signup = async (name, email, password) => {
    try {
        const response = await api.post('auth/signup', { name, email, password });
        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const saveSearch = async (userEmail: string, question: string) => {
    try {
        const response = await api.post('search', { userEmail, question });
        return response.data;
    } catch (error) {
        console.error('Error saving search:', error);
        throw error;
    }
};

export const saveItinerary = async (
    userEmail: string,
    formData: TripFormData,
    result: TripItinerary
) => {
    try {
        const response = await api.post('itinerary', {
            userEmail,
            ...formData,
            result: result
        });
        return response.data;
    } catch (error) {
        console.error('Error saving itinerary:', error);
        throw error;
    }
};

export const getUserItineraries = async (email: string) => {
    try {
        const response = await api.get(`itinerary/${email}`);
        return response.data;
    } catch (error: any) {
        console.error('[API] Error fetching itineraries:', error.message);
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            if (status === 401) {
                throw new Error('🔐 Authentication expired. Please log in again.');
            } else if (status === 404) {
                throw new Error('📭 No trips found for this account.');
            } else {
                throw new Error(data?.message || `⚠️ Error ${status}: Could not load trips`);
            }
        }
        throw error;
    }
};
