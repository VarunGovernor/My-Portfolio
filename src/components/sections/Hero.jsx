import { motion } from 'framer-motion'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

const stats = [
  { num: '3+', label: 'Apps in Production' },
  { num: '6+', label: 'Projects Shipped' },
  { num: '2+', label: 'Years Building' },
]

const badges = ['AI · Threat Detection', 'Full Stack · Flutter & React', 'Security Automation']

export default function Hero({ dark }) {
  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center"
      >
        {/* Availability badge */}
        <motion.div variants={item} className="inline-flex items-center gap-2 mb-8">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
            style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              color: '#a78bfa',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{ animation: 'pulse-dot 2.5s ease-in-out infinite' }}
            />
            Available for Projects
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="font-display font-extrabold leading-[1.06] tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}
        >
          I build{' '}
          <span className="gradient-text">AI-powered</span>
          <br />
          cybersecurity systems
          <br />
          that turn raw data into{' '}
          <span className="gradient-text-warm">actionable intelligence.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={item}
          className={`text-lg leading-relaxed max-w-2xl mx-auto mb-4 ${dark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          Full-stack engineer specializing in AI-driven security platforms, intelligent
          automation, and production-grade applications — from concept to App Store.
        </motion.p>

        {/* Badge row */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-2 mb-10">
          {badges.map((b) => (
            <span key={b} className="tag-pill">{b}</span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-4 mb-16">
          <button onClick={scrollToProjects} className="btn-primary">
            View Projects <ArrowIcon />
          </button>
          <button onClick={scrollToContact} className="btn-secondary">
            Contact Me
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={item}
          className="flex justify-center gap-12 flex-wrap"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-display font-extrabold mb-0.5 gradient-text"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                {s.num}
              </div>
              <div className={`text-xs font-medium tracking-wide ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToProjects}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-colors ${
          dark ? 'text-slate-600 hover:text-violet-400' : 'text-slate-400 hover:text-violet-600'
        }`}
      >
        <span className="text-xs tracking-widest font-medium">SCROLL</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown />
        </motion.div>
      </motion.button>
    </section>
  )
}
