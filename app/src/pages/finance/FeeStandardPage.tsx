import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Search, Settings, Save } from 'lucide-react'

interface FeeItem {
  id: string
  professionCode: string
  professionName: string
  level1: number  // 一级/高级技师
  level2: number  // 二级/技师
  level3: number  // 三级/高级工
  level4: number  // 四级/中级工
  level5: number  // 五级/初级工
}

const mockFees: FeeItem[] = [
  { id: '1', professionCode: '4-02-02-01', professionName: '道路客运汽车驾驶员', level1: 0, level2: 0, level3: 0, level4: 300, level5: 200 },
  { id: '2', professionCode: '4-11-01-00', professionName: '抄表核算收费员', level1: 500, level2: 400, level3: 300, level4: 200, level5: 100 },
  { id: '3', professionCode: '6-28-01-01', professionName: '核反应堆运行值班员', level1: 600, level2: 500, level3: 400, level4: 300, level5: 200 },
  { id: '4', professionCode: '6-31-01-01', professionName: '电气试验员', level1: 500, level2: 400, level3: 300, level4: 200, level5: 150 },
  { id: '5', professionCode: '6-31-01-03', professionName: '机械设备检修工', level1: 500, level2: 400, level3: 300, level4: 200, level5: 150 },
  { id: '6', professionCode: '6-31-01-05', professionName: '仪控设备检修工', level1: 500, level2: 400, level3: 300, level4: 200, level5: 150 },
  { id: '7', professionCode: '6-18-01-01', professionName: '焊接工', level1: 400, level2: 350, level3: 300, level4: 200, level5: 150 },
]

export default function FeeStandardPage() {
  const [fees, setFees] = useState<FeeItem[]>(mockFees)
  const [search, setSearch] = useState('')
  const [showSetFee, setShowSetFee] = useState(false)
  const [showBatchSet, setShowBatchSet] = useState(false)
  const [editingItem, setEditingItem] = useState<FeeItem | null>(null)
  const [editingLevel, setEditingLevel] = useState<number>(0)
  const [feeValue, setFeeValue] = useState('')
  const [batchValues, setBatchValues] = useState({ level1: '', level2: '', level3: '', level4: '', level5: '' })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = fees.filter(f => !search || f.professionName.includes(search) || f.professionCode.includes(search))

  const handleOpenSetFee = (item: FeeItem, level: number) => {
    setEditingItem(item)
    setEditingLevel(level)
    const value = level === 1 ? item.level1 : level === 2 ? item.level2 : level === 3 ? item.level3 : level === 4 ? item.level4 : item.level5
    setFeeValue(value > 0 ? String(value) : '')
    setShowSetFee(true)
  }

  const handleSaveFee = () => {
    if (!editingItem) return
    const val = parseInt(feeValue) || 0
    setFees(prev => prev.map(f => {
      if (f.id !== editingItem.id) return f
      const key = `level${editingLevel}` as keyof FeeItem
      return { ...f, [key]: val }
    }))
    setShowSetFee(false)
    toast.success('费用已设置')
  }

  const handleBatchSet = () => {
    if (selectedIds.size === 0) {
      toast.error('请至少选择一条记录')
      return
    }
    setFees(prev => prev.map(f => {
      if (!selectedIds.has(f.id)) return f
      return {
        ...f,
        level1: parseInt(batchValues.level1) || f.level1,
        level2: parseInt(batchValues.level2) || f.level2,
        level3: parseInt(batchValues.level3) || f.level3,
        level4: parseInt(batchValues.level4) || f.level4,
        level5: parseInt(batchValues.level5) || f.level5,
      }
    }))
    setShowBatchSet(false)
    setSelectedIds(new Set())
    setBatchValues({ level1: '', level2: '', level3: '', level4: '', level5: '' })
    toast.success(`已批量设置 ${selectedIds.size} 条记录`)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(f => f.id)))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">收费标准</h1>
        <Button onClick={() => setShowBatchSet(true)} className="bg-[#1A56DB] hover:bg-[#1748B5]">
          <Settings className="w-4 h-4 mr-2" />批量设置
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="职业名称" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {selectedIds.size > 0 && (
          <span className="text-sm text-blue-600">已选择 {selectedIds.size} 条</span>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="rounded" />
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">职业工种</th>
              <th className="px-3 py-3 text-center font-medium text-gray-600">五级/初级工</th>
              <th className="px-3 py-3 text-center font-medium text-gray-600">四级/中级工</th>
              <th className="px-3 py-3 text-center font-medium text-gray-600">三级/高级工</th>
              <th className="px-3 py-3 text-center font-medium text-gray-600">二级/技师</th>
              <th className="px-3 py-3 text-center font-medium text-gray-600">一级/高级技师</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" />
                </td>
                <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                <td className="px-3 py-3 text-gray-900">{item.professionName}</td>
                {[5, 4, 3, 2, 1].map(level => {
                  const val = level === 1 ? item.level1 : level === 2 ? item.level2 : level === 3 ? item.level3 : level === 4 ? item.level4 : item.level5
                  return (
                    <td key={level} className="px-3 py-3 text-center">
                      <button onClick={() => handleOpenSetFee(item, level)} className="text-blue-600 hover:text-blue-800 text-xs">
                        {val > 0 ? `${val}元` : '0元'} <span className="text-blue-500 underline">设定</span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Set Fee Dialog */}
      <Dialog open={showSetFee} onOpenChange={setShowSetFee}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>设置费用</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              职业工种：{editingItem?.professionName}
            </div>
            <div className="text-sm text-gray-600">
              等级：{editingLevel === 1 ? '一级/高级技师' : editingLevel === 2 ? '二级/技师' : editingLevel === 3 ? '三级/高级工' : editingLevel === 4 ? '四级/中级工' : '五级/初级工'}
            </div>
            <div className="space-y-1">
              <Label>费用（元）</Label>
              <Input type="number" value={feeValue} onChange={e => setFeeValue(e.target.value)} placeholder="输入费用金额" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetFee(false)}>取消</Button>
            <Button onClick={handleSaveFee} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Set Dialog */}
      <Dialog open={showBatchSet} onOpenChange={setShowBatchSet}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>批量设置收费标准</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-2">已选择 {selectedIds.size} 条记录</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>五级/初级工（元）</Label><Input type="number" value={batchValues.level5} onChange={e => setBatchValues(p => ({ ...p, level5: e.target.value }))} placeholder="不修改则留空" /></div>
              <div className="space-y-1"><Label>四级/中级工（元）</Label><Input type="number" value={batchValues.level4} onChange={e => setBatchValues(p => ({ ...p, level4: e.target.value }))} placeholder="不修改则留空" /></div>
              <div className="space-y-1"><Label>三级/高级工（元）</Label><Input type="number" value={batchValues.level3} onChange={e => setBatchValues(p => ({ ...p, level3: e.target.value }))} placeholder="不修改则留空" /></div>
              <div className="space-y-1"><Label>二级/技师（元）</Label><Input type="number" value={batchValues.level2} onChange={e => setBatchValues(p => ({ ...p, level2: e.target.value }))} placeholder="不修改则留空" /></div>
              <div className="space-y-1 col-span-2"><Label>一级/高级技师（元）</Label><Input type="number" value={batchValues.level1} onChange={e => setBatchValues(p => ({ ...p, level1: e.target.value }))} placeholder="不修改则留空" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchSet(false)}>取消</Button>
            <Button onClick={handleBatchSet} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />批量设置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
