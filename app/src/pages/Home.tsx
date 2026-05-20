import { useState } from 'react'
import '../App.css'
import { useBackendData } from '@/context/BackendDataContext'

export default function Home() {
  const backend = useBackendData<{ items?: Array<{ name?: string }> }>()
  const [count, setCount] = useState(0)
  const title = backend.data?.items?.[0]?.name || '职业技能等级认定系统'

  return (
    <>
      <h1>{title}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}
