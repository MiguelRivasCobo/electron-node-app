import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getNodes: () => ipcRenderer.invoke('db:get-nodes'),

  getEdges: () => ipcRenderer.invoke('db:get-edges'),

  updateNode: (payload: {
    id: string
    title: string
    description: string
    image_url: string
  }) => ipcRenderer.invoke('db:update-node', payload),

  updateNodePosition: (payload: { id: string; x: number; y: number }) =>
    ipcRenderer.invoke('db:update-node-position', payload),

  addNode: (payload: {
    id: string
    title: string
    description: string
    image_url: string
    pos_x: number
    pos_y: number
  }) => ipcRenderer.invoke('db:add-node', payload),

  deleteNode: (id: string) => ipcRenderer.invoke('db:delete-node', id)
})
