import { getOrCreateUUID } from './uuid'

// 전역 fetch 함수 오버라이드
export function setupGlobalFetch(): void {
  const originalFetch = window.fetch
  
  window.fetch = function(url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> {
    const uuid = getOrCreateUUID()
    
    const newOptions: RequestInit = {
      ...options,
      headers: {
        'UUID': uuid,
        ...options.headers
      }
    }
    
    return originalFetch.call(this, url, newOptions)
  }
}