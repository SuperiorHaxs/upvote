'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Heart, Share2, Send, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Argument, Comment, CATEGORY_COLORS } from '@/lib/types'

function getTimeRemaining(endsAt: string): string {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h left`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`
  }

  return `${minutes}m left`
}

export default function ArgumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  const [argument_, setArgument] = useState<Argument | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedSide, setVotedSide] = useState<'my' | 'their' | null>(null)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchArgument()
    fetchComments()
  }, [resolvedParams.id])

  useEffect(() => {
    if (argument_ && user) {
      checkExistingVote()
      checkExistingUpvote()
    }
  }, [argument_, user])

  const fetchArgument = async () => {
    const { data, error } = await supabase
      .from('arguments')
      .select('*, profiles(username, avatar_url)')
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      console.error('Error fetching argument:', error)
      return
    }

    setArgument(data)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('argument_id', resolvedParams.id)
      .order('created_at', { ascending: true })

    if (data) {
      setComments(data)
    }
  }

  const checkExistingVote = async () => {
    if (!user || !argument_) return

    const { data } = await supabase
      .from('votes')
      .select('side')
      .eq('user_id', user.id)
      .eq('argument_id', argument_.id)
      .single()

    if (data) {
      setHasVoted(true)
      setVotedSide(data.side)
    }
  }

  const checkExistingUpvote = async () => {
    if (!user || !argument_) return

    const { data } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', user.id)
      .eq('argument_id', argument_.id)
      .single()

    setHasUpvoted(!!data)
  }

  const handleVote = async (side: 'my' | 'their') => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!argument_ || hasVoted) return

    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        argument_id: argument_.id,
        side,
      })

    if (voteError) {
      console.error('Vote error:', voteError)
      return
    }

    const updateField = side === 'my' ? 'my_votes' : 'their_votes'
    await supabase
      .from('arguments')
      .update({ [updateField]: argument_[`${side}_votes`] + 1 })
      .eq('id', argument_.id)

    await supabase
      .from('profiles')
      .update({ total_votes: (profile?.total_votes || 0) + 1 })
      .eq('id', user.id)

    setHasVoted(true)
    setVotedSide(side)
    setArgument((prev) =>
      prev ? { ...prev, [updateField]: prev[`${side}_votes`] + 1 } : null
    )
    refreshProfile()
  }

  const handleUpvote = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!argument_ || hasUpvoted) return

    const { error } = await supabase
      .from('upvotes')
      .insert({
        user_id: user.id,
        argument_id: argument_.id,
      })

    if (error) return

    await supabase
      .from('arguments')
      .update({ upvote_count: argument_.upvote_count + 1 })
      .eq('id', argument_.id)

    setHasUpvoted(true)
    setArgument((prev) =>
      prev ? { ...prev, upvote_count: prev.upvote_count + 1 } : null
    )
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/auth')
      return
    }

    if (!newComment.trim() || !argument_) return

    setSubmittingComment(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        argument_id: argument_.id,
        content: newComment.trim(),
      })
      .select('*, profiles(username, avatar_url)')
      .single()

    if (!error && data) {
      setComments((prev) => [...prev, data])
      setNewComment('')
    }

    setSubmittingComment(false)
  }

  const handleShare = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!argument_) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="text-xl mb-2">Argument not found</p>
        <Link href="/" className="text-[#22C55E]">
          Back to Home
        </Link>
      </div>
    )
  }

  const totalVotes = argument_.my_votes + argument_.their_votes
  const myPercentage = totalVotes > 0 ? Math.round((argument_.my_votes / totalVotes) * 100) : 50
  const theirPercentage = totalVotes > 0 ? 100 - myPercentage : 50
  const timeRemaining = getTimeRemaining(argument_.ends_at)
  const isEnded = argument_.is_closed || timeRemaining === 'Ended'

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <button
          onClick={handleShare}
          className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-5 h-5 text-[#22C55E]" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Argument Card */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[argument_.category]}`}>
            {argument_.category}
          </span>
          <span className={`text-xs flex items-center gap-1 ${isEnded ? 'text-gray-500' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            {isEnded ? (
              argument_.winner ? (
                <span className={argument_.winner === 'my' ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                  Verdict: {argument_.winner === 'my' ? "You're Right!" : "They're Right!"}
                </span>
              ) : (
                'Ended'
              )
            ) : (
              timeRemaining
            )}
          </span>
        </div>

        <h1 className="text-xl font-bold mb-4">{argument_.title}</h1>

        {/* Both Takes */}
        <div className="space-y-4 mb-4">
          <div className={`p-3 rounded-lg ${hasVoted && votedSide === 'my' ? 'bg-[#22C55E]/10 border border-[#22C55E]/30' : 'bg-[#0F0F0F]'}`}>
            <div className={`text-xs uppercase tracking-wider mb-2 ${hasVoted && votedSide === 'my' ? 'text-[#22C55E]' : 'text-gray-500'}`}>
              My Take
            </div>
            <p className="text-gray-300">{argument_.my_take}</p>
          </div>
          <div className={`p-3 rounded-lg ${hasVoted && votedSide === 'their' ? 'bg-[#EF4444]/10 border border-[#EF4444]/30' : 'bg-[#0F0F0F]'}`}>
            <div className={`text-xs uppercase tracking-wider mb-2 ${hasVoted && votedSide === 'their' ? 'text-[#EF4444]' : 'text-gray-500'}`}>
              Their Take
            </div>
            <p className="text-gray-300">{argument_.their_take}</p>
          </div>
        </div>

        {/* Vote buttons or results */}
        {!hasVoted && !isEnded ? (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => handleVote('my')}
              className="flex-1 py-3 bg-[#22C55E] hover:bg-[#22C55E]/80 rounded-xl font-semibold transition-colors"
            >
              You're Right
            </button>
            <button
              onClick={() => handleVote('their')}
              className="flex-1 py-3 bg-[#EF4444] hover:bg-[#EF4444]/80 rounded-xl font-semibold transition-colors"
            >
              They're Right
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#22C55E]">{myPercentage}% You're Right</span>
              <span className="text-[#EF4444]">{theirPercentage}% They're Right</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-[#2A2A2A]">
              <div
                className="bg-[#22C55E] transition-all duration-500"
                style={{ width: `${myPercentage}%` }}
              />
              <div
                className="bg-[#EF4444] transition-all duration-500"
                style={{ width: `${theirPercentage}%` }}
              />
            </div>
            <div className="text-center text-gray-500 text-xs mt-2">
              {totalVotes} votes
            </div>
          </div>
        )}

        {/* Upvote and meta */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasUpvoted
                ? 'bg-red-500/20 text-red-500'
                : 'bg-[#0F0F0F] text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${hasUpvoted ? 'fill-red-500' : ''}`} />
            <span>{argument_.upvote_count}</span>
          </button>
          {!argument_.is_anonymous && argument_.profiles && (
            <span className="text-sm text-gray-500">@{argument_.profiles.username}</span>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
        <h2 className="font-semibold mb-4">Comments ({comments.length})</h2>

        {/* Comment Input */}
        <form onSubmit={handleComment} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
          />
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className="p-2 bg-[#22C55E] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      @{comment.profiles?.username || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
