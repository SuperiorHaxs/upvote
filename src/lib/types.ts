export type Category =
  | 'Relationships'
  | 'Roommates'
  | 'Food'
  | 'Work'
  | 'Family'
  | 'Money'
  | 'Gaming'
  | 'Random'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
  current_streak: number
  longest_streak: number
  last_vote_date: string | null
  total_votes: number
  judge_score: number
  wins: number
  losses: number
}

export interface Argument {
  id: string
  user_id: string
  title: string
  my_take: string
  their_take: string
  category: Category
  is_anonymous: boolean
  created_at: string
  ends_at: string
  my_votes: number
  their_votes: number
  upvote_count: number
  is_closed: boolean
  winner: 'my' | 'their' | null
  profiles?: Profile
}

export interface Vote {
  id: string
  user_id: string
  argument_id: string
  side: 'my' | 'their'
  created_at: string
}

export interface Upvote {
  id: string
  user_id: string
  argument_id: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  argument_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface Badge {
  id: string
  user_id: string
  badge_type: string
  badge_name: string
  earned_at: string
}

export interface StreakLog {
  id: string
  user_id: string
  date: string
  votes_count: number
}

export const CATEGORIES: Category[] = [
  'Relationships',
  'Roommates',
  'Food',
  'Work',
  'Family',
  'Money',
  'Gaming',
  'Random'
]

export const CATEGORY_COLORS: Record<Category, string> = {
  Relationships: 'bg-pink-500/20 text-pink-400',
  Roommates: 'bg-purple-500/20 text-purple-400',
  Food: 'bg-orange-500/20 text-orange-400',
  Work: 'bg-blue-500/20 text-blue-400',
  Family: 'bg-yellow-500/20 text-yellow-400',
  Money: 'bg-green-500/20 text-green-400',
  Gaming: 'bg-cyan-500/20 text-cyan-400',
  Random: 'bg-gray-500/20 text-gray-400'
}
