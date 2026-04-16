import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { projects } from '../../data/content'
import ScrollReveal from '../ui/ScrollReveal'

function StatusBadge({ status }) {
  if (status === 'shipped') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Shipped
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{
        background: 'rgba(124,58,237,0.1)',
        color: '#a78bfa',
        borderColor: 'rgba(124,58,237,0.2)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-violet-400"
        style={{ animation: 'pulse-dot 2.5s ease-in-out infinite' }}
      />
      In Progress
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
    </svg>
  )
}

function ProjectCard({ project, dark, index }) {
  return (
    <ScrollReveal delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`gradient-border rounded-2xl h-full transition-shadow duration-400 hover:shadow-[0_0_50px_rgba(124,58,237,0.1)] ${
          dark ? 'glass' : 'glass-light'
        }`}
      >
        <div className="p-7 flex flex-col h-full">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}88)` }}
            >
              {project.title[0]}
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Category label */}
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: project.accentColor }}
          >
            {project.category}
          </p>

          {/* Title */}
          <h3 className="font-display font-bold text-lg leading-tight mb-2">
            {project.title}
          </h3>
          <p className={`text-sm leading-relaxed mb-5 flex-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            {project.summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  dark
                    ? 'bg-white/[0.04] text-slate-400 border-white/[0.07]'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            to={`/case-study/${project.id}`}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
              dark ? 'text-slate-400 hover:text-violet-400' : 'text-slate-500 hover:text-violet-600'
            }`}
          >
            View Case Study <ArrowIcon />
          </Link>
        </div>
      </motion.div>
    </ScrollReveal>
  )
}

export default function Projects({ dark }) {
  const shipped = projects.filter((p) => p.status === 'shipped')
  const ongoing = projects.filter((p) => p.status === 'ongoing')

  return (
    <section id="projects" className="section-wrapper">
      <div className="container-narrow">
        <ScrollReveal>
          <span className="section-label">Featured Work</span>
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <h2
            className="font-display font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            Case Studies
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.14}>
          <p className={`mb-14 max-w-xl text-base leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Production systems designed to solve real problems — built end-to-end,
            shipped to users, and validated with results.
          </p>
        </ScrollReveal>

        {/* Shipped */}
        <ScrollReveal>
          <p className={`text-xs font-semibold tracking-widest uppercase mb-6 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Shipped to Production
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {shipped.map((p, i) => (
            <ProjectCard key={p.id} project={p} dark={dark} index={i} />
          ))}
        </div>

        {/* Ongoing */}
        <ScrollReveal>
          <p className={`text-xs font-semibold tracking-widest uppercase mb-6 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Currently Building
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ongoing.map((p, i) => (
            <ProjectCard key={p.id} project={p} dark={dark} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
