import axios, { type AxiosInstance } from 'axios'
import type {
  Task,
  PaginatedResponse,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  User,
} from '@/types/task'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    const envApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined
    const fallbackApiUrl = `${window.location.protocol}//${window.location.hostname}:5175`
    const apiBaseUrl = (envApiUrl && envApiUrl.length > 0 ? envApiUrl : fallbackApiUrl)

    // eslint-disable-next-line no-console
    console.debug('[api] baseURL =', apiBaseUrl)

    this.client = axios.create({
      baseURL: apiBaseUrl + '/api/admin',
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
  async getTasks(filters?: TaskFilters) {
    const params = new URLSearchParams()
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    const queryString = params.toString()
    const url = `/tasks${queryString ? `?${queryString}` : ''}`
    const { data } = await this.client.get<{ success: boolean; data: PaginatedResponse<Task> }>(url)
    return data
  }

  async getTask(id: number) {
    const { data } = await this.client.get<{ success: boolean; data: Task }>(`/tasks/${id}`)
    return data
  }

  async createTask(taskData: CreateTaskData) {
    const xsrfToken = this.getCookieValue('XSRF-TOKEN')
    if (!xsrfToken) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }

    const { data } = await this.client.post<{ success: boolean; data: Task }>(
      '/tasks',
      taskData,
      {
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
        },
      },
    )
    return data
  }

  async updateTask(id: number, taskData: UpdateTaskData) {
    const xsrfToken = this.getCookieValue('XSRF-TOKEN')
    if (!xsrfToken) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }

    const { data } = await this.client.put<{ success: boolean; data: Task }>(
      `/tasks/${id}`,
      taskData,
      {
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
        },
      },
    )
    return data
  }

  async deleteTask(id: number) {
    const xsrfToken = this.getCookieValue('XSRF-TOKEN')
    if (!xsrfToken) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }

    const { data } = await this.client.delete<{ success: boolean; message?: string }>(
      `/tasks/${id}`,
      {
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
        },
      },
    )
    return data
  }

  // Users API
  async searchUsers(query: string) {
    const { data } = await this.client.get<{ success: boolean; data: User[] }>(
      `/users/search?q=${encodeURIComponent(query)}`,
    )
    return data
  }
}

export const apiClient = new ApiClient()
export default apiClient

