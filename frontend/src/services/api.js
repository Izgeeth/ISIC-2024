/**
 * Centralized API Service Client
 * Handles communication with the FastAPI backend and injects JWT authorization headers.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders(token) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  auth: {
    async register(email, password, fullName) {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }
      return data;
    },

    async login(email, password) {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed.');
      }
      return data;
    },

    async getMe(token) {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: getAuthHeaders(token),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not fetch user profile.');
      }
      return data;
    },
  },

  // Predictions (CatBoost metadata & ResNet-18 image)
  predictions: {
    async predictMetadata(metadataPayload, token = null) {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      };

      const res = await fetch(`${API_BASE}/api/v1/predictions/metadata`, {
        method: 'POST',
        headers,
        body: JSON.stringify(metadataPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Metadata prediction failed.');
      }
      return data;
    },

    async getIsicRow(isicId) {
      const res = await fetch(
        `${API_BASE}/api/v1/predictions/metadata/row/${encodeURIComponent(isicId.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not load ISIC row.');
      }
      return data;
    },

    async predictImage(imageFile, token = null) {
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch(`${API_BASE}/api/v1/predictions/image`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Image prediction failed.');
      }
      return data;
    },
  },

  // User-isolated Prediction History
  history: {
    async getHistory(token, limit = 50, offset = 0) {
      const res = await fetch(
        `${API_BASE}/api/v1/predictions/history?limit=${limit}&offset=${offset}`,
        {
          headers: getAuthHeaders(token),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not fetch prediction history.');
      }
      return data;
    },

    async getHistoryRecord(token, recordId) {
      const res = await fetch(
        `${API_BASE}/api/v1/predictions/history/${recordId}`,
        {
          headers: getAuthHeaders(token),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Record not found.');
      }
      return data;
    },

    async deleteHistoryRecord(token, recordId) {
      const res = await fetch(
        `${API_BASE}/api/v1/predictions/history/${recordId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(token),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not delete history record.');
      }
      return data;
    },
  },
};
