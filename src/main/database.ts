import initSqlJs from 'sql.js'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// Type of a sql.js Database instance (resolved from our local shim)
type SqlDB = Awaited<ReturnType<typeof initSqlJs>>['Database']['prototype']

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

let db: SqlDB
let dbFilePath: string

export async function initDatabase(): Promise<void> {
  // Read the WASM binary directly to avoid default locateFile issues
  const wasmPath = app.isPackaged
    ? path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'sql.js',
        'dist',
        'sql-wasm.wasm'
      )
    : path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')

  const wasmBinary = fs.readFileSync(wasmPath)
  const SQL = await initSqlJs({ wasmBinary })

  const userDataPath = app.getPath('userData')
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  dbFilePath = path.join(userDataPath, 'nodes.db')

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
    createTables()
    seedData()
    persistDb()
  }
}

function persistDb(): void {
  const data = db.export()
  fs.writeFileSync(dbFilePath, Buffer.from(data))
}

function createTables(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS nodes (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT DEFAULT '',
      image_url   TEXT DEFAULT '',
      pos_x       REAL DEFAULT 100,
      pos_y       REAL DEFAULT 100,
      created_at  INTEGER DEFAULT (strftime('%s','now')),
      updated_at  INTEGER DEFAULT (strftime('%s','now'))
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS edges (
      id        TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL
    )
  `)
}

function seedData(): void {
  const seedNodes = [
    {
      id: 'node-1',
      title: 'API Gateway',
      description:
        'Punto de entrada para todas las solicitudes de clientes. Enruta el tráfico a los servicios correspondientes.',
      image_url: 'https://picsum.photos/seed/gateway/200/200',
      x: 350, y: 50
    },
    {
      id: 'node-2',
      title: 'Web Server',
      description: 'Gestiona las peticiones HTTP y sirve la aplicación principal.',
      image_url: 'https://picsum.photos/seed/webserver/200/200',
      x: 350, y: 230
    },
    {
      id: 'node-3',
      title: 'Base de Datos',
      description: 'Almacenamiento principal de datos. PostgreSQL para persistencia relacional.',
      image_url: 'https://picsum.photos/seed/database/200/200',
      x: 100, y: 420
    },
    {
      id: 'node-4',
      title: 'Cache Layer',
      description: 'Capa de caché basada en Redis para mejorar el rendimiento.',
      image_url: 'https://picsum.photos/seed/cache/200/200',
      x: 350, y: 420
    },
    {
      id: 'node-5',
      title: 'Message Queue',
      description: 'Cola de mensajes con RabbitMQ para procesamiento asíncrono entre servicios.',
      image_url: 'https://picsum.photos/seed/queue/200/200',
      x: 600, y: 420
    },
    {
      id: 'node-6',
      title: 'Auth Service',
      description: 'Servicio de autenticación y autorización con JWT tokens.',
      image_url: 'https://picsum.photos/seed/auth/200/200',
      x: 600, y: 590
    }
  ]

  const seedEdges = [
    { id: 'edge-1', source: 'node-1', target: 'node-2' },
    { id: 'edge-2', source: 'node-2', target: 'node-3' },
    { id: 'edge-3', source: 'node-2', target: 'node-4' },
    { id: 'edge-4', source: 'node-2', target: 'node-5' },
    { id: 'edge-5', source: 'node-5', target: 'node-6' }
  ]

  for (const n of seedNodes) {
    db.run(
      `INSERT INTO nodes (id, title, description, image_url, pos_x, pos_y)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [n.id, n.title, n.description, n.image_url, n.x, n.y]
    )
  }

  for (const e of seedEdges) {
    db.run(`INSERT INTO edges (id, source_id, target_id) VALUES (?, ?, ?)`, [
      e.id, e.source, e.target
    ])
  }
}

export function getNodes(): NodeRecord[] {
  const stmt = db.prepare('SELECT * FROM nodes ORDER BY created_at ASC')
  const rows: NodeRecord[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as NodeRecord)
  }
  stmt.free()
  return rows
}

export function getEdges(): EdgeRecord[] {
  const stmt = db.prepare('SELECT * FROM edges')
  const rows: EdgeRecord[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as EdgeRecord)
  }
  stmt.free()
  return rows
}

export function updateNode(
  id: string,
  title: string,
  description: string,
  image_url: string
): boolean {
  db.run(
    `UPDATE nodes
     SET title = ?, description = ?, image_url = ?, updated_at = strftime('%s','now')
     WHERE id = ?`,
    [title, description, image_url, id]
  )
  persistDb()
  return true
}

export function updateNodePosition(id: string, x: number, y: number): boolean {
  db.run(
    `UPDATE nodes
     SET pos_x = ?, pos_y = ?, updated_at = strftime('%s','now')
     WHERE id = ?`,
    [x, y, id]
  )
  persistDb()
  return true
}

export function addNode(node: NodeRecord): boolean {
  db.run(
    `INSERT INTO nodes (id, title, description, image_url, pos_x, pos_y)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [node.id, node.title, node.description, node.image_url, node.pos_x, node.pos_y]
  )
  persistDb()
  return true
}

export function deleteNode(id: string): boolean {
  db.run(`DELETE FROM nodes WHERE id = ?`, [id])
  db.run(`DELETE FROM edges WHERE source_id = ? OR target_id = ?`, [id, id])
  persistDb()
  return true
}

