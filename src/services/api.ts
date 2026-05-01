import { supabase } from './supabase';

const API_URL = 'https://finance-control-react.onrender.com'; 

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export const api = {
  async post(endpoint: string, body: any) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || 'Erro na requisição');
      } catch {
        throw new Error(text || 'Erro na requisição');
      }
    }
    return text ? JSON.parse(text) : {};
  },

  async put(endpoint: string, body: any) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || 'Erro na requisição');
      } catch {
        throw new Error(text || 'Erro na requisição');
      }
    }
    return text ? JSON.parse(text) : {};
  },

  async delete(endpoint: string) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!response.ok) throw new Error(text || 'Erro na requisição');
    return text ? JSON.parse(text) : {};
  },

  async get(endpoint: string) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || 'Erro na requisição');
      } catch {
        throw new Error(text || 'Erro na requisição');
      }
    }
    return text ? JSON.parse(text) : {};
  }
};
