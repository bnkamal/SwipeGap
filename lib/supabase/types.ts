export type UserRole = 'admin' | 'student' | 'mentor' | 'parent'
export type Country = 'AU' | 'IN'
export type SwipeDirection = 'left' | 'right'
export type PlanStatus = 'pending' | 'in_progress' | 'resolved'
export type OfferStatus = 'pending' | 'accepted' | 'declined'
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'premium'
export type SessionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
  avatar_url?: string
}

export interface StudentProfile {
  id: string
  user_id: string
  name: string
  grade: string
  country: Country
  exam_targets: string[]
  subjects: string[]
}

export interface MentorProfile {
  id: string
  user_id: string
  name: string
  subjects: string[]
  qualifications: string
  hourly_rate: number
  bio: string
  verified: boolean
}

export interface Topic {
  id: string
  subject: string
  grade: string
  curriculum: string
  exam_tag: string
  title: string
  hint: string
  subtopics: string[]
}

export interface SwipeEvent {
  id: string
  student_id: string
  topic_id: string
  direction: SwipeDirection
  created_at: string
}

export interface LearningPlan {
  id: string
  student_id: string
  topic_id: string
  status: PlanStatus
  priority: number
  topic?: Topic
}

export interface Session {
  id: string
  student_id: string
  mentor_id: string
  topic_id: string
  status: SessionStatus
  scheduled_at: string
  price: number
  daily_room_url?: string
  topic?: Topic
  mentor?: MentorProfile
  student?: StudentProfile
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  stripe_sub_id?: string
  status: string
  expires_at?: string
}

export interface Cheatsheet {
  id: string
  mentor_id: string
  title: string
  subject: string
  exam_tag: string
  file_url: string
  price: number
  approved: boolean
  downloads: number
  mentor?: MentorProfile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  message: string
  read: boolean
  created_at: string
}
