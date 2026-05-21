import { useState, type FormEvent } from 'react'
import { Edit3, KeyRound, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

interface ScoreWorker {
  id: string
  name: string
  loginName: string
  password: string
  phone: string
}

const initialWorkers: ScoreWorker[] = [
  { id: 'sw-1', name: '陈建国', loginName: '440301197801011234', password: '123456', phone: '13800138001' },
  { id: 'sw-2', name: '刘秀芳', loginName: '440301198206063456', password: '123456', phone: '13800138002' },
]

const emptyWorker: ScoreWorker = {
  id: '',
  name: '',
  loginName: '',
  password: '123456',
  phone: '',
}

export default function MarkingLeadPage() {
  const [workers, setWorkers] = useBackendListState<ScoreWorker>(initialWorkers)
  const [search, setSearch] = useState('')
  const [editingWorker, setEditingWorker] = useState<ScoreWorker | null>(null)
  const [adding, setAdding] = useState(false)
  const [resetTarget, setResetTarget] = useState<ScoreWorker | null>(null)

  const filtered = workers.filter(worker => !search || worker.name.includes(search))

  const saveWorker = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next = {
      name: String(fd.get('name') || ''),
      loginName: String(fd.get('loginName') || ''),
      password: String(fd.get('password') || '123456'),
      phone: String(fd.get('phone') || ''),
    }
    if (editingWorker) {
      setWorkers(prev => prev.map(item => item.id === editingWorker.id ? { ...item, ...next } : item))
      setEditingWorker(null)
      toast.success('阅卷负责人已更新')
      return
    }
    setWorkers(prev => [{ ...next, id: `sw-${Date.now()}` }, ...prev])
    setAdding(false)
    toast.success('新增阅卷负责人')
  }

  const resetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resetTarget) return
    const fd = new FormData(event.currentTarget)
    const password = String(fd.get('password') || '123456')
    setWorkers(prev => prev.map(item => item.id === resetTarget.id ? { ...item, password } : item))
    setResetTarget(null)
    toast.success('密码已重置')
  }

  const removeWorker = (id: string) => {
    setWorkers(prev => prev.filter(item => item.id !== id))
    toast.success('阅卷负责人已删除')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-0">
          <select className="h-9 rounded-l-md border border-r-0 border-gray-200 bg-white px-3 text-sm text-gray-700">
            <option>姓名</option>
          </select>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="h-9 w-56 border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
          />
          <Button variant="outline" className="h-9 rounded-l-none">搜索</Button>
        </div>
        <Button onClick={() => setAdding(true)} className="bg-[#1A56DB] hover:bg-[#1748B5]">
          <Plus className="mr-2 h-4 w-4" />添加
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-gray-700">
              <tr>
                <th className="w-20 px-4 py-3 text-center font-medium">序号</th>
                <th className="px-4 py-3 text-center font-medium">姓名</th>
                <th className="px-4 py-3 text-center font-medium">登录账号</th>
                <th className="px-4 py-3 text-center font-medium">联系电话</th>
                <th className="w-56 px-4 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((worker, index) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">{worker.name}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-gray-600">{worker.loginName}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{worker.phone}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setEditingWorker(worker)} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-1 inline h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => setResetTarget(worker)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><KeyRound className="mr-1 inline h-3.5 w-3.5" />重置密码</button>
                      <button onClick={() => removeWorker(worker.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <WorkerDialog
        open={adding || !!editingWorker}
        title={editingWorker ? '编辑阅卷负责人' : '新增阅卷负责人'}
        initial={editingWorker || emptyWorker}
        onClose={() => {
          setAdding(false)
          setEditingWorker(null)
        }}
        onSubmit={saveWorker}
      />

      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
          <form onSubmit={resetPassword} className="space-y-3 text-sm">
            <div className="text-gray-500">用户：{resetTarget?.loginName}</div>
            <label className="block">
              <span className="font-medium text-gray-700">新密码：</span>
              <input name="password" required defaultValue="123456" className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>返回</Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkerDialog({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  initial: ScoreWorker
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="姓　　名：" name="name" defaultValue={initial.name} required placeholder="请输入姓名" />
            <Field label="登录账号：" name="loginName" defaultValue={initial.loginName} required placeholder="请输入登录账号" />
            <Field label="联系电话：" name="phone" defaultValue={initial.phone} required placeholder="请输入联系电话" />
            <Field label="密　　码：" name="password" defaultValue={initial.password} required placeholder="请输入密码" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>返回</Button>
            <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, name, defaultValue, required, placeholder }: { label: string; name: string; defaultValue?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700">{label}</span>
      <input name={name} defaultValue={defaultValue || ''} required={required} placeholder={placeholder} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" />
    </label>
  )
}
