import { useMemo, useState } from 'react'
import { CalendarDays, Eye, Monitor, PlayCircle, Search, Video, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

type ExamStatus = '未开考' | '正在考试' | '考试结束'

interface VideoSession {
  id: string
  planCode: string
  planName: string
  org: string
  room: string
  site: string
  address: string
  examType: string
  status: ExamStatus
  date: string
  time: string
  online: boolean
  candidates: number
}

const sessions: VideoSession[] = [
  { id: '1', planCode: '26440310050002', planName: '20260402中广核测试第2批认定', org: '中广测试有限公司', room: '理论第一考场', site: '深圳市中广核评价站', address: '深圳市福田区深南大道中广核培训楼3层', examType: '理论考试', status: '正在考试', date: '2026-05-19', time: '09:00-11:00', online: true, candidates: 40 },
  { id: '2', planCode: '26440310050002', planName: '20260402中广核测试第2批认定', org: '中广测试有限公司', room: '理论第二考场', site: '深圳市中广核评价站', address: '深圳市福田区深南大道中广核培训楼4层', examType: '理论考试', status: '正在考试', date: '2026-05-19', time: '09:00-11:00', online: true, candidates: 38 },
  { id: '3', planCode: '26440310050003', planName: '2026年集团焊工技能等级认定', org: '阳江核电有限公司', room: '实操焊接工位', site: '阳江核电培训中心', address: '阳江市东平镇核电基地实操厂房', examType: '技能实操', status: '未开考', date: '2026-05-19', time: '14:00-17:00', online: false, candidates: 24 },
  { id: '4', planCode: '26440310050001', planName: '2026年运行值班员专项认定', org: '大亚湾核电', room: '机房监控考场', site: '大亚湾实训基地', address: '深圳市大鹏新区大亚湾实训基地主控楼', examType: '综合评审', status: '考试结束', date: '2026-05-19', time: '08:30-10:30', online: true, candidates: 32 },
]

export default function VideoMonitorPage() {
  const [monitorSessions] = useBackendListState<VideoSession>(sessions)
  const [status, setStatus] = useState<ExamStatus>('未开考')
  const [date, setDate] = useState('2026-05-19')
  const [queryType, setQueryType] = useState('计划编号')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<VideoSession | null>(null)

  const filtered = useMemo(() => {
    return monitorSessions.filter(item => {
      const source = queryType === '计划编号' ? item.planCode : item.planName
      return item.status === status && item.date === date && (!query || source.includes(query))
    })
  }, [date, monitorSessions, query, queryType, status])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Monitor className="h-5 w-5 text-[#1A56DB]" />
        <h1 className="text-xl font-bold text-gray-900">视频监控</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
          {(['未开考', '正在考试', '考试结束'] as ExamStatus[]).map(item => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`h-8 rounded-md px-5 text-sm transition-colors ${
                status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-sm text-gray-600">考试日期：</span>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={event => setDate(event.target.value)}
              className="h-9 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <select
            value={queryType}
            onChange={event => setQueryType(event.target.value)}
            className="h-9 rounded-md border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
          >
            <option>计划编号</option>
            <option>计划名称</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="h-9 w-64 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 text-sm hover:bg-[#1748B5]">搜索</Button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">序号</th>
              <th className="px-4 py-3 text-left font-medium">考点名称</th>
              <th className="px-4 py-3 text-left font-medium">考点地址</th>
              <th className="px-4 py-3 text-left font-medium">考试时间</th>
              <th className="px-4 py-3 text-left font-medium">考试类别</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{item.site}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.room} / {item.planCode}</div>
                </td>
                <td className="max-w-[340px] px-4 py-3 text-gray-600">{item.address}</td>
                <td className="px-4 py-3 text-gray-600">{item.date} {item.time}</td>
                <td className="px-4 py-3 text-gray-600">{item.examType}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setActive(item)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                    <Eye className="h-3.5 w-3.5" />查看
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader><DialogTitle>视频监控 - {active?.site}</DialogTitle></DialogHeader>
          {active && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-4 gap-3 rounded-md bg-[#F9FAFB] p-3 text-gray-600">
                <Info label="计划编号" value={active.planCode} />
                <Info label="考场" value={active.room} />
                <Info label="考试类别" value={active.examType} />
                <Info label="应考人数" value={`${active.candidates}人`} />
              </div>
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-950 text-white">
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs">
                  {active.online ? <Wifi className="h-3 w-3 text-green-300" /> : <WifiOff className="h-3 w-3 text-gray-300" />}
                  {active.online ? '在线' : '未接入'}
                </div>
                <Video className="h-16 w-16 text-white/25" />
                {active.status === '正在考试' && <PlayCircle className="absolute h-12 w-12 text-white/80" />}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium text-gray-900">{value}</div>
    </div>
  )
}
