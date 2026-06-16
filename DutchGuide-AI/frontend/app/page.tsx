'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ChatWindow from '@/components/ChatWindow'
import Features from '@/components/Features'
import AdminPanel from '@/components/AdminPanel'
import Footer from '@/components/Footer'

export default function HomePage() {
  const [adminOpen, setAdminOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const scrollToChat = () => {
    const chatSection = document.getElementById('chat')
    chatSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Header onOpenAdmin={() => setAdminOpen(true)} />

      <main>
        {/* Hero section */}
        <Hero onStartChat={scrollToChat} />

        {/* Chat interface */}
        <div ref={chatRef} className="py-12 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ask DutchGuide AI
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Powered by GPT-4 + multilingual-e5-large embeddings + ChromaDB
            </p>
          </div>
          <ChatWindow />
        </div>

        {/* Features section */}
        <Features />
      </main>

      <Footer />

      {/* Admin panel modal */}
      <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  )
}
