'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

type AuthMode = 'signin' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const { user, signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signup' && !username.trim()) {
      setError('Username is required')
      setLoading(false)
      return
    }

    if (mode === 'signup' && username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (mode === 'signin') {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message)
      } else {
        router.push('/')
      }
    } else {
      const { error: signUpError } = await signUp(email, password, username)
      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess('Account created! Please check your email to verify.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-[#22C55E]">Up</span>
          <span className="text-[#EF4444]">Vote</span>
        </h1>
        <p className="text-gray-500">Post arguments. Let the internet decide.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 bg-[#1A1A1A] rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode('signin')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'signin'
              ? 'bg-[#2A2A2A] text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'signup'
              ? 'bg-[#2A2A2A] text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              maxLength={20}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#3A3A3A]"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-500/10 rounded-lg py-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-500 text-sm text-center bg-green-500/10 rounded-lg py-2">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#22C55E] to-[#EF4444] rounded-xl py-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
            </span>
          ) : (
            mode === 'signin' ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[#2A2A2A]" />
        <span className="text-gray-500 text-sm">or</span>
        <div className="flex-1 h-px bg-[#2A2A2A]" />
      </div>

      {/* Google Sign In */}
      <button
        onClick={() => signInWithGoogle()}
        disabled={loading}
        className="w-full bg-white text-black rounded-xl py-3 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <button onClick={() => setMode('signup')} className="text-[#22C55E]">
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button onClick={() => setMode('signin')} className="text-[#22C55E]">
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
