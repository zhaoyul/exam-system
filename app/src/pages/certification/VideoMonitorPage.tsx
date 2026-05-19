import { useMemo, useState } from 'react'
import { CalendarDays, Monitor, PlayCircle, Search, Video, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ExamStatus = '未开考' | '正在考试' | '考试结束'

interface VideoSession {
  id: string
  planCode: string
  planName: string
  org: string
  room: string
  site: string
  status: ExamStatus
  date: string
  time: string
  online: boolean
  candidates: number
}

const sessions: VideoSession[] = [
  { id: '1', planCode: '26440310050002', planName: '20260402中广核测试第2批认定', org: '中广测试有限公司', room: '理论第一考场', site: '深圳市中广核', status: '正在考试', date: '2026-05-19', time: '09:00-11:00', online: true, candidates: 40 },
  { id: '2', planCode: '26440310050002', planName: '20260402中广核测试第2批认定', org: '中广测试有限公司', room: '理论第二考场', site: '深圳市中广核', status: '正在考试', date: '2026-05-19', time: '09:00-11:00', online: true, candidates: 38 },
  { id: '3', planCode: '26440310050003', planName: '2026年集团焊工技能等级认定', org: '阳江核电有限公司', room: '实操焊接工位', site: '阳江核电培训中心', status: '未开考', date: '2026-05-19', time: '14:00-17:00', online: false, candidates: 24 },
  { id: '4', planCode: '26440310050001', planName: '2026年运行值班员专项认定', org: '大亚湾核电', room: '机房监控考场', site: '大亚湾实训基地', status: '考试结束', date: '2026-05-19', time: '08:30-10:30', online: true, candidates: 32 },
]

export default function VideoMonitorPage() {
  const [status, setStatus] = useState<ExamStatus>('未开考')
  const [date, setDate] = useState('2026-05-19')
  const [queryType, setQueryType] = useState('计划编号')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return sessions.filter(item => {
      const source = queryType === '计划编号' ? item.planCode : item.planName
      return item.status === status && item.date === date && (!query || source.includes(query))
    })
  }, [date, query, queryType, status])

  const counts = useMemo(() => {
    return {
      未开考: sessions.filter(item => item.status === '未开考').length,
      正在考试: sessions.filter(item => item.status === '正在考试').length,
      考试结束: sessions.filter(item => item.status === '考试结束').length,
    }
  }, [])

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
              className={`h-8 rounded-md px-4 text-sm font-medium transition-colors ${
                status === item ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item}（{counts[item]}）
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
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
                placeholder="输入查询内容"
              />
            </div>
            <Button className="h-9 bg-[#1A56DB] text-sm hover:bg-[#1748B5]">搜索</Button>
          </div>
          <div className="text-xs text-gray-500">共 {filtered.length} 路监控</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filtered.map(item => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <div className="font-semibold text-gray-900">{item.room}</div>
                <div className="mt-1 text-xs text-gray-500">{item.planName} · {item.planCode}</div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${item.online ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {item.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {item.online ? '在线' : '未接入'}
              </span>
            </div>
            <div className="relative flex aspect-video items-center justify-center bg-slate-950 text-white">
              <div className="absolute left-3 top-3 rounded bg-black/50 px-2 py-1 text-xs">{item.site}</div>
              <Video className="h-14 w-14 text-white/30" />
              {item.status === '正在考试' && <PlayCircle className="absolute h-12 w-12 text-white/80" />}
            </div>
            <div className="grid grid-cols-3 gap-3 px-4 py-3 text-xs text-gray-600">
              <span>机构：{item.org}</span>
              <span>时间：{item.time}</span>
              <span>应考：{item.candidates}人</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
            当前条件下暂无视频监控数据
          </div>
        )}
      </div>
    </div>
  )
}
