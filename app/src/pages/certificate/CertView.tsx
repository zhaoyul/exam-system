import { useState } from 'react'
import { Search, Eye, Award } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendResourceList } from '@/hooks/useBackendListState'

const certs = [
  { id: '1', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', certNo: 'CGN-2026-001', issueDate: '2026-06-01', org: '大亚湾核电' },
  { id: '2', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', certNo: 'CGN-2026-002', issueDate: '2026-06-01', org: '大亚湾核电' },
  { id: '3', name: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级', certNo: 'CGN-2026-003', issueDate: '2026-06-01', org: '阳江核电' },
  { id: '4', name: '赵六', idCard: '440301199004044567', occupation: '仪控设备检修工', level: '二级', certNo: 'CGN-2026-004', issueDate: '2026-06-01', org: '台山核电' },
]

export default function CertView() {
  const [search, setSearch] = useState('')
  const [viewItem, setViewItem] = useState<any>(null)
  const items = useBackendResourceList('/certificate/list', certs)

  const filtered = items.filter(i => !search || i.name.includes(search) || i.certNo.includes(search) || i.idCard.includes(search))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">证书查看</h1>
      <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名/证号/身份证号..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-72 focus:outline-none focus:border-[#1A56DB]" /></div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-left">证书编号</th><th className="px-4 py-3 text-left">发证日期</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{i.certNo}</td>
                <td className="px-4 py-3 text-gray-600">{i.issueDate}</td>
                <td className="px-4 py-3"><button onClick={() => setViewItem(i)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" />查看</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>证书信息</DialogTitle></DialogHeader>
        {viewItem && <div className="space-y-3">
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-center">
            <Award className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">职业技能等级证书</div>
            <div className="text-xs text-gray-500 mt-1">证书编号: {viewItem.certNo}</div>
          </div>
          <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">姓名</span><span className="font-medium">{viewItem.name}</span></div><div className="flex justify-between"><span className="text-gray-500">身份证号</span><span className="font-medium">{viewItem.idCard}</span></div><div className="flex justify-between"><span className="text-gray-500">职业(工种)</span><span className="font-medium">{viewItem.occupation}</span></div><div className="flex justify-between"><span className="text-gray-500">技能等级</span><span className="font-medium">{viewItem.level}</span></div><div className="flex justify-between"><span className="text-gray-500">发证日期</span><span className="font-medium">{viewItem.issueDate}</span></div><div className="flex justify-between"><span className="text-gray-500">发证机构</span><span className="font-medium">{viewItem.org}</span></div></div>
        </div>}
      </DialogContent></Dialog>
    </div>
  )
}
