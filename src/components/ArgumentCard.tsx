'use client'

import Link from 'next/link'
import { Clock, MessageSquare, ArrowBigUp, Users } from 'lucide-react'
import { Argument, CATEGORY_COLORS } from '@/lib/types'

interface ArgumentCardProps {
  argument: Argument
  showVoteCounts?: boolean
}

function getTimeRemaining(endsAt: string): string {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return `${days}d left`
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
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ArgumentCard({ argument, showVoteCounts = true }: ArgumentCardProps) {
  const totalVotes = argument.my_votes + argument.their_votes
  const timeRemaining = getTimeRemaining(argument.ends_at)
  const isEnded = argument.is_closed || timeRemaining === 'Ended'
  const myPct = totalVotes > 0 ? Math.round((argument.my_votes / totalVotes) * 100) : 50
  const theirPct = totalVotes > 0 ? 100 - myPct : 50

  return (
    <Link href={`/argument/${argument.id}`} className="block">
      <article className="bg-[#1A1A1B] border border-[#343536] rounded-md hover:border-[#4A4A4C] transition-colors">
        {/* Vote column + Content */}
        <div className="flex">
          {/* Left vote indicator */}
          <div className="w-10 flex-shrink-0 bg-[#161617] rounded-l-md flex flex-col items-center py-3 gap-1">
            <ArrowBigUp className="w-5 h-5 text-[#818384] hover:text-[#FF4500]" />
            <span className="text-xs font-bold text-[#D7DADC]">{argument.upvote_count}</span>
          </div>

          {/* Main content */}
          <div className="flex-1 p-2 pl-2 min-w-0">
            {/* Meta line */}
            <div className="flex items-center gap-1.5 text-xs text-[#818384] mb-1 flex-wrap">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[argument.category]}`}>
                {argument.category}
              </span>
              <span>•</span>
              {!argument.is_anonymous && argument.profiles ? (
                <span>
                  Posted by <span className="hover:underline">u/{argument.profiles.username}</span>
                </span>
              ) : (
                <span>Posted anonymously</span>
              )}
              <span>•</span>
              <span>{formatTimeAgo(argument.created_at)}</span>
              {!isEnded && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-[#0079D3]">
                    <Clock className="w-3 h-3" />
                    {timeRemaining}
                  </span>
                </>
              )}
              {isEnded && argument.winner && (
                <>
                  <span>•</span>
                  <span className={argument.winner === 'my' ? 'text-[#46D160] font-medium' : 'text-[#EA3C3C] font-medium'}>
                    Verdict: {argument.winner === 'my' ? "OP is Right" : "They're Right"}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold text-[#D7DADC] mb-1.5 leading-snug line-clamp-2">
              {argument.title}
            </h3>

            {/* Vote progress bar */}
            {showVoteCounts && totalVotes > 0 && (
              <div className="mb-2">
                <div className="flex h-1.5 rounded-full overflow-hidden bg-[#343536]">
                  <div
                    className="bg-[#46D160] transition-all duration-300"
                    style={{ width: `${myPct}%` }}
                  />
                  <div
                    className="bg-[#EA3C3C] transition-all duration-300"
                    style={{ width: `${theirPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-0.5 text-[10px]">
                  <span className="text-[#46D160]">{myPct}% My Take</span>
                  <span className="text-[#EA3C3C]">{theirPct}% Their Take</span>
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-3 text-xs text-[#818384]">
              <span className="flex items-center gap-1 hover:bg-[#272729] px-1.5 py-1 rounded transition-colors">
                <Users className="w-3.5 h-3.5" />
                {totalVotes} votes
              </span>
              <span className="flex items-center gap-1 hover:bg-[#272729] px-1.5 py-1 rounded transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                Comments
              </span>
              {isEnded && (
                <span className="flex items-center gap-1 px-1.5 py-1 text-[#818384]">
                  Closed
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
