import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/content'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import GradientBackground from '../components/ui/GradientBackground'
import ScrollReveal from '../components/ui/ScrollReveal'

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function ArchitectureRow({ layer, detail, dark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-4 p-4 rounded-xl border transition-colors ${
        dark
          ? 'bg-white/[0.03] border-white/[0.05] hover:border-violet-500/20'
          : 'bg-white border-slate-100 hover:border-violet-200'
      }`}
    >
      <div
        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: '#7c3aed' }}
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#a78bfa' }}>
          {layer}
        </p>
        <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{detail}</p>
      </div>
    </motion.div>
  )
}

export default function CaseStudy({ dark, setDark }) {
  const { id } = useParams()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <GradientBackground />
        <Navbar dark={dark} setDark={setDark} />
        <div className="text-center z-10">
          <h1 className="font-display text-3xl font-bold mb-4">Project not found</h1>
          <Link to="/" className="btn-primary inline-flex">Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative ${dark ? '' : 'bg-[#f5f3ff]'}`}>
      <GradientBackground />
      <Navbar dark={dark} setDark={setDark} />

      <main className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <Link
              to="/"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                dark ? 'text-slate-500 hover:text-violet-400' : 'text-slate-400 hover:text-violet-600'
              }`}
            >
              <BackIcon /> Back to Portfolio
            </Link>
          </motion.div>

          {/* Hero block */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: `${project.accentColor}18`,
                  color: project.accentColor,
                  border: `1px solid ${project.accentColor}30`,
                }}
              >
                {project.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  project.status === 'shipped'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                }`}
              >
                {project.status === 'shipped' ? '✓ Shipped' : '⟳ In Progress'}
              </span>
            </div>

            <h1
              className="font-display font-extrabold leading-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              {project.title}
            </h1>
            <p className={`text-lg leading-relaxed max-w-2xl ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              {project.summary}
            </p>
          </motion.div>

          {/* Tech Stack pills */}
          <ScrollReveal>
            <div className={`rounded-2xl p-6 mb-10 border ${dark ? 'glass border-white/[0.06]' : 'glass-light border-violet-100'}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: `${project.accentColor}12`,
                      color: project.accentColor,
                      border: `1px solid ${project.accentColor}25`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Problem / Solution */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <ScrollReveal direction="left">
              <div className={`rounded-2xl p-7 h-full border ${dark ? 'glass border-white/[0.06]' : 'glass-light border-violet-100'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm font-bold">!</div>
                  <h2 className="font-display font-bold text-base">Problem</h2>
                </div>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {project.problem}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className={`rounded-2xl p-7 h-full border ${dark ? 'glass border-white/[0.06]' : 'glass-light border-violet-100'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">→</div>
                  <h2 className="font-display font-bold text-base">Solution</h2>
                </div>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {project.solution}
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Architecture */}
          <ScrollReveal>
            <div className={`rounded-2xl p-7 mb-10 border ${dark ? 'glass border-white/[0.06]' : 'glass-light border-violet-100'}`}>
              <h2 className="font-display font-bold text-lg mb-6">Architecture</h2>
              <div className="space-y-3">
                {project.architecture.map((row, i) => (
                  <ArchitectureRow key={row.layer} layer={row.layer} detail={row.detail} dark={dark} index={i} />
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Challenges / Outcome */}
          <div className="grid md:grid-cols-2 gap-6 mb-14">
            <ScrollReveal direction="left">
              <div className={`rounded-2xl p-7 h-full border ${dark ? 'glass border-white/[0.06]' : 'glass-light border-violet-100'}`}>
                <h2 className="font-display font-bold text-base mb-5">Challenges Faced</h2>
                <ul className="space-y-3">
                  {project.challenges.map((c, i) => (
                    <li key={i} className={`flex gap-3 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        {i + 1}
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className={`rounded-2xl p-7 h-full border ${dark ? 'glass border-white/[0.06]' : 'glass-light border-violet-100'}`}>
                <h2 className="font-display font-bold text-base mb-5">Outcome &amp; Impact</h2>
                <ul className="space-y-3">
                  {project.outcome.map((o, i) => (
                    <li key={i} className={`flex gap-3 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon />
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>

          {/* Nav between projects */}
          <ScrollReveal>
            <div className={`rounded-2xl p-6 border text-center ${dark ? 'glass border-white/[0.06]' : 'glass-light border-violet-100'}`}>
              <p className={`text-sm mb-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                Explore other projects
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {projects
                  .filter((p) => p.id !== project.id)
                  .map((p) => (
                    <Link
                      key={p.id}
                      to={`/case-study/${p.id}`}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        dark
                          ? 'border-white/[0.07] text-slate-400 hover:border-violet-500/40 hover:text-violet-400'
                          : 'border-slate-200 text-slate-500 hover:border-violet-400 hover:text-violet-600'
                      }`}
                    >
                      {p.title}
                    </Link>
                  ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer dark={dark} />
    </div>
  )
}
