'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Clock, Heart, Users } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIES, Category, CATEGORY_COLORS } from '@/lib/types'

export default function PostPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [myTake, setMyTake] = useState('')
  const [theirTake, setTheirTake] = useState('')
  const [category, setCategory] = useState<Category>('Random')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/auth')
      return
    }

    if (!title.trim() || !myTake.trim() || !theirTake.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    const endsAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

    const { data, error: insertError } = await supabase
      .from('arguments')
      .insert({
        user_id: user.id,
        title: title.trim(),
        my_take: myTake.trim(),
        their_take: theirTake.trim(),
        category,
        is_anonymous: isAnonymous,
        ends_at: endsAt,
        my_votes: 0,
        their_votes: 0,
        upvote_count: 0,
        is_closed: false,
      })
      .select()
      .single()

    if (insertError) {
      setError('Failed to create argument. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/argument/${data.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Create Argument</h1>
      </div>

      {!user && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-6 text-center">
          <p className="text-gray-400 mb-3">You need to sign in to post</p>
          <Link href="/auth" className="text-[#22C55E] font-medium">
            Sign In
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Title</label>
          <input
            type="text"
            placeholder="My roommate thinks..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
          />
          <div className="text-right text-xs text-gray-600 mt-1">
            {title.length}/150
          </div>
        </div>

        {/* My Take */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">My Take</label>
          <textarea
            placeholder="I believe... because..."
            value={myTake}
            onChange={(e) => setMyTake(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A] resize-none"
          />
          <div className="text-right text-xs text-gray-600 mt-1">
            {myTake.length}/500
          </div>
        </div>

        {/* Their Take */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Their Take</label>
          <textarea
            placeholder="They think... because..."
            value={theirTake}
            onChange={(e) => setTheirTake(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A] resize-none"
          />
          <div className="text-right text-xs text-gray-600 mt-1">
            {theirTake.length}/500
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#3A3A3A]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 px-4">
          <div>
            <div className="text-white">Post Anonymously</div>
            <div className="text-xs text-gray-500">Your username won't be shown</div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isAnonymous ? 'bg-[#22C55E]' : 'bg-[#2A2A2A]'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isAnonymous ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !user}
          className="w-full bg-gradient-to-r from-[#22C55E] to-[#EF4444] rounded-xl py-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Post Argument'}
        </button>
      </form>

      {/* Preview */}
      {(title || myTake || theirTake) && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Eye className="w-4 h-4" />
            Preview
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[category]}`}>
                {category}
              </span>
              <span className="text-xs flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                72h left
              </span>
            </div>
            <h3 className="font-semibold text-white mb-3">
              {title || 'Your title here...'}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  0 votes
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  0
                </span>
              </div>
              {!isAnonymous && profile && (
                <span className="text-xs">@{profile.username}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
