import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import { Close, Save, BrokenImage, DeleteOutline } from '@mui/icons-material'
import type { Node } from 'reactflow'
import type { FlowNodeData } from '../types'

interface NodePropertiesPanelProps {
  open: boolean
  node: Node<FlowNodeData> | null
  onClose: () => void
  onSave: (
    id: string,
    data: { title: string; description: string; image_url: string }
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

type SnackState = { open: boolean; message: string; severity: 'success' | 'error' }

export default function NodePropertiesPanel({
  open,
  node,
  onClose,
  onSave,
  onDelete
}: NodePropertiesPanelProps): JSX.Element {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [snack, setSnack] = useState<SnackState>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Sync form with selected node
  useEffect(() => {
    if (node) {
      setTitle(node.data.title)
      setDescription(node.data.description)
      setImageUrl(node.data.imageUrl)
      setImgError(false)
    }
  }, [node])

  const handleSave = async (): Promise<void> => {
    if (!node || !title.trim()) return
    setSaving(true)
    try {
      await onSave(node.id, {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim()
      })
      setSnack({ open: true, message: 'Cambios guardados correctamente ✓', severity: 'success' })
    } catch {
      setSnack({ open: true, message: 'Error al guardar los cambios', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: 360, bgcolor: 'background.paper', backgroundImage: 'none' }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
          {/* ── Header ── */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" fontWeight={700}>
              Propiedades del nodo
            </Typography>
            <Tooltip title="Cerrar">
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Tooltip>
          </Box>

          {node && (
            <Typography variant="caption" color="text.secondary" mb={1} fontFamily="monospace">
              ID: {node.id}
            </Typography>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* ── Image preview ── */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3} gap={1}>
            <Avatar
              src={imgError || !imageUrl ? undefined : imageUrl}
              onError={() => setImgError(true)}
              sx={{
                width: 100,
                height: 100,
                border: '3px solid',
                borderColor: 'primary.main',
                fontSize: 40
              }}
            >
              <BrokenImage />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Vista previa de imagen
            </Typography>
          </Box>

          {/* ── Form fields ── */}
          <Box flex={1} display="flex" flexDirection="column" gap={2.5}>
            <TextField
              fullWidth
              label="Título *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!title.trim()}
              helperText={!title.trim() ? 'El título es requerido' : ''}
              size="medium"
            />

            <TextField
              fullWidth
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              size="medium"
              placeholder="Describe el rol de este nodo en la arquitectura…"
            />

            <TextField
              fullWidth
              label="URL de imagen"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setImgError(false)
              }}
              size="medium"
              placeholder="https://ejemplo.com/imagen.png"
              helperText="Introduce una URL válida para cambiar la imagen del nodo"
            />
          </Box>

          {/* ── Action buttons ── */}
          <Box mt={3} display="flex" flexDirection="column" gap={1}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving || !title.trim()}
              sx={{ height: 48 }}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={onClose}
              sx={{ height: 44 }}
            >
              Cancelar
            </Button>
            <Divider sx={{ my: 0.5 }} />
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="large"
              startIcon={<DeleteOutline />}
              onClick={() => setConfirmOpen(true)}
              sx={{ height: 44 }}
            >
              Eliminar nodo
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* ── Toast notification ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>

      {/* ── Confirm delete dialog ── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Eliminar nodo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que quieres eliminar el nodo <strong>{node?.data.title}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              setConfirmOpen(false)
              if (node) await onDelete(node.id)
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
