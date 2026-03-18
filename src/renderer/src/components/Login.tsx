import { useState, KeyboardEvent } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
  Hub
} from '@mui/icons-material'

interface LoginProps {
  onLogin: () => void
}

const VALID_USER = 'admin'
const VALID_PASS = 'admin123'

export default function Login({ onLogin }: LoginProps): JSX.Element {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (): Promise<void> => {
    if (!username.trim() || !password) return
    setError('')
    setLoading(true)

    // Simulate an async authentication call
    await new Promise((resolve) => setTimeout(resolve, 700))

    if (username.trim() === VALID_USER && password === VALID_PASS) {
      onLogin()
    } else {
      setError('Credenciales incorrectas. Usa admin / admin123')
    }

    setLoading(false)
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ bgcolor: 'background.default', px: 2 }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, p: 1 }}>
        <CardContent>
          {/* Logo & title */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3} gap={1}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Hub sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} mt={0.5}>
              Node Diagram App
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Inicia sesión para acceder al diagrama de nodos
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={onKeyDown}
            margin="normal"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle color="action" />
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    size="small"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading || !username.trim() || !password}
            sx={{ mt: 3, height: 48, fontSize: '1rem' }}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Button>

          <Box
            mt={2.5}
            px={2}
            py={1.5}
            sx={{
              bgcolor: 'rgba(99,102,241,0.08)',
              borderRadius: 2,
              border: '1px solid rgba(99,102,241,0.25)'
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Credenciales de demo
            </Typography>
            <Typography
              variant="body2"
              fontFamily="monospace"
              textAlign="center"
              color="primary.main"
              fontWeight={600}
            >
              admin&nbsp;/&nbsp;admin123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
