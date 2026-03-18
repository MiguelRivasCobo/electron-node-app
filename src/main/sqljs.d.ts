// Type shim for sql.js (package doesn't expose "types" in its exports map)
declare module 'sql.js' {
  interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }

  interface Statement {
    step(): boolean
    getAsObject(params?: Record<string, unknown>): Record<string, unknown>
    bind(params?: unknown[]): boolean
    reset(): void
    free(): boolean
  }

  interface Database {
    run(sql: string, params?: unknown[]): Database
    exec(sql: string): QueryExecResult[]
    prepare(sql: string): Statement
    export(): Uint8Array
    close(): void
    getRowsModified(): number
  }

  interface SqlJsStatic {
    Database: {
      new (data?: ArrayLike<number> | Buffer | null): Database
    }
  }

  interface SqlJsConfig {
    wasmBinary?: ArrayLike<number> | ArrayBuffer
    locateFile?: (filename: string, prefix: string) => string
  }

  function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>
  export = initSqlJs
}
