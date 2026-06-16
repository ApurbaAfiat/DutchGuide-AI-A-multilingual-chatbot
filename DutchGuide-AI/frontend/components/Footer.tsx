'use client'

export default function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-10 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex flex-col gap-0.5 w-4">
                <div className="h-1 bg-dutch-red rounded-sm" />
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-sm" />
                <div className="h-1 bg-dutch-blue rounded-sm" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                DutchGuide <span className="text-dutch-red">AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              Your Personal Netherlands Companion. Helping international students,
              migrants, and expats navigate Dutch life.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-500">
              <li><a href="#chat" className="hover:text-dutch-red transition-colors">Start Chatting</a></li>
              <li><a href="#features" className="hover:text-dutch-red transition-colors">Features</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-dutch-red transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Topics Covered</h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-500">
              <li>🚆 Transportation & OV-chipkaart</li>
              <li>🏠 Housing & Student Rooms</li>
              <li>📋 BSN, DigiD & Immigration</li>
              <li>⚕️ Healthcare & Insurance</li>
              <li>🎓 Universities & Student Life</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © 2024 DutchGuide AI. Built with FastAPI + Next.js + ChromaDB.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-600">
            <a href="#" className="hover:text-dutch-red transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-dutch-red transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-dutch-red transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
