const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('ibs_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('ibs_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('ibs_token');
  localStorage.removeItem('ibs_user');
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  let data: any = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: response.ok ? text : `Server error (${response.status}): ${text.substring(0, 100)}` };
    }
  }

  if (!response.ok) {
    const errorMsg = Array.isArray(data.message) 
      ? data.message.join(', ') 
      : (data.message || data.error || `API request failed with status ${response.status}`);
    throw new Error(errorMsg);
  }

  return data as T;
}
