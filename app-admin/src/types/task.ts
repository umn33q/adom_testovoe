export type TaskStatus = 'published' | 'in-progress' | 'done' | 'canceled'

export type ParticipantRole = 'creator' | 'executor' | 'observer'

export interface User {
  id: number
  name: string
  email: string
}

export interface TaskParticipant {
  id: number
  name: string
  email: string
  role: ParticipantRole
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  due_date: string | null
  creator: User
  executor: User | null
  participants: TaskParticipant[]
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  content: string
  task_id: number
  user: User
  created_at: string
  updated_at: string
}

export interface CreateCommentData {
  content: string
  task_id: number
}

export type UpdateCommentData = Partial<CreateCommentData>

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface CreateTaskData {
  title: string
  description: string
  status: TaskStatus
  due_date: string | null
  creator_id: number
  executor_id: number | null
  participants: Array<{
    user_id: number
    role: ParticipantRole
  }>
}

export type UpdateTaskData = Partial<CreateTaskData>

export interface TaskFilters {
  status?: TaskStatus | null
  page?: number
}

