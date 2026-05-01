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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
  },

  async delete(endpoint: string) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }

    return true;
  },

  async get(endpoint: string) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
  }
};
