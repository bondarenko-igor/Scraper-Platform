import { BrowserRouter } from 'react-router-dom'
import { Providers } from '@/app/providers'
import { AppRoutes } from '@/routes'
import { applyTheme, useThemeStore } from '@/store/theme.store'
import { useEffect } from 'react'

function ThemeInit() {
  const mode = useThemeStore((s) => s.mode)
  useEffect(() => {
    applyTheme(mode)
  }, [mode])
  return null
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <ThemeInit />
        <AppRoutes />
      </BrowserRouter>
    </Providers>
  )
}
