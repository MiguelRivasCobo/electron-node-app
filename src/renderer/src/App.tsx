import { useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App(): JSX.Element {
  const [authenticated, setAuthenticated] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authenticated ? (
        <Dashboard onLogout={() => setAuthenticated(false)} />
      ) : (
        <Login onLogin={() => setAuthenticated(true)} />
      )}
    </ThemeProvider>
  )
}

export default App
