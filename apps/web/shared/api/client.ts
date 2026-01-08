import { getErrorMessage } from '@/lib/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TIMEOUT_MS = 30000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error));
  }
  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string): Promise<T> =>
    fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store',
    }).then((res) => handleResponse<T>(res)),

  post: <T>(endpoint: string, data: unknown): Promise<T> =>
    fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<T>(res)),

  postForm: <T>(endpoint: string, formData: FormData): Promise<T> =>
    fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    }).then((res) => handleResponse<T>(res)),

  put: <T>(endpoint: string, data: unknown): Promise<T> =>
    fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<T>(res)),

  delete: <T>(endpoint: string): Promise<T> =>
    fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    }).then((res) => handleResponse<T>(res)),
};
