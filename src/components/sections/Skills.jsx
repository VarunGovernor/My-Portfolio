import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { skills } from '../../data/content'
import ScrollReveal from '../ui/ScrollReveal'

const categories = [
  {
    key: 'frontend',
    label: 'Frontend',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    color: '#7c3aed',
    gradient: 'from-violet-500 to-indigo-500',
  },
  {
    key: 'backend',
    label: 'Backend',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
    ),
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    key: 'aiCyber',
    label: 'AI / Cybersecurity',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
  },
]

function SkillBar({ name, level, color, index, parentInView }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs font-semibold" style={{ color }}>{level}%</span>
      </div>
      <div className="skill-bar-track">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          }}
          initial={{ width: 0 }}
          animate={parentInView ? { width: `${level}%` } : { width: 0 }}
          transition={{
            duration: 1.1,
            delay: 0.1 + index * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </div>
  )
}

function CategoryCard({ cat, dark }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const data = skills[cat.key]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className={`gradient-border rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(124,58,237,0.12)] ${
        dark ? 'glass' : 'glass-light'
      }`}
    >
      <div className="p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}88)` }}
          >
            {cat.icon}
          </div>
          <div>
            <h3 className="font-display font-semibold text-base">{cat.label}</h3>
            <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
              {data.length} skills
            </p>
          </div>
        </div>

        {/* Bars */}
        {data.map((skill, i) => (
          <SkillBar
            key={skill.name}
            name={skill.name}
            level={skill.level}
            color={cat.color}
            index={i}
            parentInView={isInView}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function Skills({ dark }) {
  return (
    <section id="skills" className="section-wrapper">
      <div className="container-narrow">
        <ScrollReveal>
          <span className="section-label">Capabilities</span>
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <h2
            className="font-display font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            System-Level{' '}
            <span className="gradient-text">Skills</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.14}>
          <p className={`mb-14 max-w-xl text-base leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Not just languages and frameworks — but how I think about building
            secure, intelligent, production-ready systems.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.key} cat={cat} dark={dark} />
          ))}
        </div>

        {/* Additional tool tags */}
        <ScrollReveal delay={0.1} className="mt-12">
          <div className={`rounded-2xl p-6 ${dark ? 'glass' : 'glass-light'} border ${dark ? 'border-white/5' : 'border-violet-100'}`}>
            <p className={`text-xs font-semibold tracking-widest uppercase mb-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Also working with
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Excel VBA', 'Protocol Buffers', 'BLE / Bluetooth LE', 'Twilio SMS',
                'Google Maps SDK', 'Framer Motion', 'Three.js', 'GSAP',
                'Docker', 'GitHub Actions', 'Dart', 'Kotlin',
              ].map((tool) => (
                <span
                  key={tool}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    dark
                      ? 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:border-violet-500/30 hover:text-violet-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-400 hover:text-violet-600'
                  }`}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
