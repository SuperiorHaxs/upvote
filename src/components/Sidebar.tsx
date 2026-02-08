'use client'

import { Home, Flame, Compass, Zap, Trophy, PenSquare, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CATEGORIES, Category, CATEGORY_COLORS } from '@/lib/types'

const CATEGORY_ICONS: Record<string, string> = {
  Relationships: '💕',
  Roommates: '🏠',
  Food: '🍕',
  Work: '💼',
  Family: '👨‍👩‍👧‍👦',
  Money: '💰',
  Gaming: '🎮',
  Random: '🎲',
}

const mainLinks = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/?sort=hot', icon: Flame, label: 'Popular' },
  { href: '/quick-votes', icon: Zap, label: 'Quick Votes' },
  { href: '/leaderboards', icon: Trophy, label: 'Leaderboards' },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-12 left-0 bottom-0 w-[270px] bg-[#030303] border-r border-[#343536] z-40 overflow-y-auto hide-scrollbar transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-3 px-3">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {mainLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#272729] text-[#D7DADC]'
                      : 'text-[#D7DADC] hover:bg-[#1A1A1B]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#0079D3]' : ''}`} />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#343536] my-3" />

          {/* Categories */}
          <div>
            <button
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-[#818384] uppercase tracking-wider hover:text-[#D7DADC] transition-colors"
            >
              Topics
              {categoriesExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {categoriesExpanded && (
              <div className="space-y-0.5 mt-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/?category=${cat}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#D7DADC] hover:bg-[#1A1A1B] transition-colors"
                  >
                    <span className="text-base">{CATEGORY_ICONS[cat] || '📁'}</span>
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#343536] my-3" />

          {/* Resources */}
          <div className="space-y-0.5">
            <Link
              href="/post"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#D7DADC] hover:bg-[#1A1A1B] transition-colors"
            >
              <PenSquare className="w-5 h-5" />
              Create Argument
            </Link>
          </div>

          {/* Spacer for bottom padding */}
          <div className="h-6" />
        </div>
      </nav>
    </>
  )
}
