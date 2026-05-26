import { Fragment, useCallback, useEffect, useState } from 'react'
import { Search, FolderOpen, Users, Calendar, FileText, Award, Clock, ChevronDown, ChevronUp, ArrowRight, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiRequest } from '@/lib/api'
import { downloadTextEndpoint } from '@/lib/download'

interface Candidate {
  id: string
  name: string
  idCard: string
  certNo: string
  occupation: string
  level: string
  theory: number
  practical: number
}

interface ArchiveItem {
  id: string
  planNo: string
  name: string
  org: string
  date: string
  examMonth: string
  count: number
  certCount: number
  status: string
  candidates: Candidate[]
}

interface TimelineEvent {
  time: string
  operator: string
  title: string
  details: string[]
  links?: { text: string; url: string }[]
}

interface ArchiveListResponse {
  items: ArchiveItem[]
}

interface CandidateListResponse {
  planId: string
  items: Candidate[]
}

interface TimelineApiEvent {
  time: string
  operator: string
  title: string
  detail?: string
}

interface TimelineApiResponse {
  candidateId: string
  events: TimelineApiEvent[]
}

const archives: ArchiveItem[] = [
  {
    id: '1', planNo: '2211110', name: '20220324中国同辐股份有限公司第2批认定',
    org: '大亚湾核电', date: '2022-06-28', examMonth: '2022年06月', count: 45, certCount: 38, status: '已完成',
    candidates: [
      { id: 'c1', name: '考生A', idCard: 'Y000511110084', certNo: 'Y000511110084225000001', occupation: '放射性气态废物处理工', level: '初级(5级)', theory: 100.0, practical: 80.0 },
      { id: 'c2', name: '考生B', idCard: 'Y000511110085', certNo: 'Y000511110084225000002', occupation: '放射性气态废物处理工', level: '初级(5级)', theory: 85.0, practical: 90.0 },
    ]
  },
  { id: '2', planNo: '2211111', name: '20220325阳江核电第1批认定', org: '阳江核电', date: '2022-04-12', examMonth: '2022年04月', count: 32, certCount: 28, status: '已完成', candidates: [] },
  { id: '3', planNo: '2211112', name: '20220326台山核电第3批认定', org: '台山核电', date: '2022-04-11', examMonth: '2022年04月', count: 28, certCount: 25, status: '已完成', candidates: [] },
]

const mockTimeline: TimelineEvent[] = [
  { time: '2022-06-28 17:51', operator: 'Y000511110084', title: '报名', details: ['放射性气态废物处理工初级(5级)'] },
  { time: '2022-06-28 18:16', operator: 'Y000511110084', title: '考场编排情况', details: [
    '准考证号: 2206281111008400001',
    '理论考点: 北京市东城区中国原子能科学研究院培训中心',
    '理论考试时间: 2022-06-28 12:00~15:00 (笔试)',
    '理论座次: 1',
    '技能考点: 北京市东城区中国原子能科学研究院',
    '技能考试时间: 2022-06-28 17:00~18:00 (实操)'
  ], links: [{ text: '查看试卷', url: '#' }] },
  { time: '2022-06-28 12:00-15:00', operator: '', title: '理论考试笔试', details: [
    '考点: 中国原子能科学研究院',
    '试卷: LSP2291110111802723323C_000008'
  ], links: [{ text: '查看试卷', url: '#' }] },
  { time: '2022-06-28 17:00-18:00', operator: '', title: '技能考试实操', details: [
    '考点: 中国原子能科学研究院',
    '试卷: JSP2291110111802723323C_000006'
  ], links: [{ text: '查看试卷', url: '#' }] },
  { time: '2022-06-28 19:02', operator: 'Y000511110084', title: '成绩', details: [
    '理论: 100.0, 技能: 80.0'
  ], links: [{ text: '查看理论试卷', url: '#' }, { text: '查看技能试卷', url: '#' }] },
  { time: '2022-06-28 19:09', operator: 'Y000511110084', title: '证书', details: [
    '证书编号: Y000511110084225000001',
    '核发日期: 2022-06-28'
  ] },
]

