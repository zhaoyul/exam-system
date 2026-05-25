import { useState } from 'react'
import { Search, Ticket, Printer, Eye, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'
import { admissionTicketNo } from '@/lib/numbering'

const ticketData = [
  { id: '1', name: '张三', idCard: '440301199001011234', employeeNo: 'P000001', ticketNo: admissionTicketNo('2026-05-20', 'Y0041GD000001', 'P000001'), occupation: '核反应堆运行值班员', level: '三级', examRoom: '第一考场', location: '培训中心A栋301', seatNo: '15', theoryDate: '2026-05-20', theoryTime: '09:00-11:00', practicalDate: '2026-05-20', practicalTime: '14:00-16:00' },
  { id: '2', name: '李四', idCard: '440301199002022345', employeeNo: 'P000002', ticketNo: admissionTicketNo('2026-05-20', 'Y0041GD000001', 'P000002'), occupation: '电气试验员', level: '四级', examRoom: '第二考场', location: '培训中心A栋302', seatNo: '08', theoryDate: '2026-05-20', theoryTime: '09:00-11:00', practicalDate: '2026-05-20', practicalTime: '14:00-16:00' },
]

export default function AdmissionTicket() {
  const [tickets] = useBackendListState(ticketData)
  const [searchId, setSearchId] = useState('')
  const [searched, setSearched] = useState(false)
  const [result, setResult] = useState<typeof ticketData[0] | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleSearch = () => {
    setSearched(true)
    setResult(tickets.find(d => d.idCard === searchId) || null)
  }
  const reset = () => { setSearchId(''); setSearched(false); setResult(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Ticket className="w-6 h-6 text-[#1A56DB]" />准考证管理</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3"><Ticket className="w-8 h-8 text-indigo-600" /></div>
            <h2 className="text-lg font-semibold text-gray-900">准考证查询与打印</h2>
            <p className="text-xs text-gray-500 mt-1">输入身份证号查询您的准考证信息</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="请输入身份证号" className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB]" />
            </div>
            <Button onClick={handleSearch} className="h-10 px-6 bg-[#1A56DB] hover:bg-[#1748B5]">查询</Button>
            <Button onClick={reset} variant="outline" className="h-10">重置</Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">示例身份证号：440301199001011234</p>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">准考证信息</h3>
            <div className="flex gap-2">
              <Button onClick={() => setShowPreview(true)} variant="outline" className="h-8 text-xs"><Eye className="w-3.5 h-3.5 mr-1" />预览</Button>
              <Button variant="outline" className="h-8 text-xs"><Printer className="w-3.5 h-3.5 mr-1" />打印</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">姓名</div><div className="font-medium">{result.name}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">准考证编号</div><div className="font-medium font-mono text-xs">{result.ticketNo}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">员工号</div><div className="font-medium">{result.employeeNo}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">职业(工种)</div><div className="font-medium">{result.occupation}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">等级</div><div className="font-medium">{result.level}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">座位号</div><div className="font-medium">{result.seatNo}</div></div>
            <div className="p-3 bg-indigo-50 rounded-lg text-center col-span-2">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />理论考试</div>
              <div className="font-medium text-indigo-700">{result.theoryDate} {result.theoryTime}</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-center col-span-2">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />实操考试</div>
              <div className="font-medium text-indigo-700">{result.practicalDate} {result.practicalTime}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center col-span-2">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />考场</div>
              <div className="font-medium">{result.examRoom}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center col-span-2">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />地点</div>
              <div className="font-medium">{result.location}</div>
            </div>
          </div>
        </div>
      )}

      {searched && !result && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-500 text-sm">未找到该身份证号的准考证信息</div>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>准考证预览</DialogTitle></DialogHeader>
          {result && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-gray-900">职业技能等级认定准考证</div>
                <div className="text-xs text-gray-500">2026年第一批技能认定</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">姓名</span><span>{result.name}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">准考证编号</span><span className="font-mono text-xs">{result.ticketNo}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">员工号</span><span>{result.employeeNo}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">身份证号</span><span>{result.idCard}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">报考职业</span><span>{result.occupation}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">技能等级</span><span>{result.level}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">考场</span><span>{result.examRoom}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">座位号</span><span>{result.seatNo}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">理论考试</span><span>{result.theoryDate} {result.theoryTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">实操考试</span><span>{result.practicalDate} {result.practicalTime}</span></div>
              </div>
              <div className="mt-4 text-center text-xs text-gray-400">请携带身份证和准考证按时参加考试</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
