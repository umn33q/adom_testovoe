export type TaskStatus = 'published' | 'in-progress' | 'done' | 'canceled'

export enum ParticipantRole {
  CREATOR = 'creator',
  EXECUTOR = 'executor',
  OBSERVER = 'observer',
}

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

export interface Comment {
  id: number
  content: string
  task_id: number
  user: User
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  due_date: string | null
  creator: User | null
  executor: User | null
  participants: TaskParticipant[]
  comments?: Comment[]
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface CreateCommentData {
  content: string
}

