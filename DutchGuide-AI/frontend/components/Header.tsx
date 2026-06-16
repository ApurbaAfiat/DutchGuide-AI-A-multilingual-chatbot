'use client'

import { Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onOpenAdmin?: () => void
}

export default function Header({ onOpenAdmin }: HeaderProps) {
  const { isDark, toggle } = useDarkMode()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          {/* Dutch flag accent */}
          <div className="flex flex-col gap-0.5 w-5">
            <div className="h-1 bg-dutch-red rounded-sm" />
            <div className="h-1 bg-gray-100 dark:bg-white rounded-sm" />
            <div className="h-1 bg-dutch-blue rounded-sm" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-dutch-red transition-colors">
            DutchGuide <span className="text-dutch-red">AI</span>
          </span>
        </a>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
          <a href="#chat" className="hover:text-dutch-red dark:hover:text-dutch-red-light transition-colors">
            Chat
          </a>
          <a href="#features" className="hover:text-dutch-red dark:hover:text-dutch-red-light transition-colors">
            Features
          </a>
          <button
            onClick={onOpenAdmin}
            className="hover:text-dutch-red dark:hover:text-dutch-red-light transition-colors"
          >
            Admin
          </button>
          <a href="#about" className="hover:text-dutch-red dark:hover:text-dutch-red-light transition-colors">
            About
          </a>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className={cn(
              'p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            )}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          <a href="#chat" onClick={() => setMenuOpen(false)} className="hover:text-dutch-red transition-colors py-1">Chat</a>
          <a href="#features" onClick={() => setMenuOpen(false)} className="hover:text-dutch-red transition-colors py-1">Features</a>
          <button onClick={() => { onOpenAdmin?.(); setMenuOpen(false) }} className="text-left hover:text-dutch-red transition-colors py-1">Admin</button>
          <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-dutch-red transition-colors py-1">About</a>
        </div>
      )}
    </header>
  )
}
