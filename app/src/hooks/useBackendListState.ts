import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { useBackendData } from '@/context/BackendDataContext'
import { apiRequest } from '@/lib/api'

type ApiListPayload<T> = {
  items?: T[]
}

function listFromPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as ApiListPayload<T>).items)) {
    return (payload as ApiListPayload<T>).items || []
  }
  return []
}

function mergeWithTemplate<T>(items: T[], template: T[]) {
  if (!items.length) return template
  const firstTemplate = template[0]
  if (!firstTemplate || typeof firstTemplate !== 'object') return items
  const templateStatuses = new Set(
    template
      .map(item => (item && typeof item === 'object' ? (item as { status?: unknown }).status : undefined))
      .filter((status): status is string => typeof status === 'string'),
  )
  return items.map((item, index) => {
    const currentTemplate = template[index] || firstTemplate
    if (!item || typeof item !== 'object') return item
    const merged = { ...currentTemplate, ...item } as T & { status?: string }
    const incomingStatus = (item as { status?: unknown }).status
    const fallbackStatus = (currentTemplate as { status?: unknown }).status
    if (
      typeof incomingStatus === 'string'
      && typeof fallbackStatus === 'string'
      && templateStatuses.size > 0
      && !templateStatuses.has(incomingStatus)
    ) {
      merged.status = fallbackStatus
    }
    return merged as T
  })
}

function itemId(item: unknown) {
  if (!item || typeof item !== 'object') return null
  const id = (item as { id?: string | number }).id
  return id === undefined || id === null ? null : String(id)
}

function changed(prev: unknown, next: unknown) {
  return JSON.stringify(prev) !== JSON.stringify(next)
}

export function useBackendResourceList<T>(endpoint: string, initialItems: T[]): T[] {
  const templateRef = useRef(initialItems)
  const [items, setItems] = useState<T[]>(initialItems)

  useEffect(() => {
    let cancelled = false
    apiRequest<ApiListPayload<T> | T[]>(endpoint)
      .then(data => {
        if (!cancelled) {
          setItems(mergeWithTemplate(listFromPayload<T>(data), templateRef.current))
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [endpoint])

  return items
}

export function useBackendResourceState<T>(
  endpoint: string,
  initialItems: T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const templateRef = useRef(initialItems)
  const hydratingRef = useRef(false)
  const [items, setRawItems] = useState<T[]>(initialItems)

  const syncChanges = useCallback((previous: T[], next: T[]) => {
    const previousById = new Map<string, T>()
    const nextById = new Map<string, T>()

    previous.forEach(item => {
      const id = itemId(item)
      if (id) previousById.set(id, item)
    })
    next.forEach(item => {
      const id = itemId(item)
      if (id) nextById.set(id, item)
    })

    nextById.forEach((nextItem, id) => {
      const previousItem = previousById.get(id)
      if (!previousItem) {
        void apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(nextItem),
        }).catch(() => undefined)
        return
      }
      if (changed(previousItem, nextItem)) {
        void apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify(nextItem),
        }).catch(() => undefined)
      }
    })

    previousById.forEach((_previousItem, id) => {
      if (!nextById.has(id)) {
        void apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        }).catch(() => undefined)
      }
    })
  }, [endpoint])

  const setItems: Dispatch<SetStateAction<T[]>> = useCallback((value) => {
    setRawItems(previous => {
      const next = typeof value === 'function'
        ? (value as (previous: T[]) => T[])(previous)
        : value
      if (!hydratingRef.current) {
        syncChanges(previous, next)
      }
      return next
    })
  }, [syncChanges])

  useEffect(() => {
    let cancelled = false
    hydratingRef.current = true
    apiRequest<ApiListPayload<T> | T[]>(endpoint)
      .then(data => {
        if (!cancelled) {
          setRawItems(mergeWithTemplate(listFromPayload<T>(data), templateRef.current))
        }
      })
      .catch(() => undefined)
      .finally(() => {
        queueMicrotask(() => {
          if (!cancelled) hydratingRef.current = false
        })
      })

    return () => {
      cancelled = true
    }
  }, [endpoint])

  return [items, setItems]
}

export function useBackendListState<T>(
  initialItems: T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const backend = useBackendData<ApiListPayload<T> | T[]>()
  const templateRef = useRef(initialItems)
  const hydratingRef = useRef(false)
  const [items, setRawItems] = useState<T[]>(initialItems)

  const syncChanges = useCallback((previous: T[], next: T[]) => {
    if (!backend.endpoint || backend.status !== 'ready') return

    const previousById = new Map<string, T>()
    const nextById = new Map<string, T>()

    previous.forEach(item => {
      const id = itemId(item)
      if (id) previousById.set(id, item)
    })
    next.forEach(item => {
      const id = itemId(item)
      if (id) nextById.set(id, item)
    })

    nextById.forEach((nextItem, id) => {
      if (!id) return
      const previousItem = previousById.get(id)
      if (!previousItem) {
        void apiRequest(backend.endpoint, {
          method: 'POST',
          body: JSON.stringify(nextItem),
        }).catch(() => undefined)
        return
      }
      if (changed(previousItem, nextItem)) {
        void apiRequest(`${backend.endpoint}/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify(nextItem),
        }).catch(() => undefined)
      }
    })

    previousById.forEach((_previousItem, id) => {
      if (id && !nextById.has(id)) {
        void apiRequest(`${backend.endpoint}/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        }).catch(() => undefined)
      }
    })
  }, [backend.endpoint, backend.status])

  const setItems: Dispatch<SetStateAction<T[]>> = useCallback((value) => {
    setRawItems(previous => {
      const next = typeof value === 'function'
        ? (value as (previous: T[]) => T[])(previous)
        : value
      if (!hydratingRef.current) {
        syncChanges(previous, next)
      }
      return next
    })
  }, [syncChanges])

  useEffect(() => {
    if (backend.status !== 'ready') return
    const backendItems = listFromPayload<T>(backend.data)
    hydratingRef.current = true
    setRawItems(mergeWithTemplate(backendItems, templateRef.current))
    queueMicrotask(() => {
      hydratingRef.current = false
    })
  }, [backend.data, backend.status])

  return [items, setItems]
}
