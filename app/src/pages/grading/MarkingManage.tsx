import { useState } from 'react'
import { Search, PenTool, CheckCircle, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

const papers = [
  { id: '1', candidate: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', subject: '实操考试', score: null, status: 'pending', marker: '' },
  { id: '2', candidate: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', subject: '实操考试', score: null, status: 'pending', marker: '' },
  { id: '3', candidate: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级', subject: '实操考试', score: 88, status: 'marked', marker: '考评员甲' },
  { id: '4', candidate: '赵六', idCard: '440301199004044567', occupation: '仪控设备检修工', level: '二级', subject: '实操考试', score: 92, status: 'reviewed', marker: '考评员乙' },
]

export default function MarkingManage() {
  const [items, setItems] = useBackendListState(papers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('全部')
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [markScore, setMarkScore] = useState('')
  const [markComment, setMarkComment] = useState('')

  const filtered = items.filter(i => {
    const m = !search || i.candidate.includes(search) || i.idCard.includes(search)
    const f = filter === '全部' || i.status === filter
    return m && f
  })

  const startMark = (id: string) => { setMarkingId(id); setMarkScore(''); setMarkComment('') }
  const submitMark = () => {
    if (!markingId || !markScore) return
    setItems(prev => prev.map(i => i.id === markingId ? { ...i, score: parseInt(markScore), status: 'marked', marker: '我' } : i))
    setMarkingId(null)
  }
  const reviewPass = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'reviewed' } : i)) }
  const reviewReject = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', score: null, marker: '' } : i)) }

  const statusCls: Record<string, string> = { pending: 'bg-gray-100 text-gray-500', marked: 'bg-blue-50 text-blue-700', reviewed: 'bg-green-50 text-green-700' }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><PenTool className="w-6 h-6 text-[#1A56DB]" />阅卷管理</h1>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索考生..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-56" /></div>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="h-9 px-2 border border-gray-200 rounded-md text-sm"><option>全部</option><option value="pending">待阅卷</option><option value="marked">已阅卷</option><option value="reviewed">已复核</option></select>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded">待阅卷: {items.filter(i=>i.status==='pending').length}</span>
          <span className="px-2 py-1 bg-blue-50 rounded">已阅卷: {items.filter(i=>i.status==='marked').length}</span>
          <span className="px-2 py-1 bg-green-50 rounded">已复核: {items.filter(i=>i.status==='reviewed').length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">考生</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">考试科目</th><th className="px-4 py-3 text-right">评分</th><th className="px-4 py-3 text-left">阅卷人</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.candidate}</td>
                <td className="px-4 py-3 text-gray-600">{i.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3 text-gray-600">{i.subject}</td>
                <td className="px-4 py-3 text-right font-medium">{i.score ?? '--'}</td>
                <td className="px-4 py-3 text-gray-600">{i.marker || '--'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusCls[i.status]}`}>{i.status==='pending'?'待阅卷':i.status==='marked'?'已阅卷':'已复核'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status==='pending'&&<button onClick={()=>startMark(i.id)} className="text-xs text-[#1A56DB] hover:underline flex items-center gap-0.5"><PenTool className="w-3.5 h-3.5"/>阅卷</button>}{i.status==='marked'&&<><button onClick={()=>reviewPass(i.id)} className="text-xs text-green-600 hover:underline">通过</button><button onClick={()=>reviewReject(i.id)} className="text-xs text-red-600 hover:underline">退回</button></>}{i.status==='reviewed'&&<span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/>完成</span>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!markingId} onOpenChange={()=>setMarkingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>阅卷评分</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg text-sm"><div className="font-medium">{items.find(i=>i.id===markingId)?.candidate}</div><div className="text-gray-500 text-xs">{items.find(i=>i.id===markingId)?.occupation} · {items.find(i=>i.id===markingId)?.level}</div></div>
            <div><label className="text-sm font-medium text-gray-700">实操成绩 <span className="text-red-500">*</span></label><input type="number" value={markScore} onChange={e=>setMarkScore(e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入0-100分" min="0" max="100"/></div>
            <div><label className="text-sm font-medium text-gray-700">评语</label><textarea value={markComment} onChange={e=>setMarkComment(e.target.value)} className="w-full mt-1 p-3 border border-gray-200 rounded-md text-sm min-h-[60px]" placeholder="输入评语（可选）"/></div>
          </div>
          <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={()=>setMarkingId(null)}>取消</Button><Button onClick={submitMark} className="bg-[#1A56DB]"><Save className="w-4 h-4 mr-1"/>提交评分</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
