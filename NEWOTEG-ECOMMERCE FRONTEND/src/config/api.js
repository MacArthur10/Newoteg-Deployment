// API Configuration for NEWOTEG Unified Backend
// This file centralizes all API endpoints and configuration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  
  // Products
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products`,
    CATEGORIES: `${API_BASE_URL}/products/categories`,
    DETAIL: (id) => `${API_BASE_URL}/products/${id}`,
  },
  
  // Reservations
  RESERVATIONS: {
    CREATE: `${API_BASE_URL}/reservations`,
    CREATE_GUEST: `${API_BASE_URL}/reservations/guest`,
    MY_RESERVATIONS: `${API_BASE_URL}/reservations/me`,
    CANCEL: (id) => `${API_BASE_URL}/reservations/${id}/cancel`,
  },
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
