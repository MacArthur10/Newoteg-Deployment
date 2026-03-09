// API Client - Centralized HTTP request handler
// Handles authentication, error handling, and request/response formatting

import API_BASE_URL from '../config/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getStoredToken();
  }

  // ── Token Management ──────────────────────────────────────────
  getStoredToken() {
    try {
      const auth = localStorage.getItem('newoteg_auth');
      if (auth) {
        const { token } = JSON.parse(auth);
        return token;
      }
    } catch (error) {
      console.error('Failed to get stored token:', error);
    }
    return null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('newoteg_auth');
  }

  // ── Request Building ──────────────────────────────────────────
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // ── Core HTTP Methods ─────────────────────────────────────────
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || data || 'Request failed',
          data,
        };
      }

      return data;
    } catch (error) {
      // Network or parsing error
      if (!error.status) {
        throw {
          status: 0,
          message: 'Network error or server unavailable',
          error,
        };
      }
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.toString(), {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Singleton instance
const apiClient = new ApiClient();

export default apiClient;
