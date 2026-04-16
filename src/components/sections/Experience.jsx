import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { experience } from '../../data/content'
import ScrollReveal from '../ui/ScrollReveal'

function TimelineItem({ item, index, dark }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-10 pb-12 last:pb-0"
    >
      {/* Vertical line */}
      {index < experience.length - 1 && (
        <div
          className="absolute left-[7px] top-6 bottom-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, rgba(124,58,237,0.4), rgba(124,58,237,0.05))',
          }}
        />
      )}

      {/* Dot */}
      <div
        className="timeline-dot absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-violet-500"
        style={{ background: '#7c3aed' }}
      />

      {/* Content */}
      <div className={`rounded-2xl p-6 ${dark ? 'glass' : 'glass-light'} border ${dark ? 'border-white/5' : 'border-violet-100'} hover:border-violet-500/20 transition-colors duration-300`}>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-display font-semibold text-base leading-tight mb-0.5">
              {item.role}
            </h3>
            <p
              className="text-sm font-medium"
              style={{ color: '#a78bfa' }}
            >
              {item.company}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              dark ? 'bg-white/[0.04] text-slate-500 border border-white/[0.06]' : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            {item.period}
          </span>
        </div>

        <p className={`text-sm leading-relaxed mb-4 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          {item.desc}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Experience({ dark }) {
  return (
    <section id="experience" className="section-wrapper">
      <div className="container-narrow">
        <div className="max-w-2xl">
          <ScrollReveal>
            <span className="section-label">Background</span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2
              className="font-display font-bold leading-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              Experience
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.14}>
            <p className={`mb-14 text-base leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Building systems that replace manual work with intelligent automation —
              across mobile, web, and embedded hardware.
            </p>
          </ScrollReveal>

          <div>
            {experience.map((item, i) => (
              <TimelineItem key={i} item={item} index={i} dark={dark} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
