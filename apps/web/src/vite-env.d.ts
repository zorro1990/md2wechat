/// <reference types="vite/client" />

declare module '*.md' {
  const content: string
  export default content
}

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

declare module '*.worker.ts' {
  const workerConstructor: {
    new (options?: WorkerOptions): Worker
  }
  export default workerConstructor
}
