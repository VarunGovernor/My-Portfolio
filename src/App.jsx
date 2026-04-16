import { HashRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'

export default function App() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      root.classList.remove('light')
      document.body.style.background = '#080814'
      document.body.style.color = '#f1f5f9'
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      document.body.style.background = '#f5f3ff'
      document.body.style.color = '#0f172a'
    }
  }, [dark])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home dark={dark} setDark={setDark} />} />
        <Route path="/case-study/:id" element={<CaseStudy dark={dark} setDark={setDark} />} />
      </Routes>
    </HashRouter>
  )
}
