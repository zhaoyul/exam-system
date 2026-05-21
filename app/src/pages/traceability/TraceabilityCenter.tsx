import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendResourceList } from '@/hooks/useBackendListState'

interface TraceRecord {
  id: string
  name: string
  idType: string
  idNo: string
  certNo: string
  issuer: string
  generatedAt: string
  occupation: string
  level: string
  province: string
}

const initialRecords: TraceRecord[] = [
  { id: 'tr1', name: '报名学员', idType: '居民身份证', idNo: '37*****21', certNo: 'Y000544031005263000001', issuer: '中国工业集团有限公司', generatedAt: '2026-04-17 10:01', occupation: '企业人力资源管理师', level: '三级/高级工', province: '广东省' },
  { id: 'tr2', name: '报名学员2', idType: '居民身份证', idNo: '37*****16', certNo: 'Y000544031005263000002', issuer: '中国工业集团有限公司', generatedAt: '2026-04-17 10:01', occupation: '企业人力资源管理师', level: '三级/高级工', province: '广东省' },
  { id: 'tr3', name: '水电费', idType: '居民身份证', idNo: '22*****13', certNo: 'Y000545000001263000001', issuer: '中国工业集团有限公司', generatedAt: '2026-04-10 16:22', occupation: '电机检修工', level: '三级/高级工', province: '广西壮族自治区' },
]

export default function TraceabilityCenter() {
  const records = useBackendResourceList<TraceRecord>('/traceability/cert-records', initialRecords)
  const [query, setQuery] = useState('')
  const [activeProvince, setActiveProvince] = useState('全部')
  const [activeMode, setActiveMode] = useState<'认定' | '申报'>('认定')
  const [active, setActive] = useState<TraceRecord | null>(null)
  const [dialog, setDialog] = useState<'process' | 'score' | null>(null)

  const filtered = useMemo(() => records.filter(record => {
    const byProvince = activeProvince === '全部' || record.province === activeProvince
    const byQuery = !query || record.name.includes(query) || record.certNo.includes(query) || record.idNo.includes(query)
    return byProvince && byQuery
  }), [activeProvince, query, records])

  const provinceStats = [
    { label: '全部', count: records.length },
    { label: '广东省', count: records.filter(item => item.province === '广东省').length },
    { label: '广西壮族自治区', count: records.filter(item => item.province === '广西壮族自治区').length },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">溯源中心</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">姓　　名</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={event => setQuery(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
          <span className="text-sm text-gray-600">机构：全部</span>
          <div className="flex gap-2">
            {(['认定', '申报'] as const).map(mode => <button key={mode} onClick={() => setActiveMode(mode)} className={`h-8 rounded-md px-3 text-xs ${activeMode === mode ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{mode}</button>)}
          </div>
        </div>

        <div className="grid grid-cols-[220px_1fr]">
          <aside className="border-r border-gray-100 p-3">
            <div className="mb-3 text-sm font-medium text-gray-700">备案地</div>
            {provinceStats.map((item, index) => (
              <button key={item.label} onClick={() => setActiveProvince(item.label)} className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm ${activeProvince === item.label ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + (index > 0 ? 18 : 0) }}>
                {item.label} ({item.count}个)
              </button>
            ))}
          </aside>
          <div className="overflow-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">姓名</th>
                  <th className="px-4 py-3 text-left font-medium">证件类型</th>
                  <th className="px-4 py-3 text-left font-medium">证件号码</th>
                  <th className="px-4 py-3 text-left font-medium">证书编号</th>
                  <th className="px-4 py-3 text-left font-medium">发证单位</th>
                  <th className="px-4 py-3 text-left font-medium">生成时间</th>
                  <th className="px-4 py-3 text-left font-medium">职业工种</th>
                  <th className="px-4 py-3 text-left font-medium">技能等级</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{record.name}</td>
                    <td className="px-4 py-3 text-gray-600">{record.idType}</td>
                    <td className="px-4 py-3 text-gray-600">{record.idNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{record.certNo}</td>
                    <td className="px-4 py-3 text-gray-600">{record.issuer}</td>
                    <td className="px-4 py-3 text-gray-600">{record.generatedAt}</td>
                    <td className="px-4 py-3 text-gray-600">{record.occupation}</td>
                    <td className="px-4 py-3 text-gray-600">{record.level}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => { setActive(record); setDialog('process') }} className="text-[#1A56DB] hover:underline">认定过程</button>
                        <button onClick={() => { setActive(record); setDialog('score') }} className="text-[#1A56DB] hover:underline">修改成绩记录</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">共计{filtered.length}条数据　1　20 条/页</div>
          </div>
        </div>
      </section>

      <Dialog open={dialog === 'process'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>认定过程</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            {['认定计划', '考生报名', '考场编排', '成绩确认', '证书生成'].map((step, index) => <div key={step} className="rounded-md border border-gray-100 px-3 py-2">{index + 1}. {step} - {active?.name}</div>)}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'score'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>修改成绩记录</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <Info label="姓名" value={active?.name || ''} />
            <Info label="证书编号" value={active?.certNo || ''} />
            <Info label="记录" value="暂无成绩修改记录" />
            <div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('记录已确认') }}>确定</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>
}
