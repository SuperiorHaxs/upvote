'use client'

import { useState, useEffect } from 'react'
import { Search, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Argument, CATEGORIES, Category, CATEGORY_COLORS } from '@/lib/types'
import ArgumentCard from '@/components/ArgumentCard'

type SortTab = 'foryou' | 'hot' | 'new' | 'top'

export default function HomePage() {
  const { profile, loading: authLoading } = useAuth()
  const [arguments_, setArguments] = useState<Argument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All')
  const [activeTab, setActiveTab] = useState<SortTab>('hot')
  const supabase = createClient()

  useEffect(() => {
    fetchArguments()
  }, [selectedCategory, activeTab])

  const fetchArguments = async () => {
    setLoading(true)
    let query = supabase
      .from('arguments')
      .select('*, profiles(username, avatar_url)')

    if (selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory)
    }

    switch (activeTab) {
      case 'new':
        query = query.order('created_at', { ascending: false })
        break
      case 'top':
        query = query.order('my_votes', { ascending: false })
        break
      case 'hot':
        query = query.order('upvote_count', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'foryou':
        query = query.order('created_at', { ascending: false })
        break
    }

    query = query.limit(50)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching arguments:', error)
    } else {
      setArguments(data || [])
    }
    setLoading(false)
  }

  const filteredArguments = arguments_.filter((arg) =>
    arg.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs: { id: SortTab; label: string }[] = [
    { id: 'foryou', label: 'For You' },
    { id: 'hot', label: 'Hot' },
    { id: 'new', label: 'New' },
    { id: 'top', label: 'Top' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Logo */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">
          <span className="text-[#22C55E]">Up</span>
          <span className="text-[#EF4444]">Vote</span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search arguments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            selectedCategory === 'All'
              ? 'bg-white text-black'
              : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A]'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? CATEGORY_COLORS[category]
                : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* User Stats Banner */}
      {profile && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="font-bold">{profile.current_streak}</span>
              </div>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
            <div className="w-px h-8 bg-[#2A2A2A]" />
            <div>
              <div className="font-bold text-white">{profile.judge_score}%</div>
              <div className="text-xs text-gray-500">Judge Score</div>
            </div>
            <div className="w-px h-8 bg-[#2A2A2A]" />
            <div>
              <div className="font-bold text-white">{profile.total_votes}</div>
              <div className="text-xs text-gray-500">Votes</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A1A1A] rounded-xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
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
      {loading || authLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredArguments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No arguments found</p>
          <p className="text-sm mt-1">Be the first to post one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArguments.map((argument) => (
            <ArgumentCard key={argument.id} argument={argument} />
          ))}
        </div>
      )}
    </div>
  )
}
