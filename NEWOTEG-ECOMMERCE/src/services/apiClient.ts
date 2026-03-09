class ApiClient {
  private token: string | null;

  constructor() {
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    try {
      const raw = localStorage.getItem('newoteg_admin_auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { token?: string };
      return parsed.token || null;
    } catch {
      return null;
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(isFormData = false) {
    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(url: string, options: RequestInit = {}, isFormData = false): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = (data as { message?: string })?.message || 'Request failed';
      throw new Error(typeof message === 'string' ? message : 'Request failed');
    }

    return data as T;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
    });
  }

  postForm<T>(url: string, formData: FormData): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        body: formData,
      },
      true,
    );
  }
}

const apiClient = new ApiClient();

export default apiClient;
