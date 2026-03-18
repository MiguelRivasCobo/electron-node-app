# Node Diagram App

Aplicación de escritorio construida con **React + TypeScript + Electron + MUI + ReactFlow + SQLite**.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Shell de escritorio | Electron 31 |
| UI | React 18 + TypeScript + Material UI v5 |
| Diagrama | ReactFlow v11 |
| Base de datos | SQLite via sql.js (WebAssembly) |
| Testing | Vitest + Testing Library |
| Build | electron-vite + Vite 5 |

---

## Requisitos previos

**Node.js 18 o superior** — https://nodejs.org

No se requieren herramientas de compilación nativas. Se usa **sql.js** (SQLite compilado a WebAssembly) en lugar de módulos nativos, lo que simplifica la instalación en cualquier plataforma sin pasos adicionales.

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar en modo desarrollo
npm run dev
```

Esto lanza Electron + Vite dev server con Hot Reload.

---

## Tests

```bash
npm test
```

Ejecuta los tests unitarios con Vitest. Salida esperada: **5 tests en verde**.

---

## Credenciales de demo

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |

---

## Funcionalidades implementadas

1. **Login básico** — validación con credenciales hardcodeadas, feedback visual de error y estado de carga simulado.

2. **Diagrama de nodos (ReactFlow)** — carga asíncrona desde SQLite al iniciarse la app. Nodo personalizado con imagen y título. Canvas con fondo, controles de zoom y minimapa.

3. **Persistencia de posición** — al arrastrar un nodo, su nueva posición se guarda en SQLite automáticamente.

4. **Panel de propiedades** — al hacer clic en un nodo se abre un Drawer lateral con título, descripción y URL de imagen editables. Los cambios se guardan en SQLite de forma asíncrona y se notifica al usuario con un toast.

5. **CRUD completo de nodos:**
   - **Añadir** — botón en la barra superior crea un nodo nuevo en SQLite y lo añade al canvas con imagen aleatoria.
   - **Eliminar** — botón en el panel de propiedades con diálogo de confirmación; elimina el nodo y sus conexiones de SQLite y del canvas.

6. **Testing** — 5 tests unitarios del componente `Login` con Vitest y Testing Library, cubriendo renderizado, validación, estados de carga y flujo de autenticación.

---

## Decisiones técnicas

**sql.js en lugar de better-sqlite3**  
Se optó por sql.js (SQLite compilado a WebAssembly) para evitar la compilación de módulos nativos de Node.js, que en Windows requiere Visual Studio Build Tools y puede generar fricción en la instalación. sql.js funciona en cualquier entorno sin pasos adicionales, a costa de persistir manualmente el archivo `.db` tras cada escritura.

**contextBridge + IPC estricto**  
Todo acceso a la base de datos ocurre en el proceso principal de Electron. El renderer solo llama a funciones tipadas expuestas mediante `contextBridge`, sin acceso directo a Node.js ni a `ipcRenderer` desde el renderer. Esto sigue las recomendaciones de seguridad de Electron.

**Autenticación simulada**  
El enunciado indica que no es necesaria autenticación real. Las credenciales están hardcodeadas en el componente `Login`. En una aplicación real se integraría con un proveedor de identidad como Keycloak (OAuth2/OIDC) o Auth0, gestionando el flujo de tokens JWT desde el proceso principal de Electron.

---

## Estructura del proyecto

```
src/
├── main/
│   ├── index.ts        # Proceso principal de Electron + handlers IPC
│   └── database.ts     # Operaciones SQLite (init, seed, CRUD)
├── preload/
│   └── index.ts        # Bridge seguro (contextBridge) → expone window.api
├── test/
│   ├── setup.ts        # Setup global de Vitest
│   └── Login.test.tsx  # Tests unitarios del login
└── renderer/
    └── src/
        ├── App.tsx                     # Router Login ↔ Dashboard
        ├── theme.ts                    # Tema oscuro MUI
        ├── types.ts                    # Tipos compartidos + ElectronAPI
        └── components/
            ├── Login.tsx               # Pantalla de login
            ├── CustomNode.tsx          # Nodo personalizado ReactFlow
            ├── NodePropertiesPanel.tsx # Drawer de propiedades + eliminar
            └── Dashboard.tsx          # Canvas principal + AppBar
```

---

## Build para producción

```bash
npm run package
```

Genera el instalador NSIS en `dist/`.
