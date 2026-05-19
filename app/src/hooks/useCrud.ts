import { useState, useCallback } from 'react'

export function useCrud<T extends { id: string }>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<T | null>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  const filtered = items.filter((item: any) => {
    if (!search) return true
    const values = Object.values(item).join(' ').toLowerCase()
    return values.includes(search.toLowerCase())
  })

  const openAdd = useCallback(() => {
    setForm({})
    setShowAdd(true)
  }, [])

  const closeAdd = useCallback(() => setShowAdd(false), [])
  const closeEdit = useCallback(() => setShowEdit(null), [])
  const closeDelete = useCallback(() => setShowDelete(null), [])

  const handleAdd = useCallback((newItem: T) => {
    setItems(prev => [newItem, ...prev])
    setShowAdd(false)
    setForm({})
  }, [])

  const handleUpdate = useCallback((updated: T) => {
    setItems(prev => prev.map(item => item.id === updated.id ? updated : item))
    setShowEdit(null)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    setShowDelete(null)
  }, [])

  const updateField = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  return {
    items, setItems, filtered,
    search, setSearch,
    showAdd, setShowAdd, openAdd, closeAdd,
    showEdit, setShowEdit, closeEdit,
    showDelete, setShowDelete, closeDelete,
    form, setForm, updateField,
    handleAdd, handleUpdate, handleDelete,
  }
}

export function useConfirm() {
  const [show, setShow] = useState(false)
  const [title, setTitle] = useState('确认操作')
  const [message, setMessage] = useState('')
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {})

  const confirm = useCallback((title: string, message: string, onOk: () => void) => {
    setTitle(title)
    setMessage(message)
    setOnConfirm(() => onOk)
    setShow(true)
  }, [])

  const close = useCallback(() => setShow(false), [])

  const doConfirm = useCallback(() => {
    onConfirm()
    setShow(false)
  }, [onConfirm])

  return { show, title, message, confirm, close, doConfirm }
}
