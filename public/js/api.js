/**
 * ApiClient — Reusable HTTP Fetch Client
 */

class ApiClient {
  static async request(url, options = {}) {
    const defaultHeaders = {
      'Accept': 'application/json'
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const config = {
      credentials: 'include', // essential for express-session cookie
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !url.includes('/api/auth/me')) {
          // If unauthenticated on protected routes, redirect to login
          if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
          }
        }
        const error = new Error(data.error || data.details || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Request Error [${url}]:`, err.message);
      throw err;
    }
  }

  static get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  static post(url, body, options = {}) {
    return this.request(url, { ...options, method: 'POST', body });
  }

  static patch(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PATCH', body });
  }

  static delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

window.api = ApiClient;

