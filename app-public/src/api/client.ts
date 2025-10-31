import axios, { type AxiosInstance } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    const envApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined
    const fallbackApiUrl = `${window.location.protocol}//${window.location.hostname}:5175`
    const apiBaseUrl = (envApiUrl && envApiUrl.length > 0 ? envApiUrl : fallbackApiUrl)

    this.client = axios.create({
      baseURL: apiBaseUrl + '/api/public',
      withCredentials: true,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
    })
  }

  async getCsrfToken() {
    // csrf-cookie запрашиваем без /api
    const envApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined
    const fallbackApiUrl = `${window.location.protocol}//${window.location.hostname}:5175`
    const apiBaseUrl = (envApiUrl && envApiUrl.length > 0 ? envApiUrl : fallbackApiUrl)

    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', {
      withCredentials: true,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
  }

  async register(credentials: { name: string; email: string; password: string; password_confirmation: string }) {
    const xsrfToken = this.getCookieValue('XSRF-TOKEN')
    if (!xsrfToken) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }
    
    const { data } = await this.client.post('/register', credentials, {
      headers: {
        'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
      },
    })
    return data
  }

  async login(credentials: { email: string; password: string }) {
    const xsrfToken = this.getCookieValue('XSRF-TOKEN')
    if (!xsrfToken) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }
    
    const { data } = await this.client.post('/login', credentials, {
      headers: {
        'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
      },
    })
    return data
  }

  private getCookieValue(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  async logout() {
    const xsrfToken = this.getCookieValue('XSRF-TOKEN')
    if (!xsrfToken) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }
    
    const { data } = await this.client.post('/logout', {}, {
      headers: {
        'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
      },
    })
    return data
  }

  async getCurrentUser() {
    const { data } = await this.client.get('/me')
    return data
  }

  // Tasks API
  async getTasks(params?: { status?: string; page?: number; per_page?: number }) {
    const { data } = await this.client.get<{ success: boolean; data: any[]; meta: any }>('/tasks', {
      params,
    })
    return data
  }

  async getTask(id: number) {
    const { data } = await this.client.get<{ success: boolean; data: any }>(`/tasks/${id}`)
    return data
  }

  // Comments API
  async createComment(taskId: number, commentData: { content: string }) {
    const xsrfToken = this.getCookieValue('XSRF-TOKEN')
    if (!xsrfToken) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }

    const { data } = await this.client.post<{ success: boolean; data: any }>(
      `/tasks/${taskId}/comments`,
      {
        ...commentData,
        task_id: taskId,
      },
      {
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
        },
      },
    )
    return data
  }
}

export const apiClient = new ApiClient()
export default apiClient


