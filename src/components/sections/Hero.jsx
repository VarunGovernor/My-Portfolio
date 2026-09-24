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
          automation, and production-grade applications, from concept to App Store.
        </motion.p>

        {/* Badge row */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-2 mb-10">
          {badges.map((b) => (
            <span key={b} className="tag-pill">{b}</span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-wrap justify-center items-center gap-4 mb-16">
          <button onClick={scrollToProjects} className="btn-primary">
            View Projects <ArrowIcon />
          </button>
          <a
            href="https://github.com/VarunGovernor"
            target="_blank"
            rel="noopener noreferrer"
            className="uiverse-github-btn"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              height="22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z" />
            </svg>
            <span>GitHub</span>
          </a>
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
