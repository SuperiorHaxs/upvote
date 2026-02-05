'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Trophy, Scale, Flame, BarChart3, Star, LogOut } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Argument, Badge } from '@/lib/types'
import ArgumentCard from '@/components/ArgumentCard'

type ProfileTab = 'my' | 'voted' | 'upvoted'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('my')
  const [arguments_, setArguments] = useState<Argument[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBadges()
      fetchArguments()
    }
  }, [user, activeTab])

  const fetchBadges = async () => {
    if (!user) return

    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user.id)

    if (data) {
      setBadges(data)
    }
  }

  const fetchArguments = async () => {
    if (!user) return
    setLoading(true)

    let query = supabase.from('arguments').select('*, profiles(username, avatar_url)')

    if (activeTab === 'my') {
      query = query.eq('user_id', user.id)
    } else if (activeTab === 'voted') {
      const { data: votes } = await supabase
        .from('votes')
        .select('argument_id')
        .eq('user_id', user.id)

      const argIds = votes?.map((v) => v.argument_id) || []
      if (argIds.length > 0) {
        query = query.in('id', argIds)
      } else {
        setArguments([])
        setLoading(false)
        return
      }
    } else if (activeTab === 'upvoted') {
      const { data: upvotes } = await supabase
        .from('upvotes')
        .select('argument_id')
        .eq('user_id', user.id)

      const argIds = upvotes?.map((u) => u.argument_id) || []
      if (argIds.length > 0) {
        query = query.in('id', argIds)
      } else {
        setArguments([])
        setLoading(false)
        return
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (!error && data) {
      setArguments(data)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const winRate = profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'my', label: 'My Arguments' },
    { id: 'voted', label: 'Voted On' },
    { id: 'upvoted', label: 'Upvoted' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Profile</h1>
        <button
          onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22C55E] to-[#EF4444] flex items-center justify-center text-2xl font-bold">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">@{profile.username}</h2>
            <p className="text-sm text-gray-500">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0F0F0F] rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs text-gray-500">Win Rate</span>
            </div>
            <div className="text-xl font-bold">{winRate}%</div>
          </div>
          <div className="bg-[#0F0F0F] rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Scale className="w-4 h-4" />
              <span className="text-xs text-gray-500">Judge Score</span>
            </div>
            <div className="text-xl font-bold">{profile.judge_score}%</div>
          </div>
          <div className="bg-[#0F0F0F] rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs text-gray-500">Streak</span>
            </div>
            <div className="text-xl font-bold">{profile.current_streak} days</div>
          </div>
          <div className="bg-[#0F0F0F] rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs text-gray-500">Total Votes</span>
            </div>
            <div className="text-xl font-bold">{profile.total_votes}</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Badges
          </h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 whitespace-nowrap"
              >
                <div className="text-sm font-medium">{badge.badge_name}</div>
                <div className="text-xs text-gray-500">{badge.badge_type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A1A1A] rounded-xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#2A2A2A] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Arguments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : arguments_.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No arguments yet</p>
          {activeTab === 'my' && (
            <Link href="/post" className="text-[#22C55E] text-sm mt-2 block">
              Create your first argument
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {arguments_.map((argument) => (
            <ArgumentCard key={argument.id} argument={argument} />
          ))}
        </div>
      )}
    </div>
  )
}
