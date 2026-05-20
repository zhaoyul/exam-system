import { useMemo, useState } from 'react'
import { CheckCircle2, Download, Eye, FileWarning, Search, ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type WarningType = '一人多证预警' | '工作进度预警' | '年龄预警' | '合格率预警' | '成绩过低预警' | '成绩过高预警'
type WarningStatus = '待处理' | '已确认' | '已忽略'
type WarningLevel = '一般' | '严重' | '高危'

interface WarningItem {
  id: string
  type: WarningType
  planName: string
  org: string
  node: string
  candidate?: string
  idCard?: string
  level: WarningLevel
  triggerValue: string
  rule: string
  foundTime: string
  status: WarningStatus
  source: string
  description: string
  result?: string
}

const initialWarnings: WarningItem[] = [
  {
    id: 'w1',
    type: '一人多证预警',
    planName: '20260402中广核测试第2批认定',
    org: '中广测试有限公司',
    node: '考试报名',
    candidate: '张明',
    idCard: '440301199001011234',
    level: '严重',
    triggerValue: '同一证件报名 2 个职业',
    rule: '同批次同证件号报名多个职业或等级',
    foundTime: '2026-05-18 10:22',
    status: '待处理',
    source: '系统检查',
    description: '该考生在电工三级和继电保护员四级同时存在报名记录，需要核实是否符合认定要求。',
  },
  {
    id: 'w2',
    type: '工作进度预警',
    planName: '20260412防城港核电第3批认定',
    org: '防城港核电有限公司',
    node: '考场编排',
    level: '一般',
    triggerValue: '考前 2 日仍未完成',
    rule: '考场编排需在考前 3 日完成',
    foundTime: '2026-05-17 16:10',
    status: '已确认',
    source: '预警设置',
    description: '计划距离考试日期不足 3 日，考场编排尚未确认。',
    result: '已通知分支机构补充编排信息。',
  },
  {
    id: 'w3',
    type: '合格率预警',
    planName: '20260508阳江核电第1批认定',
    org: '阳江核电有限公司',
    node: '考试成绩',
    level: '高危',
    triggerValue: '合格率 98.2%',
    rule: '考生数 30 人及以上，合格率高于 95% 或低于 50%',
    foundTime: '2026-05-16 09:45',
    status: '待处理',
    source: '成绩管理',
    description: '本次成绩合格率超过集团预警阈值，需要复核阅卷记录、考场记录和督导记录。',
  },
  {
    id: 'w4',
    type: '年龄预警',
    planName: '20260401台山核电第2批认定',
    org: '台山核电合营有限公司',
    node: '考试报名',
    candidate: '李华',
    idCard: '440301200901018888',
    level: '严重',
    triggerValue: '报考五级，年龄 15 岁',
    rule: '五级 16 岁以下触发预警',
    foundTime: '2026-05-15 13:28',
    status: '已忽略',
    source: '报名审核',
    description: '考生年龄低于报考等级预警线。',
    result: '经核查证件信息录入错误，已由分支机构修正。',
  },
]

const warningTypes: Array<'全部' | WarningType> = ['全部', '一人多证预警', '工作进度预警', '年龄预警', '合格率预警', '成绩过低预警', '成绩过高预警']
const statuses: Array<'全部' | WarningStatus> = ['全部', '待处理', '已确认', '已忽略']

export default function ViolationsPage() {
  const [items, setItems] = useBackendListState<WarningItem>(initialWarnings)
  const [activeType, setActiveType] = useState<'全部' | WarningType>('全部')
  const [statusFilter, setStatusFilter] = useState<'全部' | WarningStatus>('全部')
  const [search, setSearch] = useState('')
  const [detailItem, setDetailItem] = useState<WarningItem | null>(null)
  const [handleItem, setHandleItem] = useState<WarningItem | null>(null)
  const [handleResult, setHandleResult] = useState<'确认' | '忽略'>('确认')
  const [handleOpinion, setHandleOpinion] = useState('')

  const filtered = useMemo(() => {
    return items.filter(item => {
      const byType = activeType === '全部' || item.type === activeType
      const byStatus = statusFilter === '全部' || item.status === statusFilter
      const bySearch = !search || item.planName.includes(search) || item.org.includes(search) || item.candidate?.includes(search) || item.idCard?.includes(search)
      return byType && byStatus && bySearch
    })
  }, [activeType, items, search, statusFilter])

  const openHandle = (item: WarningItem, result: '确认' | '忽略') => {
    setHandleItem(item)
    setHandleResult(result)
    setHandleOpinion('')
  }

  const submitHandle = () => {
    if (!handleItem) return
    if (!handleOpinion.trim()) {
      toast.error('请填写处理说明')
      return
    }
    const status: WarningStatus = handleResult === '确认' ? '已确认' : '已忽略'
    setItems(prev => prev.map(item => item.id === handleItem.id ? { ...item, status, result: handleOpinion } : item))
    setHandleItem(null)
    toast.success(handleResult === '确认' ? '预警已确认' : '预警已忽略')
  }

  const levelClass = (level: WarningLevel) => {
    if (level === '高危') return 'bg-red-50 text-red-700'
    if (level === '严重') return 'bg-amber-50 text-amber-700'
    return 'bg-blue-50 text-blue-700'
  }

  const statusBadge = (status: WarningStatus) => {
    if (status === '已确认') return <Badge className="bg-green-50 text-green-700">{status}</Badge>
    if (status === '已忽略') return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>
    return <Badge className="bg-amber-50 text-amber-700">{status}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">预警违规</h1>
          <p className="mt-1 text-sm text-gray-500">查看由预警设置触发的违规预警统计，并对异常记录进行确认或忽略处理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('预警违规数据已导出')}><Download className="mr-2 h-4 w-4" />导出</Button>
          <Button variant="outline" onClick={() => toast.success('预警检查完成，暂无新增异常')}><ShieldCheck className="mr-2 h-4 w-4" />预警检查</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="预警总数" value={items.length} tone="blue" />
        <StatCard label="待处理" value={items.filter(item => item.status === '待处理').length} tone="amber" />
        <StatCard label="已确认" value={items.filter(item => item.status === '已确认').length} tone="green" />
        <StatCard label="高危预警" value={items.filter(item => item.level === '高危').length} tone="red" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {warningTypes.map(type => (
              <button key={type} onClick={() => setActiveType(type)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${activeType === type ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} className="h-9 rounded-md border border-gray-200 px-2 text-sm">
              {statuses.map(status => <option key={status}>{status}</option>)}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="计划 / 机构 / 考生 / 证件号" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {warningTypes.filter(type => type !== '全部').map(type => {
            const typeItems = items.filter(item => item.type === type)
            return (
              <button key={type} onClick={() => setActiveType(type)} className={`rounded-md border p-3 text-left ${activeType === type ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{type}</span>
                  <span className="text-lg font-bold text-gray-900">{typeItems.length}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">待处理 {typeItems.filter(item => item.status === '待处理').length} 条</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">预警类型</th>
              <th className="px-4 py-3 text-left font-medium">计划名称</th>
              <th className="px-4 py-3 text-left font-medium">机构</th>
              <th className="px-4 py-3 text-left font-medium">节点</th>
              <th className="px-4 py-3 text-left font-medium">触发值</th>
              <th className="px-4 py-3 text-left font-medium">等级</th>
              <th className="px-4 py-3 text-left font-medium">发现时间</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-medium text-gray-900"><FileWarning className="h-4 w-4 text-amber-500" />{item.type}</span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.planName}</td>
                <td className="px-4 py-3 text-gray-600">{item.org}</td>
                <td className="px-4 py-3 text-gray-600">{item.node}</td>
                <td className="px-4 py-3 text-gray-700">{item.triggerValue}</td>
                <td className="px-4 py-3"><Badge className={levelClass(item.level)}>{item.level}</Badge></td>
                <td className="px-4 py-3 text-xs text-gray-600">{item.foundTime}</td>
                <td className="px-4 py-3">{statusBadge(item.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetailItem(item)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline"><Eye className="h-3.5 w-3.5" />查看</button>
                    {item.status === '待处理' && <button onClick={() => openHandle(item, '确认')} className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline"><CheckCircle2 className="h-3.5 w-3.5" />确认</button>}
                    {item.status === '待处理' && <button onClick={() => openHandle(item, '忽略')} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline"><XCircle className="h-3.5 w-3.5" />忽略</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>预警详情</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-[#F9FAFB] p-3">
                <div className="font-medium text-gray-900">{detailItem.planName}</div>
                <div className="mt-1 text-xs text-gray-500">{detailItem.type} / {detailItem.node}</div>
              </div>
              {detailItem.candidate && <Info label="考生姓名" value={detailItem.candidate} />}
              {detailItem.idCard && <Info label="身份证号" value={detailItem.idCard} />}
              <Info label="触发规则" value={detailItem.rule} />
              <Info label="触发值" value={detailItem.triggerValue} />
              <Info label="来源" value={detailItem.source} />
              <div className="rounded-md border border-amber-100 bg-amber-50 p-3 text-amber-800">{detailItem.description}</div>
              {detailItem.result && <div className="rounded-md border border-green-100 bg-green-50 p-3 text-green-700">处理结果：{detailItem.result}</div>}
              {detailItem.status === '待处理' && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setDetailItem(null); openHandle(detailItem, '忽略') }}>忽略</Button>
                  <Button onClick={() => { setDetailItem(null); openHandle(detailItem, '确认') }}>确认</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!handleItem} onOpenChange={() => setHandleItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>处理预警</DialogTitle></DialogHeader>
          {handleItem && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md bg-[#F9FAFB] p-3">{handleItem.type}：{handleItem.triggerValue}</div>
              <div>
                <div className="mb-2 font-medium text-gray-700">处理结果</div>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-1.5"><input type="radio" checked={handleResult === '确认'} onChange={() => setHandleResult('确认')} />确认</label>
                  <label className="inline-flex items-center gap-1.5"><input type="radio" checked={handleResult === '忽略'} onChange={() => setHandleResult('忽略')} />忽略</label>
                </div>
              </div>
              <textarea value={handleOpinion} onChange={event => setHandleOpinion(event.target.value)} placeholder="请输入处理说明" className="h-28 w-full rounded-md border border-gray-200 px-3 py-2 focus:border-[#1A56DB] focus:outline-none" />
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <Button variant="outline" onClick={() => setHandleItem(null)}>取消</Button>
                <Button onClick={submitHandle}>保存</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'amber' | 'green' | 'red' }) {
  const color = {
    blue: 'text-blue-700',
    amber: 'text-amber-700',
    green: 'text-green-700',
    red: 'text-red-700',
  }[tone]
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
