'use client'

import { useState, useEffect } from 'react'
import { Flame, Clock, TrendingUp, Sparkles, ArrowUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Argument, CATEGORIES, Category } from '@/lib/types'
import ArgumentCard from '@/components/ArgumentCard'
import RightSidebar from '@/components/RightSidebar'

type SortTab = 'hot' | 'new' | 'top' | 'rising'

export default function HomePage() {
  const { loading: authLoading } = useAuth()
  const [arguments_, setArguments] = useState<Argument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All')
  const [activeTab, setActiveTab] = useState<SortTab>('hot')
  const supabase = createClient()

  // Read query params on client only to avoid prerender bailout
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const cp = sp.get('category') as Category | null
    const spSort = sp.get('sort')
    if (cp) setSelectedCategory(cp)
    if (spSort) setActiveTab(spSort as SortTab)
  }, [])

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
      case 'rising':
        query = query.eq('is_closed', false).order('upvote_count', { ascending: false })
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

  const tabs: { id: SortTab; label: string; icon: typeof Flame }[] = [
    { id: 'hot', label: 'Hot', icon: Flame },
    { id: 'new', label: 'New', icon: Clock },
    { id: 'top', label: 'Top', icon: TrendingUp },
    { id: 'rising', label: 'Rising', icon: Sparkles },
  ]

  return (
    <div className="layout-container">
      {/* Main Feed */}
      <div className="main-content">
        {/* Sort bar */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-2 mb-3 flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#272729] text-[#D7DADC]'
                    : 'text-[#818384] hover:bg-[#272729] hover:text-[#D7DADC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}

          <div className="ml-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              className="bg-[#272729] border border-[#343536] text-[#D7DADC] text-sm rounded-md px-2 py-1.5 focus:border-[#0079D3] cursor-pointer"
            >
              <option value="All">All Topics</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Arguments List */}
        {loading || authLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#0079D3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : arguments_.length === 0 ? (
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-8 text-center">
            <p className="text-[#818384] text-lg mb-1">No arguments found</p>
            <p className="text-[#6B6C6E] text-sm">Be the first to post one!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {arguments_.map((argument) => (
              <ArgumentCard key={argument.id} argument={argument} />
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar hidden lg:block">
        <div className="sticky top-[68px]">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
