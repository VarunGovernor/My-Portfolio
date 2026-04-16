import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { navLinks } from '../../data/content'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )
}

export default function Navbar({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isCaseStudy = location.pathname.startsWith('/case-study')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href) => {
    setMobileOpen(false)
    if (isCaseStudy) return // links handled by router
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 glass border-b border-white/5'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-display font-bold text-xl flex items-center gap-1"
          >
            <span className="gradient-text">V</span>
            <span className={dark ? 'text-white/90' : 'text-slate-800'}>arun</span>
            <span style={{ color: '#7c3aed' }}>.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              isCaseStudy ? (
                <Link
                  key={link.label}
                  to={`/${link.href}`}
                  className="nav-link"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="nav-link"
                >
                  {link.label}
                </button>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-full transition-all duration-300 ${
                dark
                  ? 'text-slate-400 hover:text-yellow-300 hover:bg-white/05'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-violet-50'
              }`}
              aria-label="Toggle dark mode"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* CTA */}
            <button
              onClick={() => handleNavClick('#contact')}
              className="hidden md:inline-flex btn-primary text-xs px-5 py-2.5"
            >
              Hire Me
            </button>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-slate-400"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-4 right-4 z-40 glass rounded-2xl p-6 border border-white/10"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-left text-base font-medium transition-colors ${
                    dark ? 'text-slate-300 hover:text-violet-400' : 'text-slate-600 hover:text-violet-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNavClick('#contact')}
                className="btn-primary justify-center mt-2"
              >
                Hire Me
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
