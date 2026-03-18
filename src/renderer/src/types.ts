// Shared types between renderer and main process declarations

export interface NodeRecord {
  id: string
  title: string
  description: string
  image_url: string
  pos_x: number
  pos_y: number
}

export interface EdgeRecord {
  id: string
  source_id: string
  target_id: string
}

export interface FlowNodeData {
  dbId: string
  title: string
  description: string
  imageUrl: string
}

export interface ElectronAPI {
  getNodes: () => Promise<NodeRecord[]>
  getEdges: () => Promise<EdgeRecord[]>
  updateNode: (payload: {
    id: string
    title: string
    description: string
    image_url: string
  }) => Promise<{ success: boolean }>
  updateNodePosition: (payload: {
    id: string
    x: number
    y: number
  }) => Promise<{ success: boolean }>
  addNode: (payload: {
    id: string
    title: string
    description: string
    image_url: string
    pos_x: number
    pos_y: number
  }) => Promise<{ success: boolean }>
  deleteNode: (id: string) => Promise<{ success: boolean }>
}
