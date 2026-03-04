const BASE_URL = '/api';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Unexpected API error');
  }

  return data;
};

export const apiService = {
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  getCurrentUser() {
    return request('/users/me');
  },
  getEntries() {
    return request('/time-entries');
  },
  createEntry(payload) {
    return request('/time-entries', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateEntry(id, payload) {
    return request(`/time-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteEntry(id) {
    return request(`/time-entries/${id}`, { method: 'DELETE' });
  },
  getSummary() {
    return request('/reports/summary');
  }
};
