'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ChevronUp, Flame, Heart } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Argument, CATEGORY_COLORS } from '@/lib/types'

export default function QuickVotesPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [arguments_, setArguments] = useState<Argument[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedSide, setVotedSide] = useState<'my' | 'their' | null>(null)
  const [showHeart, setShowHeart] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const supabase = createClient()

  const currentArgument = arguments_[currentIndex]

  useEffect(() => {
    fetchArguments()
  }, [])

  useEffect(() => {
    if (currentArgument && user) {
      checkExistingVote()
      checkExistingUpvote()
    }
  }, [currentIndex, currentArgument, user])

  const fetchArguments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('arguments')
      .select('*')
      .eq('is_closed', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setArguments(data)
    }
    setLoading(false)
  }

  const checkExistingVote = async () => {
    if (!user || !currentArgument) return

    const { data } = await supabase
      .from('votes')
      .select('side')
      .eq('user_id', user.id)
      .eq('argument_id', currentArgument.id)
      .single()

    if (data) {
      setHasVoted(true)
      setVotedSide(data.side)
    } else {
      setHasVoted(false)
      setVotedSide(null)
    }
  }

  const checkExistingUpvote = async () => {
    if (!user || !currentArgument) return

    const { data } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', user.id)
      .eq('argument_id', currentArgument.id)
      .single()

    setHasUpvoted(!!data)
  }

  const handleVote = async (side: 'my' | 'their') => {
    if (!user || !currentArgument || hasVoted) return

    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        argument_id: currentArgument.id,
        side,
      })

    if (voteError) {
      console.error('Vote error:', voteError)
      return
    }

    const updateField = side === 'my' ? 'my_votes' : 'their_votes'
    await supabase
      .from('arguments')
      .update({ [updateField]: currentArgument[`${side}_votes`] + 1 })
      .eq('id', currentArgument.id)

    await supabase
      .from('profiles')
      .update({ total_votes: (profile?.total_votes || 0) + 1 })
      .eq('id', user.id)

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (profile?.last_vote_date === yesterday) {
      await supabase
        .from('profiles')
        .update({
          current_streak: (profile.current_streak || 0) + 1,
          longest_streak: Math.max((profile.longest_streak || 0), (profile.current_streak || 0) + 1),
          last_vote_date: today,
        })
        .eq('id', user.id)
    } else if (profile?.last_vote_date !== today) {
      await supabase
        .from('profiles')
        .update({
          current_streak: 1,
          last_vote_date: today,
        })
        .eq('id', user.id)
    }

    setHasVoted(true)
    setVotedSide(side)

    setArguments((prev) =>
      prev.map((arg) =>
        arg.id === currentArgument.id
          ? { ...arg, [updateField]: arg[`${side}_votes`] + 1 }
          : arg
      )
    )

    refreshProfile()
  }

  const handleUpvote = async () => {
    if (!user || !currentArgument || hasUpvoted) return

    const { error } = await supabase
      .from('upvotes')
      .insert({
        user_id: user.id,
        argument_id: currentArgument.id,
      })

    if (error) return

    await supabase
      .from('arguments')
      .update({ upvote_count: currentArgument.upvote_count + 1 })
      .eq('id', currentArgument.id)

    setHasUpvoted(true)
    setShowHeart(true)
    setTimeout(() => setShowHeart(false), 600)

    setArguments((prev) =>
      prev.map((arg) =>
        arg.id === currentArgument.id
          ? { ...arg, upvote_count: arg.upvote_count + 1 }
          : arg
      )
    )
  }

  const handleTap = useCallback((side: 'my' | 'their') => {
    const now = Date.now()
    if (now - lastTap < 300) {
      handleUpvote()
    } else if (!hasVoted) {
      handleVote(side)
    }
    setLastTap(now)
  }, [lastTap, hasVoted, currentArgument, user])

  const nextArgument = () => {
    if (currentIndex < arguments_.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setHasVoted(false)
      setVotedSide(null)
      setHasUpvoted(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (arguments_.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="text-gray-500 mb-4">No arguments to vote on</p>
        <Link href="/post" className="text-[#22C55E]">
          Create the first one!
        </Link>
      </div>
    )
  }

  if (currentIndex >= arguments_.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="text-xl mb-2">You've seen them all!</p>
        <p className="text-gray-500 mb-4">Check back later for more arguments</p>
        <Link href="/" className="text-[#22C55E]">
          Back to Home
        </Link>
      </div>
    )
  }

  const totalVotes = currentArgument.my_votes + currentArgument.their_votes
  const myPercentage = totalVotes > 0 ? Math.round((currentArgument.my_votes / totalVotes) * 100) : 50
  const theirPercentage = totalVotes > 0 ? 100 - myPercentage : 50

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <Link href="/" className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold">Quick Votes</h1>
        {profile && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-4 h-4" />
            <span className="font-bold">{profile.current_streak}</span>
          </div>
        )}
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-heart" />
          </div>
        )}

        {/* Category badge */}
        <div className="px-4 pt-4">
          <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[currentArgument.category]}`}>
            {currentArgument.category}
          </span>
        </div>

        {/* Title */}
        <div className="px-4 py-4">
          <h2 className="text-xl font-bold">{currentArgument.title}</h2>
        </div>

        {/* Vote zones */}
        <div className="flex-1 flex">
          {/* They're Right zone */}
          <button
            onClick={() => handleTap('their')}
            disabled={hasVoted}
            className={`flex-1 flex flex-col items-center justify-center p-4 border-r border-[#2A2A2A] transition-colors ${
              hasVoted && votedSide === 'their' ? 'bg-[#EF4444]/20' : 'active:bg-[#EF4444]/10'
            }`}
          >
            <div className={`text-xs uppercase tracking-wider mb-2 ${hasVoted && votedSide === 'their' ? 'text-[#EF4444]' : 'text-gray-500'}`}>
              Their Take
            </div>
            <p className="text-sm text-gray-300 text-center">{currentArgument.their_take}</p>
            {!hasVoted && (
              <div className="mt-4 px-4 py-2 bg-[#EF4444]/20 rounded-full text-[#EF4444] text-sm">
                They're Right
              </div>
            )}
          </button>

          {/* You're Right zone */}
          <button
            onClick={() => handleTap('my')}
            disabled={hasVoted}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-colors ${
              hasVoted && votedSide === 'my' ? 'bg-[#22C55E]/20' : 'active:bg-[#22C55E]/10'
            }`}
          >
            <div className={`text-xs uppercase tracking-wider mb-2 ${hasVoted && votedSide === 'my' ? 'text-[#22C55E]' : 'text-gray-500'}`}>
              My Take
            </div>
            <p className="text-sm text-gray-300 text-center">{currentArgument.my_take}</p>
            {!hasVoted && (
              <div className="mt-4 px-4 py-2 bg-[#22C55E]/20 rounded-full text-[#22C55E] text-sm">
                You're Right
              </div>
            )}
          </button>
        </div>

        {/* Results bar (shown after voting) */}
        {hasVoted && (
          <div className="px-4 py-4 bg-[#1A1A1A] border-t border-[#2A2A2A]">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#EF4444]">{theirPercentage}%</span>
              <span className="text-[#22C55E]">{myPercentage}%</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-[#2A2A2A]">
              <div
                className="bg-[#EF4444] transition-all duration-500"
                style={{ width: `${theirPercentage}%` }}
              />
              <div
                className="bg-[#22C55E] transition-all duration-500"
                style={{ width: `${myPercentage}%` }}
              />
            </div>
            <div className="text-center text-gray-500 text-xs mt-2">
              {totalVotes} votes
            </div>
          </div>
        )}

        {/* Next button */}
        <div className="px-4 pb-4">
          <button
            onClick={nextArgument}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
            Next
          </button>
        </div>

        {/* Double tap hint */}
        <div className="text-center text-gray-600 text-xs pb-4">
          Double tap to upvote
        </div>
      </div>
    </div>
  )
}
