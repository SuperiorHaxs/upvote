'use client'

import Link from 'next/link'
import { Clock, Heart, Users } from 'lucide-react'
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

export default function ArgumentCard({ argument, showVoteCounts = true }: ArgumentCardProps) {
  const totalVotes = argument.my_votes + argument.their_votes
  const timeRemaining = getTimeRemaining(argument.ends_at)
  const isEnded = argument.is_closed || timeRemaining === 'Ended'

  return (
    <Link href={`/argument/${argument.id}`}>
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#3A3A3A] transition-colors">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[argument.category]}`}>
            {argument.category}
          </span>
          <span className={`text-xs flex items-center gap-1 ${isEnded ? 'text-gray-500' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            {isEnded ? (
              argument.winner ? (
                <span className={argument.winner === 'my' ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                  {argument.winner === 'my' ? "You're Right!" : "They're Right!"}
                </span>
              ) : (
                'Ended'
              )
            ) : (
              timeRemaining
            )}
          </span>
        </div>

        <h3 className="font-semibold text-white mb-3 line-clamp-2">{argument.title}</h3>

        {showVoteCounts && totalVotes > 0 && (
          <div className="mb-3">
            <div className="flex h-2 rounded-full overflow-hidden bg-[#2A2A2A]">
              <div
                className="bg-[#22C55E] transition-all duration-300"
                style={{ width: `${(argument.my_votes / totalVotes) * 100}%` }}
              />
              <div
                className="bg-[#EF4444] transition-all duration-300"
                style={{ width: `${(argument.their_votes / totalVotes) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalVotes} votes
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {argument.upvote_count}
            </span>
          </div>
          {!argument.is_anonymous && argument.profiles && (
            <span className="text-xs">@{argument.profiles.username}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
