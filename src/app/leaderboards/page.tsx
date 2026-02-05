'use client'

import { useState, useEffect } from 'react'
import { Trophy, Flame, Crown, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Profile } from '@/lib/types'

type LeaderboardTab = 'judges' | 'streaks' | 'wins' | 'popular'
type TimeRange = 'weekly' | 'alltime'

export default function LeaderboardsPage() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('judges')
  const [timeRange, setTimeRange] = useState<TimeRange>('alltime')
  const [leaders, setLeaders] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab, timeRange])

  const fetchLeaderboard = async () => {
    setLoading(true)

    let query = supabase.from('profiles').select('*')

    switch (activeTab) {
      case 'judges':
        query = query.order('judge_score', { ascending: false })
        break
      case 'streaks':
        query = query.order('current_streak', { ascending: false })
        break
      case 'wins':
        query = query.order('wins', { ascending: false })
        break
      case 'popular':
        query = query.order('total_votes', { ascending: false })
        break
    }

    query = query.limit(50)

    const { data, error } = await query

    if (!error && data) {
      setLeaders(data)

      if (user) {
        const rank = data.findIndex((p) => p.id === user.id)
        setUserRank(rank >= 0 ? rank + 1 : null)
      }
    }
    setLoading(false)
  }

  const tabs: { id: LeaderboardTab; icon: typeof Trophy; label: string }[] = [
    { id: 'judges', icon: Trophy, label: 'Top Judges' },
    { id: 'streaks', icon: Flame, label: 'Streaks' },
    { id: 'wins', icon: Crown, label: 'Most Wins' },
    { id: 'popular', icon: Star, label: 'Most Popular' },
  ]

  const getStatValue = (p: Profile) => {
    switch (activeTab) {
      case 'judges':
        return `${p.judge_score}%`
      case 'streaks':
        return `${p.current_streak} days`
      case 'wins':
        return `${p.wins} wins`
      case 'popular':
        return `${p.total_votes} votes`
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-500'
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30'
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/30'
    if (rank === 3) return 'bg-orange-600/10 border-orange-600/30'
    return 'bg-[#1A1A1A] border-[#2A2A2A]'
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">Leaderboards</h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#2A2A2A] text-white'
                  : 'bg-[#1A1A1A] text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Time Range Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeRange('weekly')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === 'weekly'
              ? 'bg-[#22C55E] text-white'
              : 'bg-[#1A1A1A] text-gray-500'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTimeRange('alltime')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === 'alltime'
              ? 'bg-[#22C55E] text-white'
              : 'bg-[#1A1A1A] text-gray-500'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Your Rank */}
      {userRank && profile && (
        <div className="bg-gradient-to-r from-[#22C55E]/20 to-[#EF4444]/20 border border-[#22C55E]/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22C55E] to-[#EF4444] flex items-center justify-center font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">@{profile.username}</div>
                <div className="text-sm text-gray-400">Your rank</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">#{userRank}</div>
              <div className="text-sm text-gray-400">{getStatValue(profile)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No data yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((leader, index) => {
            const rank = index + 1
            const isCurrentUser = user?.id === leader.id

            return (
              <div
                key={leader.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isCurrentUser
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/30'
                    : getRankBg(rank)
                }`}
              >
                <div className={`w-8 text-center font-bold ${getRankColor(rank)}`}>
                  {rank <= 3 ? (
                    rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
                  ) : (
                    `#${rank}`
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold text-sm">
                  {leader.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isCurrentUser ? 'text-[#22C55E]' : ''}`}>
                    @{leader.username}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{getStatValue(leader)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
