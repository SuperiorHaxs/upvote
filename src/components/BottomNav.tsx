'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Zap, Plus, Trophy, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/quick-votes', icon: Zap, label: 'Quick' },
    { href: '/post', icon: Plus, label: 'Post', isCenter: true },
    { href: '/leaderboards', icon: Trophy, label: 'Leaders' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] pb-safe z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-gradient-to-r from-[#22C55E] to-[#EF4444] shadow-lg"
              >
                <Icon className="w-7 h-7 text-white" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
