export default function Footer({ dark }) {
  return (
    <footer className={`relative z-10 border-t py-8 px-4 text-center ${dark ? 'border-white/[0.05]' : 'border-violet-100'}`}>
      <p className={`text-sm ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 Varun. Designed &amp; built with intention.
      </p>
    </footer>
  )
}
