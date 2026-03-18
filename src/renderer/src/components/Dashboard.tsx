import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Connection,
  addEdge,
  BackgroundVariant,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material'
import { LogoutRounded, Hub, InfoOutlined, AddCircleOutline } from '@mui/icons-material'

import type { NodeRecord, EdgeRecord, FlowNodeData } from '../types'
import CustomNode from './CustomNode'
import NodePropertiesPanel from './NodePropertiesPanel'

// Register custom node type
const nodeTypes: NodeTypes = { customNode: CustomNode }

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps): JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node<FlowNodeData> | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // ── Load data from SQLite via IPC ──────────────────────────────────────
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const [dbNodes, dbEdges] = await Promise.all([
          window.api.getNodes(),
          window.api.getEdges()
        ])

        const rfNodes: Node<FlowNodeData>[] = dbNodes.map((n: NodeRecord) => ({
          id: n.id,
          type: 'customNode',
          position: { x: n.pos_x, y: n.pos_y },
          data: {
            dbId: n.id,
            title: n.title,
            description: n.description,
            imageUrl: n.image_url
          }
        }))

        const rfEdges: Edge[] = dbEdges.map((e: EdgeRecord) => ({
          id: e.id,
          source: e.source_id,
          target: e.target_id,
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        }))

        setNodes(rfNodes)
        setEdges(rfEdges)
      } catch (err) {
        console.error('Error loading diagram data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setNodes, setEdges])

  // ── Node click → open properties panel ────────────────────────────────
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<FlowNodeData>) => {
      setSelectedNode(node)
      setPanelOpen(true)
    },
    []
  )

  // ── Persist position after drag ────────────────────────────────────────
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      window.api.updateNodePosition({ id: node.id, x: node.position.x, y: node.position.y })
    },
    []
  )

  // ── New edge via user drag ─────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  )

  // ── Save node edits (IPC + local state) ───────────────────────────────
  const handleSaveNode = async (
    id: string,
    data: { title: string; description: string; image_url: string }
  ): Promise<void> => {
    await window.api.updateNode({ id, ...data })

    // Update ReactFlow node data
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                title: data.title,
                description: data.description,
                imageUrl: data.image_url
              }
            }
          : n
      )
    )

    // Keep selected node in sync
    setSelectedNode((prev) =>
      prev?.id === id
        ? {
            ...prev,
            data: {
              ...prev.data,
              title: data.title,
              description: data.description,
              imageUrl: data.image_url
            }
          }
        : prev
    )
  }

  // ── Close panel when clicking the canvas background ───────────────────
  const onPaneClick = useCallback(() => {
    setPanelOpen(false)
    setSelectedNode(null)
  }, [])

  // ── Add a new node ─────────────────────────────────────────────────────
  const handleAddNode = useCallback(async (): Promise<void> => {
    const id = `node-${Date.now()}`
    const newNode = {
      id,
      title: 'Nuevo nodo',
      description: '',
      image_url: `https://picsum.photos/seed/${id}/200/200`,
      pos_x: 100 + Math.random() * 400,
      pos_y: 100 + Math.random() * 300
    }
    await window.api.addNode(newNode)
    setNodes((nds) => [
      ...nds,
      {
        id: newNode.id,
        type: 'customNode',
        position: { x: newNode.pos_x, y: newNode.pos_y },
        data: {
          dbId: newNode.id,
          title: newNode.title,
          description: newNode.description,
          imageUrl: newNode.image_url
        }
      }
    ])
  }, [setNodes])

  // ── Delete selected node ───────────────────────────────────────────────
  const handleDeleteNode = useCallback(
    async (id: string): Promise<void> => {
      await window.api.deleteNode(id)
      setNodes((nds) => nds.filter((n) => n.id !== id))
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
      setPanelOpen(false)
      setSelectedNode(null)
    },
    [setNodes, setEdges]
  )

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      {/* ── AppBar ── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1
            }}
          >
            <Hub sx={{ fontSize: 22, color: '#fff' }} />
          </Box>

          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Node Diagram App
          </Typography>

          {!loading && (
            <Chip
              label={`${nodes.length} nodos · ${edges.length} conexiones`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}

          <Tooltip title="Haz clic en un nodo para editar sus propiedades">
            <InfoOutlined sx={{ color: 'text.secondary', cursor: 'help' }} />
          </Tooltip>

          <Button
            color="inherit"
            startIcon={<AddCircleOutline />}
            onClick={handleAddNode}
            variant="outlined"
            size="small"
          >
            Añadir nodo
          </Button>

          <Button
            color="inherit"
            startIcon={<LogoutRounded />}
            onClick={onLogout}
            variant="outlined"
            size="small"
          >
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* ── ReactFlow canvas ── */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            gap={2}
          >
            <CircularProgress color="primary" />
            <Typography color="text.secondary">Cargando diagrama desde SQLite…</Typography>
          </Box>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={2}
            deleteKeyCode="Delete"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="rgba(255,255,255,0.08)"
            />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={() => '#6366f1'}
              maskColor="rgba(15,23,42,0.7)"
              style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            />

            {/* Hint panel */}
            <Panel position="bottom-left">
              <Box
                sx={{
                  bgcolor: 'rgba(30,41,59,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  🖱 Clic en nodo para editar &nbsp;·&nbsp; Arrastra para mover &nbsp;·&nbsp;{' '}
                  <kbd style={{ fontFamily: 'monospace' }}>Del</kbd> para eliminar
                </Typography>
              </Box>
            </Panel>
          </ReactFlow>
        )}
      </Box>

      {/* ── Node properties side panel ── */}
      <NodePropertiesPanel
        open={panelOpen}
        node={selectedNode}
        onClose={() => {
          setPanelOpen(false)
          setSelectedNode(null)
        }}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
      />
    </Box>
  )
}