export default function ArchivePage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ArchiveItem[]>(archives)
  const [loading, setLoading] = useState(false)
  const [viewItem, setViewItem] = useState<ArchiveItem | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCandidates, setShowCandidates] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(mockTimeline)
  const [candidateLoading, setCandidateLoading] = useState(false)

  const filtered = items.filter(i =>
    !search || i.name.includes(search) || i.planNo.includes(search) || i.org.includes(search)
  )

  const loadArchives = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('q', search.trim())
      const data = await apiRequest<ArchiveListResponse>(`/archive${params.toString() ? `?${params.toString()}` : ''}`)
      setItems(data.items?.length ? data.items : archives)
    } catch {
      setItems(archives)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadArchives()
  }, [loadArchives])

  const openCandidates = async (item: ArchiveItem) => {
    setViewItem({ ...item, candidates: item.candidates || [] })
    setShowCandidates(true)
    setCandidateLoading(true)
    try {
      const data = await apiRequest<CandidateListResponse>(`/archive/${encodeURIComponent(item.id)}/candidates`)
      setViewItem({ ...item, candidates: data.items?.length ? data.items : item.candidates || [] })
    } catch {
      setViewItem({ ...item, candidates: item.candidates || [] })
    } finally {
      setCandidateLoading(false)
    }
  }

  const openTimeline = async (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowCandidates(false)
    setShowTimeline(true)
    try {
      const data = await apiRequest<TimelineApiResponse>(`/traceability/timeline/${encodeURIComponent(candidate.id)}`)
      setTimelineEvents(data.events?.length
        ? data.events.map(event => ({
            time: event.time,
            operator: event.operator,
            title: event.title,
            details: event.detail ? [event.detail] : [],
          }))
        : mockTimeline)
    } catch {
      setTimelineEvents(mockTimeline)
    }
  }

  const exportArchive = async (item: ArchiveItem) => {
    await downloadTextEndpoint(`/archive/${encodeURIComponent(item.id)}/export`, `${item.planNo || item.id}-archive.csv`)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="w-5 h-5 text-[#1A56DB]" />
        <h1 className="text-xl font-bold text-gray-900">历次认定档案</h1>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索计划名称..."
            className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]"
          />
        </div>
        <button onClick={loadArchives} className="h-9 rounded-md border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50">刷新</button>
      </div>

      {/* Archive Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-8"></th>
              <th className="px-4 py-3 text-left">序号</th>
              <th className="px-4 py-3 text-left">计划编号</th>
              <th className="px-4 py-3 text-left">计划名称</th>
              <th className="px-4 py-3 text-left">备案地</th>
              <th className="px-4 py-3 text-left">考试月份</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-right">人数</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">正在加载档案数据...</td>
              </tr>
            ) : filtered.map((item, idx) => (
              <Fragment key={item.id}>
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.planNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[300px] truncate">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.org}</td>
                  <td className="px-4 py-3 text-gray-600">{item.examMonth}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openCandidates(item); }} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5">
                        <Users className="w-3.5 h-3.5" />考生
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); exportArchive(item); }} className="text-gray-600 hover:text-[#1A56DB] text-xs flex items-center gap-0.5">
                        <Download className="w-3.5 h-3.5" />导出
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Expanded Row */}
                {expandedId === item.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />认定日期
                          </div>
                          <div className="font-medium text-gray-900">{item.date}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Users className="w-4 h-4" />认定人数
                          </div>
                          <div className="font-medium text-gray-900">{item.count}人</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Award className="w-4 h-4" />证书数量
                          </div>
                          <div className="font-medium text-gray-900">{item.certCount}张</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <FileText className="w-4 h-4" />通过率
                          </div>
                          <div className="font-medium text-[#1A56DB]">{((item.certCount / item.count) * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidates Dialog */}
      <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1A56DB]" />
              考生信息 - {viewItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="px-4 py-3 text-left">身份证号</th>
                  <th className="px-4 py-3 text-left">证书编号</th>
                  <th className="px-4 py-3 text-left">职业工种</th>
                  <th className="px-4 py-3 text-left">等级</th>
                  <th className="px-4 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidateLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">正在加载考生数据...</td>
                  </tr>
                ) : viewItem?.candidates?.length ? (
                  viewItem.candidates.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.idCard}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.certNo}</td>
                      <td className="px-4 py-3 text-gray-600">{c.occupation}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{c.level}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => openTimeline(c)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5">
                          <Clock className="w-3.5 h-3.5" />考生事件
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无考生数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Timeline Dialog */}
      <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1A56DB]" />
              考生事件 - {selectedCandidate?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Candidate Info Card */}
          {selectedCandidate && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">姓名</span><p className="font-medium text-gray-900">{selectedCandidate.name}</p></div>
                <div><span className="text-gray-500">身份证号</span><p className="font-medium text-gray-900 font-mono text-xs">{selectedCandidate.idCard}</p></div>
                <div><span className="text-gray-500">证书编号</span><p className="font-medium text-gray-900 font-mono text-xs">{selectedCandidate.certNo}</p></div>
                <div><span className="text-gray-500">职业等级</span><p className="font-medium text-gray-900">{selectedCandidate.occupation}{selectedCandidate.level}</p></div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

            {timelineEvents.map((event, idx) => (
              <div key={idx} className="relative mb-6 last:mb-0">
                {/* Dot */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  idx === 0 ? 'bg-blue-500 border-blue-500' :
                  idx === timelineEvents.length - 1 ? 'bg-green-500 border-green-500' :
                  'bg-white border-gray-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    idx === 0 ? 'bg-white' :
                    idx === timelineEvents.length - 1 ? 'bg-white' :
                    'bg-gray-300'
                  }`} />
                </div>

                {/* Content */}
                <div className="ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">{event.time}</span>
                    {event.operator && (
                      <span className="text-xs text-gray-400">操作者: {event.operator}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{event.title}</h4>
                  <div className="space-y-0.5">
                    {event.details.map((detail, dIdx) => (
                      <p key={dIdx} className="text-sm text-gray-600">{detail}</p>
                    ))}
                  </div>
                  {event.links && (
                    <div className="flex gap-3 mt-1">
                      {event.links.map((link, lIdx) => (
                        <button key={lIdx} onClick={() => {}} className="text-xs text-[#1A56DB] hover:underline flex items-center gap-0.5">
                          <ArrowRight className="w-3 h-3" />{link.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
