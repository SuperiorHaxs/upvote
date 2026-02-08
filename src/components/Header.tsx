'use client'

import { useState } from 'react'
import { Search, Plus, Bell, User, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Could implement search later
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1A1A1B] border-b border-[#343536] h-12 flex items-center px-4">
      <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto gap-4">
        {/* Left: Logo + Mobile menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1 text-[#D7DADC] hover:bg-[#272729] rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0079D3] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-lg font-bold text-[#D7DADC] hidden sm:block">
              upvote
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[600px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#818384]" />
            <input
              type="text"
              placeholder="Search UpVote"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#272729] border border-[#343536] rounded-full py-1.5 pl-9 pr-4 text-sm text-[#D7DADC] placeholder-[#818384] hover:border-[#4A4A4C] hover:bg-[#222223] focus:bg-[#030303] focus:border-[#0079D3] transition-colors"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {user ? (
            <>
              <Link
                href="/post"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#D7DADC] hover:bg-[#272729] rounded-full border border-[#343536] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#272729] transition-colors ml-1"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0079D3] flex items-center justify-center text-xs font-bold text-white">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs text-[#D7DADC] hidden md:block max-w-[100px] truncate">
                    {profile?.username || 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-[#1A1A1B] border border-[#343536] rounded-lg shadow-xl z-50 py-1 animate-fade-in">
                      <div className="px-3 py-2 border-b border-[#343536]">
                        <p className="text-sm font-medium text-[#D7DADC]">
                          @{profile?.username}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#D7DADC] hover:bg-[#272729] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#D7DADC] hover:bg-[#272729] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth"
              className="px-5 py-1.5 bg-[#0079D3] hover:bg-[#1484D7] text-white text-sm font-semibold rounded-full transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
