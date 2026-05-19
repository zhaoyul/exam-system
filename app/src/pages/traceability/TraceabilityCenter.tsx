import { useState } from 'react'
import { Search, Link2, CheckCircle2, AlertCircle, Clock, MapPin, FileText, Award, UserCheck, Download, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface TraceNode {
  id: string
  stage: string
  title: string
  date: string
  status: 'completed' | 'processing' | 'pending' | 'exception'
  org: string
  operator: string
  detail: string
}

const mockChains: Record<string, TraceNode[]> = {
  '440301199001011234': [
    { id: 't1', stage: 'plan', title: '评价计划发布', date: '2026-04-01', status: 'completed', org: '集团', operator: '管理员', detail: '2026年第一批技能认定计划已发布' },
    { id: 't2', stage: 'register', title: '考生报名', date: '2026-04-05', status: 'completed', org: '大亚湾核电', operator: '张三', detail: '张三完成在线报名，报考核反应堆运行值班员三级' },
    { id: 't3', stage: 'register', title: '报名审核', date: '2026-04-06', status: 'completed', org: '大亚湾核电', operator: '考务员A', detail: '报名资格审核通过' },
    { id: 't4', stage: 'arrange', title: '考场编排', date: '2026-04-15', status: 'completed', org: '集团', operator: '管理员', detail: '分配至第一考场（培训中心A栋301）' },
    { id: 't5', stage: 'arrange', title: '准考证发放', date: '2026-04-18', status: 'completed', org: '大亚湾核电', operator: '考务员B', detail: '准考证已打印并通知考生' },
    { id: 't6', stage: 'exam', title: '理论考试', date: '2026-05-20 09:00', status: 'completed', org: '第一考场', operator: '监考员甲', detail: '理论考试参加，成绩85分' },
    { id: 't7', stage: 'exam', title: '实操考试', date: '2026-05-20 14:00', status: 'completed', org: '实操考场1', operator: '考评员乙', detail: '实操考试参加，成绩88分' },
    { id: 't8', stage: 'score', title: '成绩录入', date: '2026-05-21', status: 'completed', org: '集团', operator: '管理员', detail: '理论85分，实操88分，综合86.8分' },
    { id: 't9', stage: 'score', title: '成绩复核', date: '2026-05-22', status: 'completed', org: '集团', operator: '督导员', detail: '成绩复核通过' },
    { id: 't10', stage: 'publicity', title: '成绩公示', date: '2026-05-25', status: 'completed', org: '集团', operator: '管理员', detail: '公示期7天，无异议' },
    { id: 't11', stage: 'cert', title: '证书颁发', date: '2026-06-01', status: 'completed', org: '集团', operator: '管理员', detail: '证书编号CGN-2026-001，已颁发' },
  ],
  '440301199002022345': [
    { id: 't1', stage: 'plan', title: '评价计划发布', date: '2026-04-01', status: 'completed', org: '集团', operator: '管理员', detail: '2026年第一批技能认定计划已发布' },
    { id: 't2', stage: 'register', title: '考生报名', date: '2026-04-08', status: 'completed', org: '阳江核电', operator: '李四', detail: '李四完成报名，报考电气试验员四级' },
    { id: 't3', stage: 'register', title: '报名审核', date: '2026-04-09', status: 'completed', org: '阳江核电', operator: '考务员C', detail: '报名资格审核通过' },
    { id: 't4', stage: 'arrange', title: '考场编排', date: '2026-04-15', status: 'completed', org: '集团', operator: '管理员', detail: '分配至第二考场' },
    { id: 't5', stage: 'exam', title: '理论考试', date: '2026-05-20 09:00', status: 'completed', org: '第二考场', operator: '监考员乙', detail: '理论考试成绩78分' },
    { id: 't6', stage: 'exam', title: '实操考试', date: '2026-05-20 14:00', status: 'completed', org: '实操考场2', operator: '考评员丙', detail: '实操考试成绩82分' },
    { id: 't7', stage: 'score', title: '成绩录入', date: '2026-05-21', status: 'processing', org: '集团', operator: '管理员', detail: '成绩录入中，等待复核' },
    { id: 't8', stage: 'publicity', title: '成绩公示', date: '--', status: 'pending', org: '--', operator: '--', detail: '等待成绩复核通过后公示' },
    { id: 't9', stage: 'cert', title: '证书颁发', date: '--', status: 'pending', org: '--', operator: '--', detail: '等待公示结束后颁发证书' },
  ],
  '440301199003033456': [
    { id: 't1', stage: 'plan', title: '评价计划发布', date: '2026-04-01', status: 'completed', org: '集团', operator: '管理员', detail: '2026年第一批技能认定计划已发布' },
    { id: 't2', stage: 'register', title: '考生报名', date: '2026-04-10', status: 'completed', org: '台山核电', operator: '王五', detail: '王五完成报名' },
    { id: 't3', stage: 'register', title: '报名审核', date: '2026-04-11', status: 'exception', org: '台山核电', operator: '考务员D', detail: '报名材料不完整，缺少工作年限证明' },
  ],
}

const stageMeta: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  plan: { label: '计划', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText },
  register: { label: '报名', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: UserCheck },
  arrange: { label: '编排', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: MapPin },
  exam: { label: '考试', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  score: { label: '成绩', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: FileText },
  publicity: { label: '公示', color: 'bg-pink-50 text-pink-700 border-pink-200', icon: UserCheck },
  cert: { label: '证书', color: 'bg-green-50 text-green-700 border-green-200', icon: Award },
}

export default function TraceabilityCenter() {
  const [searchId, setSearchId] = useState('')
  const [chain, setChain] = useState<TraceNode[] | null>(null)
  const [searched, setSearched] = useState(false)
  const [viewNode, setViewNode] = useState<TraceNode | null>(null)
  const [filter, setFilter] = useState('全部')

  const handleSearch = () => {
    setSearched(true)
    setChain(mockChains[searchId] || null)
  }
  const reset = () => { setSearchId(''); setChain(null); setSearched(false); setFilter('全部') }

  const completedCount = chain?.filter(n => n.status === 'completed').length || 0
  const exceptionCount = chain?.filter(n => n.status === 'exception').length || 0
  const totalCount = chain?.length || 0

  const filteredChain = chain?.filter(n => filter === '全部' || n.status === filter) || []

  const statusCls: Record<string, string> = {
    completed: 'bg-green-50 text-green-700',
    processing: 'bg-blue-50 text-blue-700',
    pending: 'bg-gray-100 text-gray-500',
    exception: 'bg-red-50 text-red-700',
  }

  const exportReport = () => {
    if (!chain) return
    const text = chain.map(n => `${n.date} | ${n.title} | ${n.org} | ${n.operator} | ${n.detail}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `溯源报告_${searchId}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Link2 className="w-6 h-6 text-[#1A56DB]" />溯源中心</h1>

      {/* 搜索区 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="输入身份证号或证书编号查询认定链路..." className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" />
          </div>
          <Button onClick={handleSearch} className="h-10 px-6 bg-[#1A56DB] hover:bg-[#1748B5]">查询</Button>
          <Button onClick={reset} variant="outline" className="h-10"><RotateCcw className="w-4 h-4" /></Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">示例身份证号：440301199001011234（完整链路）、440301199002022345（进行中）、440301199003033456（异常）</p>
      </div>

      {chain && (
        <>
          {/* 统计 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-2xl font-bold text-[#1A56DB]">{totalCount}</div><div className="text-xs text-gray-500">总环节数</div></div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-2xl font-bold text-green-600">{completedCount}</div><div className="text-xs text-gray-500">已完成</div></div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-2xl font-bold text-blue-600">{totalCount - completedCount - exceptionCount}</div><div className="text-xs text-gray-500">进行中/待处理</div></div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-2xl font-bold text-red-600">{exceptionCount}</div><div className="text-xs text-gray-500">异常</div></div>
          </div>

          {/* 筛选 */}
          <div className="flex items-center gap-2 mb-3">
            {['全部', 'completed', 'processing', 'pending', 'exception'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === s ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s === '全部' ? '全部' : s === 'completed' ? '已完成' : s === 'processing' ? '进行中' : s === 'pending' ? '待处理' : '异常'}
              </button>
            ))}
            <Button onClick={exportReport} variant="outline" className="h-8 text-xs ml-auto"><Download className="w-3.5 h-3.5 mr-1" />导出报告</Button>
          </div>

          {/* 时间线 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-0">
                {filteredChain.map((node) => {
                  const meta = stageMeta[node.stage] || stageMeta.plan
                  const Icon = meta.icon
                  return (
                    <div key={node.id} className="flex items-start gap-4 relative py-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${node.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : node.status === 'exception' ? 'bg-red-500 border-red-500 text-white' : node.status === 'processing' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                        {node.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : node.status === 'exception' ? <AlertCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 border border-gray-100 rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={() => setViewNode(node)}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>{meta.label}</span>
                            <span className="text-sm font-semibold text-gray-900">{node.title}</span>
                            {node.status === 'exception' && <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">异常</span>}
                          </div>
                          <span className="text-xs text-gray-400">{node.date}</span>
                        </div>
                        <p className="text-xs text-gray-500">{node.detail}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span>{node.org}</span>
                          <span>{node.operator}</span>
                          <ChevronRight className="w-3 h-3 ml-auto" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {searched && !chain && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-500 text-sm">未找到该身份证号的认定记录</div>
          <div className="text-gray-400 text-xs mt-1">请检查输入是否正确</div>
        </div>
      )}

      <Dialog open={!!viewNode} onOpenChange={() => setViewNode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>环节详情</DialogTitle></DialogHeader>
          {viewNode && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">环节名称</div><div className="font-medium">{viewNode.title}</div></div>
                <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">日期</div><div className="font-medium">{viewNode.date}</div></div>
                <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">机构</div><div className="font-medium">{viewNode.org}</div></div>
                <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">操作人</div><div className="font-medium">{viewNode.operator}</div></div>
              </div>
              <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">状态</div><span className={`px-2 py-0.5 rounded text-xs ${statusCls[viewNode.status]}`}>{viewNode.status === 'completed' ? '已完成' : viewNode.status === 'processing' ? '进行中' : viewNode.status === 'pending' ? '待处理' : '异常'}</span></div>
              <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">详细说明</div><div className="font-medium">{viewNode.detail}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
