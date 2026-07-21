const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      // Only reload if we are not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  
  return data;
}

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Set content-type to JSON unless options.body is FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  
  const config = {
    ...options,
    headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  return handleResponse(response);
}

// Authentication
export const authAPI = {
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res.token && res.data?.user) {
      if (res.data.user.role !== 'installation') {
        throw new Error('Access denied. This portal is for installers only.');
      }
      setAuthToken(res.token);
      setStoredUser(res.data.user);
    }
    return res;
  },
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  },
  getProfile: async () => {
    return request('/profile');
  },
  updateProfile: async (data) => {
    const res = await request('/profile', {
      method: 'PUT',
      body: data,
    });
    if (res.data?.user) {
      setStoredUser(res.data.user);
    }
    return res;
  },
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return request('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword, confirmPassword },
    });
  }
};

// General CRM Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    return request('/dashboard/stats');
  },
  getTodayReminders: async () => {
    return request('/dashboard/reminders/today');
  },
  getMissedFollowUps: async () => {
    return request('/dashboard/reminders/missed');
  },
  getPerformance: async () => {
    return request('/dashboard/performance');
  }
};

// Notification APIs
export const notificationAPI = {
  getAll: async () => {
    return request('/notifications');
  },
  markAsRead: async (id) => {
    return request(`/notifications/${id}/read`, { method: 'PUT' });
  },
};

// Installation APIs
export const installationAPI = {
  getDashboard: async () => {
    return request('/installation/dashboard');
  },
  getLeads: async ({ search = '', status = '', issueReported = '', page = 1, limit = 10 } = {}) => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) query.append('search', search);
    if (status) query.append('status', status);
    if (issueReported) query.append('issueReported', issueReported);
    
    return request(`/installation/leads?${query.toString()}`);
  },
  updateStatus: async (leadId, status, progressRemarks, clearIssue = false) => {
    return request(`/installation/leads/${leadId}/status`, {
      method: 'PUT',
      body: { status, progressRemarks, clearIssue },
    });
  },
  reportIssue: async (leadId, issueRemarks, issueType = 'issue') => {
    return request(`/installation/leads/${leadId}/issue`, {
      method: 'PUT',
      body: { issueRemarks, issueType },
    });
  },
  resolveIssue: async (leadId, resolutionRemarks = '') => {
    return request(`/installation/leads/${leadId}/resolve-issue`, {
      method: 'PUT',
      body: { resolutionRemarks },
    });
  },
  uploadProof: async (leadId, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    
    return request(`/installation/leads/${leadId}/proof`, {
      method: 'PUT',
      body: formData,
    });
  }
};
