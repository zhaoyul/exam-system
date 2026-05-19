import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, FileClock, Phone, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

type ApplyType = '回退' | '认定' | '申报' | '删除'
type ApplyStatus = '正在审核' | '审核通过' | '不通过'

interface SpecialItem {
  id: string
  applyType: ApplyType
  planName: string
  currentNode: string
  prevNode: string
  operator: string
  operatorPhone: string
  operateTime: string
  status: ApplyStatus
  deletePhone: string
  deleteCode: string
  deleteReason: string
}

const initialItems: SpecialItem[] = [
  { id: '1', applyType: '回退', planName: '20220324中国同辐股份有限公司第2批认定', currentNode: '考试报名', prevNode: '制定计划', operator: 'hgyfgscs11', operatorPhone: '13801211945', operateTime: '2022-03-24 23:37:07', status: '审核通过', deletePhone: '', deleteCode: '', deleteReason: '' },
]

const typeFilters = ['全部', '认定', '申报', '删除'] as const
const statusFilters: Array<'全部' | '正在审核' | '审核通过' | '不通过'> = ['全部', '正在审核', '审核通过', '不通过']

export default function SpecialPage() {
  const [items, setItems] = useState<SpecialItem[]>(initialItems)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('全部')
  const [statusFilter, setStatusFilter] = useState<'全部' | '正在审核' | '审核通过' | '不通过'>('全部')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<SpecialItem | null>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({
    applyType: '认定' as ApplyType,
    planName: '',
    currentNode: '',
    prevNode: '',
    operator: '',
    operatorPhone: '',
    status: '正在审核' as ApplyStatus,
    deletePhone: '',
    deleteCode: '',
    deleteReason: '',
  })

  const filtered = items.filter(i => {
    const m = !search || i.planName.includes(search)
    const t = typeFilter === '全部' || i.applyType === typeFilter
    const s = statusFilter === '全部' || i.status === statusFilter
    return m && t && s
  })

  const openAdd = () => {
    setForm({ applyType: '认定', planName: '', currentNode: '', prevNode: '', operator: '', operatorPhone: '', status: '正在审核', deletePhone: '', deleteCode: '', deleteReason: '' })
    setShowEdit(null)
    setShowAdd(true)
  }
  const openEdit = (i: SpecialItem) => {
    setForm({ ...i })
    setShowEdit(i)
    setShowAdd(true)
  }
  const handleSave = () => {
    if (!form.planName || !form.currentNode) {
      toast.error('请填写完整信息')
      return
    }
    const now = new Date().toLocaleString('zh-CN', { hour12: false })
    const newItem = { ...form, id: showEdit ? showEdit.id : Date.now().toString(), operateTime: showEdit ? showEdit.operateTime : now }
    if (showEdit) {
      setItems(prev => prev.map(i => i.id === showEdit.id ? newItem : i))
      toast.success('申请已更新')
    } else {
      setItems(prev => [newItem, ...prev])
      toast.success('申请已添加')
    }
    setShowAdd(false)
  }
  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    setShowDelete(null)
    toast.success('申请已删除')
  }
  const approve = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: '审核通过' as ApplyStatus } : i))
    toast.success('审核已通过')
  }
  const reject = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: '不通过' as ApplyStatus } : i))
    toast.success('已驳回')
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileClock className="w-5 h-5 text-[#1A56DB]" />
        <h1 className="text-xl font-bold text-gray-900">申请特办</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="计划名称"
            className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-48 focus:outline-none focus:border-[#1A56DB]"
          />
        </div>
        <div className="flex gap-1">
          {typeFilters.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === t ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]">
          <Plus className="w-4 h-4" /> 添加申请
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">序号</th>
              <th className="px-4 py-3 text-left">申请类型</th>
              <th className="px-4 py-3 text-left">计划名称</th>
              <th className="px-4 py-3 text-left">当前节点</th>
              <th className="px-4 py-3 text-left">上个节点</th>
              <th className="px-4 py-3 text-left">操作人</th>
              <th className="px-4 py-3 text-left">操作人电话</th>
              <th className="px-4 py-3 text-left">操作时间</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((i, idx) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    i.applyType === '回退' ? 'bg-red-50 text-red-700' :
                    i.applyType === '认定' ? 'bg-blue-50 text-blue-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>
                    {i.applyType}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[280px] truncate">{i.planName}</td>
                <td className="px-4 py-3 text-gray-600">{i.currentNode}</td>
                <td className="px-4 py-3 text-gray-600">{i.prevNode}</td>
                <td className="px-4 py-3 text-gray-600 flex items-center gap-1"><UserCircle className="w-3.5 h-3.5 text-gray-400" />{i.operator}</td>
                <td className="px-4 py-3 text-gray-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{i.operatorPhone}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{i.operateTime}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    i.status === '审核通过' ? 'bg-green-50 text-green-700' :
                    i.status === '不通过' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {i.status === '正在审核' && (
                      <>
                        <button onClick={() => approve(i.id)} className="text-xs text-green-600 hover:underline">通过</button>
                        <button onClick={() => reject(i.id)} className="text-xs text-red-600 hover:underline">驳回</button>
                      </>
                    )}
                    <button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{showEdit ? '编辑申请' : '添加申请'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">申请类型</label>
              <select value={form.applyType} onChange={e => setForm({...form, applyType: e.target.value as ApplyType})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm">
                <option>回退</option>
                <option>认定</option>
                <option>申报</option>
                <option>删除</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">计划名称 <span className="text-red-500">*</span></label>
              <input value={form.planName} onChange={e => setForm({...form, planName: e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入计划名称" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">当前节点</label>
                <input value={form.currentNode} onChange={e => setForm({...form, currentNode: e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="如：考试报名" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">上个节点</label>
                <input value={form.prevNode} onChange={e => setForm({...form, prevNode: e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="如：制定计划" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">操作人</label>
                <input value={form.operator} onChange={e => setForm({...form, operator: e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入操作人" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">操作人电话</label>
                <input value={form.operatorPhone} onChange={e => setForm({...form, operatorPhone: e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入电话" />
              </div>
            </div>
            {form.applyType === '删除' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">手机号 <span className="text-red-500">*</span></label>
                  <input value={form.deletePhone} onChange={e => setForm({...form, deletePhone: e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入手机号" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">验证码 <span className="text-red-500">*</span></label>
                    <input value={form.deleteCode} onChange={e => setForm({...form, deleteCode: e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入验证码" />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="h-9 text-xs w-full">获取验证码</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">删除原因 <span className="text-red-500">*</span></label>
                  <textarea value={form.deleteReason} onChange={e => setForm({...form, deleteReason: e.target.value})} className="w-full mt-1 h-16 px-3 py-2 border border-gray-200 rounded-md text-sm" placeholder="请输入删除原因" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">证明文件</label>
                  <div className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 cursor-pointer transition-colors">
                    <div className="text-gray-400 text-xs">点击上传或拖拽文件到此处</div>
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">状态</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as ApplyStatus})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm">
                <option>正在审核</option>
                <option>审核通过</option>
                <option>不通过</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">确定要删除此申请吗？</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button>
            <Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
