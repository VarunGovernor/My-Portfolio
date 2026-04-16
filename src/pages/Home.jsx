import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import GradientBackground from '../components/ui/GradientBackground'
import Hero from '../components/sections/Hero'
import Projects from '../components/sections/Projects'
import Skills from '../components/sections/Skills'
import Experience from '../components/sections/Experience'
import Contact from '../components/sections/Contact'

export default function Home({ dark, setDark }) {
  return (
    <div className={`min-h-screen relative ${dark ? '' : 'bg-[#f5f3ff]'}`}>
      <GradientBackground />
      <Navbar dark={dark} setDark={setDark} />
      <main>
        <Hero dark={dark} />
        <Projects dark={dark} />
        <Skills dark={dark} />
        <Experience dark={dark} />
        <Contact dark={dark} />
      </main>
      <Footer dark={dark} />
    </div>
  )
}
