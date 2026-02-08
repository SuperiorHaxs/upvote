'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, ArrowBigUp, Share2, Send, Check, MessageSquare, Bookmark } from 'lucide-react'
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

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} days ago`
  return `${Math.floor(days / 30)} months ago`
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0079D3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!argument_) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-xl text-[#D7DADC] mb-2">Argument not found</p>
        <Link href="/" className="text-[#0079D3] hover:underline">
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
    <div className="layout-container">
      <div className="main-content">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#0079D3] hover:text-[#1484D7] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>

        {/* Post card */}
        <article className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
          <div className="flex">
            {/* Vote sidebar */}
            <div className="w-10 flex-shrink-0 bg-[#161617] flex flex-col items-center py-3 gap-1">
              <button
                onClick={handleUpvote}
                className={`p-0.5 rounded transition-colors ${
                  hasUpvoted ? 'text-[#FF4500]' : 'text-[#818384] hover:text-[#FF4500]'
                }`}
              >
                <ArrowBigUp className={`w-6 h-6 ${hasUpvoted ? 'fill-[#FF4500]' : ''}`} />
              </button>
              <span className={`text-xs font-bold ${hasUpvoted ? 'text-[#FF4500]' : 'text-[#D7DADC]'}`}>
                {argument_.upvote_count}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 min-w-0">
              {/* Meta */}
              <div className="flex items-center gap-1.5 text-xs text-[#818384] mb-2 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[argument_.category]}`}>
                  {argument_.category}
                </span>
                <span>•</span>
                {!argument_.is_anonymous && argument_.profiles ? (
                  <span>Posted by <span className="text-[#D7DADC]">u/{argument_.profiles.username}</span></span>
                ) : (
                  <span>Posted anonymously</span>
                )}
                <span>•</span>
                <span>{formatTimeAgo(argument_.created_at)}</span>
                <span>•</span>
                <span className={`flex items-center gap-0.5 ${isEnded ? 'text-[#818384]' : 'text-[#0079D3]'}`}>
                  <Clock className="w-3 h-3" />
                  {isEnded ? (
                    argument_.winner ? (
                      <span className={argument_.winner === 'my' ? 'text-[#46D160] font-medium' : 'text-[#EA3C3C] font-medium'}>
                        Verdict: {argument_.winner === 'my' ? "OP is Right" : "They're Right"}
                      </span>
                    ) : (
                      'Ended'
                    )
                  ) : (
                    timeRemaining
                  )}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl font-semibold text-[#D7DADC] mb-4">{argument_.title}</h1>

              {/* Both takes */}
              <div className="space-y-3 mb-4">
                <div className={`p-3 rounded-lg border ${hasVoted && votedSide === 'my' ? 'bg-[#46D160]/10 border-[#46D160]/30' : 'bg-[#272729] border-[#343536]'}`}>
                  <div className={`text-xs uppercase tracking-wider mb-1.5 font-semibold ${hasVoted && votedSide === 'my' ? 'text-[#46D160]' : 'text-[#818384]'}`}>
                    My Take
                  </div>
                  <p className="text-sm text-[#D7DADC] leading-relaxed">{argument_.my_take}</p>
                </div>
                <div className={`p-3 rounded-lg border ${hasVoted && votedSide === 'their' ? 'bg-[#EA3C3C]/10 border-[#EA3C3C]/30' : 'bg-[#272729] border-[#343536]'}`}>
                  <div className={`text-xs uppercase tracking-wider mb-1.5 font-semibold ${hasVoted && votedSide === 'their' ? 'text-[#EA3C3C]' : 'text-[#818384]'}`}>
                    Their Take
                  </div>
                  <p className="text-sm text-[#D7DADC] leading-relaxed">{argument_.their_take}</p>
                </div>
              </div>

              {/* Vote buttons or results */}
              {!hasVoted && !isEnded ? (
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => handleVote('my')}
                    className="flex-1 py-2.5 bg-[#46D160] hover:bg-[#46D160]/80 rounded-md font-semibold text-sm text-white transition-colors"
                  >
                    OP is Right
                  </button>
                  <button
                    onClick={() => handleVote('their')}
                    className="flex-1 py-2.5 bg-[#EA3C3C] hover:bg-[#EA3C3C]/80 rounded-md font-semibold text-sm text-white transition-colors"
                  >
                    They're Right
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#46D160] font-medium">{myPercentage}% OP is Right</span>
                    <span className="text-[#EA3C3C] font-medium">{theirPercentage}% They're Right</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-[#343536]">
                    <div
                      className="bg-[#46D160] transition-all duration-500"
                      style={{ width: `${myPercentage}%` }}
                    />
                    <div
                      className="bg-[#EA3C3C] transition-all duration-500"
                      style={{ width: `${theirPercentage}%` }}
                    />
                  </div>
                  <div className="text-center text-[#818384] text-xs mt-1.5">
                    {totalVotes} votes
                  </div>
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center gap-1 pt-2 border-t border-[#343536] text-[#818384]">
                <span className="flex items-center gap-1 text-xs px-2 py-1.5 rounded hover:bg-[#272729] transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  {comments.length} Comments
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-xs px-2 py-1.5 rounded hover:bg-[#272729] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-[#46D160]" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
                <span className="flex items-center gap-1 text-xs px-2 py-1.5 rounded hover:bg-[#272729] transition-colors cursor-pointer">
                  <Bookmark className="w-4 h-4" />
                  Save
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments section */}
        <div className="bg-[#1A1A1B] border border-[#343536] border-t-0 rounded-b-md p-3">
          {/* Comment Input */}
          <div className="mb-4">
            <p className="text-xs text-[#818384] mb-2">
              Comment as {user ? <span className="text-[#0079D3]">u/{profile?.username}</span> : <Link href="/auth" className="text-[#0079D3] hover:underline">Log in</Link>}
            </p>
            <form onSubmit={handleComment}>
              <textarea
                placeholder="What are your thoughts?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full bg-[#272729] border border-[#343536] rounded-md py-2 px-3 text-sm text-[#D7DADC] placeholder-[#818384] resize-none focus:border-[#0079D3]"
              />
              <div className="flex justify-end mt-1">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-1.5 bg-[#0079D3] hover:bg-[#1484D7] text-white text-xs font-semibold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Comment
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-[#818384] text-center py-6 text-sm">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0079D3] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-[#D7DADC]">
                        u/{comment.profiles?.username || 'Unknown'}
                      </span>
                      <span className="text-xs text-[#818384]">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[#D7DADC] leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar - could add argument-specific sidebar here */}
      <div className="right-sidebar hidden lg:block">
        <div className="sticky top-[68px]">
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-lg p-3">
            <h3 className="text-xs font-bold text-[#D7DADC] uppercase tracking-wider mb-2">About this argument</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#818384]">Status</span>
                <span className={isEnded ? 'text-[#818384]' : 'text-[#46D160]'}>
                  {isEnded ? 'Closed' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#818384]">Total Votes</span>
                <span className="text-[#D7DADC]">{totalVotes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#818384]">Upvotes</span>
                <span className="text-[#D7DADC]">{argument_.upvote_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#818384]">Comments</span>
                <span className="text-[#D7DADC]">{comments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
