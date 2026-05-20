import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageApiEndpoint } from '@/config/pageApiEndpoints'
import { ApiError, getPageSampleData } from '@/lib/api'

type BackendStatus = 'idle' | 'loading' | 'ready' | 'error'

interface BackendDataState {
  endpoint: string
  data: unknown
  status: BackendStatus
  error: string | null
  loadedAt: string | null
}

const initialState: BackendDataState = {
  endpoint: '',
  data: null,
  status: 'idle',
  error: null,
  loadedAt: null,
}

const BackendDataContext = createContext<BackendDataState>(initialState)

export function BackendDataProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const endpoint = useMemo(() => getPageApiEndpoint(location.pathname), [location.pathname])
  const [state, setState] = useState<BackendDataState>({ ...initialState, endpoint })

  useEffect(() => {
    let cancelled = false
    setState(current => ({ ...current, endpoint, status: 'loading', error: null }))

    getPageSampleData(endpoint)
      .then(data => {
        if (!cancelled) {
          setState({
            endpoint,
            data,
            status: 'ready',
            error: null,
            loadedAt: new Date().toISOString(),
          })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof ApiError ? error.message : '后端接口连接失败'
          setState({
            endpoint,
            data: null,
            status: 'error',
            error: message,
            loadedAt: null,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [endpoint])

  return (
    <BackendDataContext.Provider value={state}>
      {children}
    </BackendDataContext.Provider>
  )
}

export function useBackendData<T = unknown>() {
  return useContext(BackendDataContext) as BackendDataState & { data: T | null }
}
