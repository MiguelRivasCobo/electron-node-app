import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Login from '../renderer/src/components/Login'

describe('Login', () => {
  it('renderiza el título correctamente', () => {
    render(<Login onLogin={() => {}} />)
    expect(screen.getByText('Node Diagram App')).toBeInTheDocument()
  })

  it('el botón está deshabilitado si los campos están vacíos', () => {
    render(<Login onLogin={() => {}} />)
    const button = screen.getByRole('button', { name: /iniciar sesión/i })
    expect(button).toBeDisabled()
  })

  it('muestra error con credenciales incorrectas', async () => {
    render(<Login onLogin={() => {}} />)

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'wrong' }
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrong123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/credenciales incorrectas/i)
      ).toBeInTheDocument()
    })
  })

  it('llama a onLogin con credenciales correctas', async () => {
    const onLogin = vi.fn()
    render(<Login onLogin={onLogin} />)

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'admin' }
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'admin123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledTimes(1)
    })
  })

  it('el botón muestra "Iniciando sesión…" mientras carga', async () => {
    render(<Login onLogin={() => {}} />)

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'admin' }
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'admin123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
  })
})
