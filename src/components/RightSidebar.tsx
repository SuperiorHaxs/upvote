'use client'

import { TrendingUp, Info, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIES } from '@/lib/types'

export default function RightSidebar() {
  const { user, profile } = useAuth()

  return (
    <div className="space-y-4">
      {/* About Community */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-lg overflow-hidden">
        <div className="bg-[#0079D3] h-8" />
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#0079D3] rounded-full flex items-center justify-center -mt-6 border-4 border-[#1A1A1B]">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <h3 className="text-sm font-bold text-[#D7DADC]">UpVote</h3>
          </div>
          <p className="text-xs text-[#818384] mb-3">
            Post real-life arguments. Let the internet decide who's right. Vote, judge, and earn your reputation.
          </p>
          <div className="grid grid-cols-2 gap-2 py-2 border-t border-[#343536] text-center">
            <div>
              <p className="text-sm font-bold text-[#D7DADC]">--</p>
              <p className="text-xs text-[#818384]">Arguments</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#D7DADC]">--</p>
              <p className="text-xs text-[#818384]">Online</p>
            </div>
          </div>
          <Link
            href="/post"
            className="block w-full text-center py-1.5 mt-2 bg-[#0079D3] hover:bg-[#1484D7] text-white text-sm font-semibold rounded-full transition-colors"
          >
            Create Argument
          </Link>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-lg">
        <div className="px-3 py-2.5 border-b border-[#343536]">
          <h3 className="text-xs font-bold text-[#D7DADC] uppercase tracking-wider">
            Popular Topics
          </h3>
        </div>
        <div className="py-1">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat}
              href={`/?category=${cat}`}
              className="flex items-center justify-between px-3 py-2 hover:bg-[#272729] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#818384] w-4">{i + 1}</span>
                <span className="text-sm text-[#D7DADC] group-hover:underline">{cat}</span>
              </div>
              <TrendingUp className="w-3 h-3 text-[#46D160]" />
            </Link>
          ))}
        </div>
      </div>

      {/* User Stats (if logged in) */}
      {user && profile && (
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-lg p-3">
          <h3 className="text-xs font-bold text-[#D7DADC] uppercase tracking-wider mb-3">
            Your Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#818384]">Win Rate</span>
              <span className="text-[#D7DADC] font-medium">
                {profile.wins + profile.losses > 0
                  ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#818384]">Streak</span>
              <span className="text-[#FF4500] font-medium">{profile.current_streak} days 🔥</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#818384]">Judge Score</span>
              <span className="text-[#D7DADC] font-medium">{profile.judge_score}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#818384]">Total Votes</span>
              <span className="text-[#D7DADC] font-medium">{profile.total_votes}</span>
            </div>
          </div>
          <Link
            href="/profile"
            className="block text-center text-xs text-[#0079D3] hover:text-[#1484D7] mt-3 transition-colors"
          >
            View Full Profile →
          </Link>
        </div>
      )}

      {/* Footer Links */}
      <div className="text-xs text-[#818384] px-2 space-y-1">
        <p>UpVote © {new Date().getFullYear()}</p>
        <p>Post arguments. Let the internet decide.</p>
      </div>
    </div>
  )
}
