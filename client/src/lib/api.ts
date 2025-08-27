import { ApiResponse } from './schemas';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || 'http://localhost:5000/api/v1';
    console.log('🔐 API Client: Constructor called, instance created:', this);
    console.log('🔐 API Client: Base URL:', this.baseURL);
  }

  // Method to set token after authentication
  setToken(token: string | null) {
    console.log('🔐 API Client: Setting token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('🔐 API Client: Instance ID:', this);
    this.token = token;
    console.log('🔐 API Client: Token set successfully, current token:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
  }

  private getAuthHeaders(): Record<string, string> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
    console.log('🔐 API Client: getAuthHeaders - Token:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
    console.log('🔐 API Client: getAuthHeaders - Headers:', headers);
    return headers;
  }

  private getAuthHeadersForUpload(): Record<string, string> {
    const headers = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
    console.log('🔐 API Client: getAuthHeadersForUpload - Token:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
    console.log('🔐 API Client: getAuthHeadersForUpload - Headers:', headers);
    return headers;
  }

  private async handleResponse<T>(response: Response, method?: string, originalData?: any): Promise<ApiResponse<T>> {
    let data: any;

    // Check if response is JSON by looking at content-type header
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    try {
      if (isJson) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (like rate limit messages)
        const textData = await response.text();
        data = { message: textData };
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      // Fallback to text if JSON parsing fails
      try {
        const textData = await response.text();
        data = { message: textData };
      } catch (textError) {
        console.error('Failed to read response as text:', textError);
        data = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
    }

    if (!response.ok) {
      // Add better error logging for debugging
      console.error(`API Error: ${response.status} ${response.statusText}`, {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const rateLimitRemaining = response.headers.get('ratelimit-remaining');
        const rateLimitReset = response.headers.get('ratelimit-reset');

        let errorMessage = 'Rate limit exceeded. Please try again later.';

        if (retryAfter) {
          const retrySeconds = parseInt(retryAfter, 10);
          if (retrySeconds <= 60) {
            errorMessage = `Rate limit exceeded. Please try again in ${retrySeconds} seconds.`;
          } else {
            const retryMinutes = Math.ceil(retrySeconds / 60);
            errorMessage = `Rate limit exceeded. Please try again in ${retryMinutes} minutes.`;
          }
        }

        // Add additional context if available
        if (rateLimitRemaining !== null) {
          errorMessage += ` (${rateLimitRemaining} requests remaining)`;
        }

        throw new Error(errorMessage);
      }

      if (response.status === 401) {
        console.error('Authentication failed. Token might be missing or expired.');
        console.error('Current token:', this.token);

        if (this.token) {
          this.debugToken(this.token);
        }

        // Try to refresh the token
        try {
          const newToken = await this.refreshAuthToken();
          if (newToken && method) {
            console.log('Token refreshed successfully, retrying request...');
            // Retry the original request with new token
            return this.retryRequest(response.url, method, originalData);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Only clear token if refresh actually failed, not if it's just missing
          if (this.token) {
            console.log('Clearing token due to refresh failure');
            this.setToken(null);
          }
          window.location.href = '/admin/login';
        }
      }

      // Extract error message from response data
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  }

  // Add token refresh logic
  private async refreshAuthToken(): Promise<string | null> {
    console.log('🔐 API Client: Attempting token refresh...');
    console.log('🔐 API Client: Current token for refresh:', this.token ? `${this.token.substring(0, 20)}...` : 'null');

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        credentials: 'include', // if using refresh token in cookie
      });

      console.log('🔐 API Client: Refresh response status:', response.status);
      console.log('🔐 API Client: Refresh response ok:', response.ok);

      if (response.ok) {
        const { token } = await response.json();
        console.log('🔐 API Client: New token received:', token ? `${token.substring(0, 20)}...` : 'null');
        this.setToken(token);
        return token;
      } else {
        const errorData = await response.json();
        console.error('🔐 API Client: Refresh failed with status:', response.status, 'Error:', errorData);
      }
    } catch (error) {
      console.error('🔐 API Client: Token refresh failed:', error);
    }
    return null;
  }

  // Debug JWT token
  private debugToken(token: string): void {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      console.log('🔍 JWT Token Debug:', {
        payload,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        isExpired: Date.now() > payload.exp * 1000,
        timeUntilExpiry: (payload.exp * 1000) - Date.now()
      });
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
    }
  }

  // Retry request with new token
  private async retryRequest<T>(url: string, method: string, data?: any): Promise<ApiResponse<T>> {
    const headers = this.getAuthHeaders();

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);

    return this.handleResponse<T>(response, method, data);
  }

  // Check if an error is rate limiting related
  private isRateLimitError(error: any): boolean {
    return error instanceof Error &&
      (error.message.includes('Rate limit') ||
        error.message.includes('Too many requests') ||
        error.message.includes('Too many authentication attempts'));
  }

  // Retry rate limited request with exponential backoff
  private async retryRateLimitedRequest<T>(url: string, method: string, data?: any, attempt: number = 1): Promise<ApiResponse<T>> {
    const maxAttempts = 3;
    const baseDelay = 1000; // 1 second base delay

    if (attempt > maxAttempts) {
      throw new Error('Maximum retry attempts exceeded for rate limited request');
    }

    // Get the current response to check retry-after header
    const currentResponse = await fetch(url, {
      method,
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : null,
    });

    // If still rate limited, check retry-after header
    if (currentResponse.status === 429) {
      const retryAfter = currentResponse.headers.get('retry-after');
      let delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;

      // If server provides retry-after, use it (with some jitter)
      if (retryAfter) {
        const retrySeconds = parseInt(retryAfter, 10);
        delay = (retrySeconds * 1000) + (Math.random() * 2000); // Add up to 2 seconds of jitter
      }

      console.log(`🔄 Rate limited request retry attempt ${attempt}/${maxAttempts}, waiting ${Math.round(delay)}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));

      // Try again after the delay
      if (attempt < maxAttempts) {
        return this.retryRateLimitedRequest<T>(url, method, data, attempt + 1);
      } else {
        // Final attempt failed
        return this.handleResponse<T>(currentResponse, method, data);
      }
    }

    // If not rate limited anymore, handle the response normally
    return this.handleResponse<T>(currentResponse, method, data);
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url: string;

    // Handle absolute URLs vs relative endpoints
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      url = `${this.baseURL}${endpoint}`;
    }

    const urlObj = new URL(url);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          urlObj.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response, 'GET');
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    console.log('🔐 API Client: POST request to:', url);
    console.log('🔐 API Client: POST data:', data);
    console.log('🔐 API Client: POST headers:', this.getAuthHeaders());

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : null,
    });

    console.log('🔐 API Client: POST response status:', response.status);
    console.log('🔐 API Client: POST response ok:', response.ok);
    console.log('🔐 API Client: POST response headers:', Object.fromEntries(response.headers.entries()));

    // If rate limited, use retry logic
    if (response.status === 429) {
      console.log('🔐 API Client: Rate limited, using retry logic');
      return this.retryRateLimitedRequest<T>(url, 'POST', data);
    }

    const result = await this.handleResponse<T>(response, 'POST', data);
    console.log('🔐 API Client: POST handleResponse result:', result);

    return result;
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : null,
    });

    return this.handleResponse<T>(response, 'PUT', data);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response, 'DELETE');
  }

  async uploadFile(file: File, folder = 'general'): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const headers = this.getAuthHeadersForUpload();
    console.log('Upload request headers:', headers);
    console.log('Upload request URL:', `${this.baseURL}/upload/single`);
    console.log('FormData contents:', {
      file: file.name,
      folder: folder,
      fileSize: file.size
    });

    const response = await fetch(`${this.baseURL}/upload/single`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return this.handleResponse(response, 'POST');
  }

  async uploadFiles(files: File[], folder = 'general'): Promise<ApiResponse<any>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);

    const response = await fetch(`${this.baseURL}/upload/multiple`, {
      method: 'POST',
      headers: this.getAuthHeadersForUpload(),
      body: formData,
    });

    return this.handleResponse(response, 'POST');
  }

  async deleteFile(publicId: string): Promise<ApiResponse<any>> {
    const encodedPublicId = encodeURIComponent(publicId);
    return this.delete(`/upload/${encodedPublicId}`);
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    return this.post('/auth/login', credentials);
  }

  async logout(): Promise<ApiResponse<any>> {
    const result = await this.post('/auth/logout');
    localStorage.removeItem('auth_token');
    return result;
  }

  async refreshToken(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const { token } = await response.json();
        this.setToken(token);
        return { success: true, data: { token } };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.setToken(null);
      throw error;
    }
  }

  async verifyToken(): Promise<ApiResponse<any>> {
    return this.get('/auth/me');
  }

  // Test current token validity
  async testCurrentToken(): Promise<boolean> {
    try {
      const response = await this.get('/auth/me');
      return response.success === true;
    } catch (error) {
      console.error('Token test failed:', error);
      return false;
    }
  }

  // Contact form submission
  async submitContactMessage(data: { name: string; email: string; subject?: string; message: string }): Promise<ApiResponse<any>> {
    console.log('🔐 API Client: submitContactMessage called with data:', data);

    const payload = {
      name: data.name,
      email: data.email,
      message: data.message,
      ...(data.subject && { subject: data.subject })
    };

    console.log('🔐 API Client: submitContactMessage payload:', payload);
    console.log('🔐 API Client: submitContactMessage endpoint:', '/contact');
    console.log('🔐 API Client: submitContactMessage full URL:', `${this.baseURL}/contact`);

    const result = await this.post('/contact', payload);
    console.log('🔐 API Client: submitContactMessage result:', result);

    return result;
  }

  // Projects API
  async getProjects(params?: { page?: number; limit?: number; featured?: boolean; tag?: string }): Promise<ApiResponse<any>> {
    return this.get('/projects', params);
  }

  async getProject(slugOrId: string): Promise<ApiResponse<any>> {
    return this.get(`/projects/${slugOrId}`);
  }

  // Certificates API
  async getCertificates(params?: { page?: number; limit?: number; organization?: string; tag?: string }): Promise<ApiResponse<any>> {
    return this.get('/certificates', params);
  }

  async getCertificate(id: string): Promise<ApiResponse<any>> {
    return this.get(`/certificates/${id}`);
  }

  // Timeline API
  async getTimelineItems(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    return this.get('/timeline', params);
  }

  async getTimelineItem(id: string): Promise<ApiResponse<any>> {
    return this.get(`/timeline/${id}`);
  }
}

// Prefer runtime-configured API URL via Vite env, fallback to localhost default
const configuredApiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : undefined;

export const apiClient = new ApiClient(configuredApiBaseUrl);

// Cloudinary URL builder
export const buildCloudinaryUrl = (imageData: string, transformations?: string): string => {
  if (!imageData) return '';

  // If it's already a full URL (including Cloudinary or external URLs), return as-is
  if (imageData.startsWith('http')) {
    return imageData;
  }

  // If it's a Cloudinary public_id, build the URL with transformations
  const cloudName = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
    ? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    : 'dse13zdp7';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transforms = transformations || 'w_400,h_300,c_fill,f_auto,q_auto';

  return `${baseUrl}/${transforms}/${imageData}`;
};

// Common transformations
export const cloudinaryTransforms = {
  thumbnail: 'w_150,h_150,c_fill,f_auto,q_auto',
  card: 'w_400,h_300,c_fill,f_auto,q_auto',
  hero: 'w_800,h_500,c_fill,f_auto,q_auto',
  full: 'w_1200,h_800,c_limit,f_auto,q_auto',
};