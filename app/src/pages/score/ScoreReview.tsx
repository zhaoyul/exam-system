import { useState } from 'react'
import { Search, CheckCircle, XCircle, Eye, Settings2, Users, Percent } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type AuditMode = '必查' | '抽查' | '组合'
type AuditStatus = 'pending' | 'approved' | 'rejected'

const scores = [
  { id: '1', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', theory: 85, practical: 88, total: 86.8, status: 'pending' as AuditStatus },
  { id: '2', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', theory: 78, practical: 82, total: 80.4, status: 'pending' as AuditStatus },
  { id: '3', name: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级', theory: 92, practical: 90, total: 90.8, status: 'approved' as AuditStatus },
  { id: '4', name: '赵六', idCard: '440301199004044567', occupation: '仪控设备检修工', level: '二级', theory: 65, practical: 70, total: 68.0, status: 'pending' as AuditStatus },
  { id: '5', name: '孙七', idCard: '440301199005055678', occupation: '焊接工', level: '五级', theory: 88, practical: 85, total: 86.2, status: 'pending' as AuditStatus },
]

export default function ScoreReview() {
  const [items, setItems] = useState(scores)
  const [search, setSearch] = useState('')
  const [viewItem, setViewItem] = useState<any>(null)
  const [showAuditConfig, setShowAuditConfig] = useState(false)
  const [auditMode, setAuditMode] = useState<AuditMode>('必查')
  const [auditPercent, setAuditPercent] = useState(30)
  const [auditConfigSet, setAuditConfigSet] = useState(false)

  const filtered = items.filter(i => !search || i.name.includes(search) || i.idCard.includes(search))

  const approve = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'approved' as AuditStatus } : i))
    toast.success('审核通过')
  }
  const reject = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'rejected' as AuditStatus } : i))
    toast.success('已退回修改')
  }
  const saveAuditConfig = () => {
    setAuditConfigSet(true)
    setShowAuditConfig(false)
    toast.success(`审核模式已设置为：${auditMode}${auditMode === '抽查' ? ` (${auditPercent}%)` : ''}`)
  }

  const statusCount = {
    pending: items.filter(i => i.status === 'pending').length,
    approved: items.filter(i => i.status === 'approved').length,
    rejected: items.filter(i => i.status === 'rejected').length,
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">成绩审核</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-500">{statusCount.pending}</div>
          <div className="text-sm text-gray-500 mt-1">待复核</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{statusCount.approved}</div>
          <div className="text-sm text-gray-500 mt-1">已通过</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{statusCount.rejected}</div>
          <div className="text-sm text-gray-500 mt-1">已退回</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1A56DB]">{items.length}</div>
          <div className="text-sm text-gray-500 mt-1">总人数</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考生..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" />
          </div>
          {auditConfigSet && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
              模式: {auditMode}{auditMode === '抽查' ? ` (${auditPercent}%)` : ''}
            </span>
          )}
        </div>
        <Button onClick={() => setShowAuditConfig(true)} variant="outline" className="h-9 text-sm">
          <Settings2 className="w-4 h-4 mr-1" /> 审核配置
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">姓名</th>
              <th className="px-4 py-3 text-left">身份证号</th>
              <th className="px-4 py-3 text-left">职业(工种)</th>
              <th className="px-4 py-3 text-left">等级</th>
              <th className="px-4 py-3 text-right">理论</th>
              <th className="px-4 py-3 text-right">实操</th>
              <th className="px-4 py-3 text-right">总分</th>
              <th className="px-4 py-3 text-left">审核状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-4 py-3 text-gray-600 text-xs font-mono">{i.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-right">{i.theory}</td>
                <td className="px-4 py-3 text-right">{i.practical}</td>
                <td className="px-4 py-3 text-right font-medium text-[#1A56DB]">{i.total.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    i.status === 'approved' ? 'bg-green-50 text-green-700' :
                    i.status === 'rejected' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {i.status === 'approved' ? '已通过' : i.status === 'rejected' ? '已退回' : '待复核'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {i.status === 'pending' && (
                      <>
                        <button onClick={() => approve(i.id)} className="text-green-600 hover:text-green-700" title="通过审核"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => reject(i.id)} className="text-red-600 hover:text-red-700" title="退回修改"><XCircle className="w-4 h-4" /></button>
                      </>
                    )}
                    <button onClick={() => setViewItem(i)} className="text-gray-500 hover:text-[#1A56DB]" title="查看详情"><Eye className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>成绩详情</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">姓名</span><p className="font-medium">{viewItem.name}</p></div>
                <div><span className="text-gray-500">身份证号</span><p className="font-medium font-mono text-xs">{viewItem.idCard}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">职业</span><p className="font-medium">{viewItem.occupation}</p></div>
                <div><span className="text-gray-500">等级</span><p className="font-medium">{viewItem.level}</p></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><span className="text-gray-500 text-xs">理论成绩</span><p className={`font-bold text-lg ${viewItem.theory >= 60 ? 'text-gray-900' : 'text-red-600'}`}>{viewItem.theory}</p></div>
                  <div><span className="text-gray-500 text-xs">实操成绩</span><p className={`font-bold text-lg ${viewItem.practical >= 60 ? 'text-gray-900' : 'text-red-600'}`}>{viewItem.practical}</p></div>
                  <div><span className="text-gray-500 text-xs">总分</span><p className="font-bold text-lg text-[#1A56DB]">{viewItem.total.toFixed(1)}</p></div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">审核状态</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  viewItem.status === 'approved' ? 'bg-green-50 text-green-700' :
                  viewItem.status === 'rejected' ? 'bg-red-50 text-red-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {viewItem.status === 'approved' ? '已通过' : viewItem.status === 'rejected' ? '已退回' : '待复核'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Config Dialog */}
      <Dialog open={showAuditConfig} onOpenChange={setShowAuditConfig}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>审核配置</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">审核模式</label>
              <div className="grid grid-cols-3 gap-2">
                {(['必查', '抽查', '组合'] as AuditMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setAuditMode(mode)}
                    className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                      auditMode === mode
                        ? 'border-[#1A56DB] bg-blue-50 text-[#1A56DB]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {mode === '必查' && <Users className="w-4 h-4 inline mr-1" />}
                    {mode === '抽查' && <Percent className="w-4 h-4 inline mr-1" />}
                    {mode === '组合' && <Settings2 className="w-4 h-4 inline mr-1" />}
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {auditMode === '必查' && '所有考生成绩必须经过人工复核'}
                {auditMode === '抽查' && '按设定比例随机抽取考生进行复核'}
                {auditMode === '组合' && '关键成绩必查，其余按比例抽查'}
              </p>
            </div>

            {auditMode === '抽查' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">抽查比例</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={auditPercent}
                    onChange={e => setAuditPercent(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-[#1A56DB] w-12 text-right">{auditPercent}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">将随机抽取 {Math.ceil(items.length * auditPercent / 100)} 人进行复核</p>
              </div>
            )}

            {auditMode === '组合' && (
              <div className="space-y-3">
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-sm text-amber-800">必查条件（满足任一即必查）：</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    <li>· 理论与实操成绩差异 &gt; 20分</li>
                    <li>· 总分在及格线 ±5分 范围内</li>
                    <li>· 有被举报或投诉记录</li>
                  </ul>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">其余抽查比例</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={5} max={50} step={5} value={auditPercent} onChange={e => setAuditPercent(Number(e.target.value))} className="flex-1" />
                    <span className="text-sm font-medium text-[#1A56DB] w-12 text-right">{auditPercent}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAuditConfig(false)}>取消</Button>
            <Button onClick={saveAuditConfig} className="bg-[#1A56DB] hover:bg-[#1748B5]">保存配置</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
