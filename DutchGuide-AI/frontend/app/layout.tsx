import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'DutchGuide AI — Your Personal Netherlands Companion',
  description:
    'AI-powered multilingual chatbot helping international students, migrants, travelers, and expats understand life in the Netherlands. Available in English, Dutch, Bengali, and Hindi.',
  keywords: [
    'Netherlands', 'Holland', 'expat guide', 'student housing', 'BSN', 'OV-chipkaart',
    'Dutch culture', 'multilingual AI', 'RAG chatbot', 'Amsterdam', 'Leiden University',
  ],
  openGraph: {
    title: 'DutchGuide AI',
    description: 'Your Personal Netherlands Companion',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
