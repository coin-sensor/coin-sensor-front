declare module 'sockjs-client' {
  interface SockJSOptions {
    server?: string
    transports?: string[]
    sessionId?: number | (() => string)
    headers?: { [key: string]: string }
  }

  class SockJS {
    constructor(url: string, protocols?: string | string[], options?: SockJSOptions)
    
    onopen: ((event: Event) => void) | null
    onmessage: ((event: MessageEvent) => void) | null
    onclose: ((event: CloseEvent) => void) | null
    onerror: ((event: Event) => void) | null
    
    readyState: number
    protocol: string
    url: string
    
    send(data: string): void
    close(code?: number, reason?: string): void
    
    static CONNECTING: number
    static OPEN: number
    static CLOSING: number
    static CLOSED: number
  }

  export = SockJS
}