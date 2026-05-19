import { useMemo, useState, type FormEvent } from 'react'
import { BookOpen, CheckCircle2, Edit3, FileText, KeyRound, Plus, Search, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type MarkStatus = '待分配' | '评分中' | '已完成'

interface MarkingTask {
  id: string
  planName: string
  subject: string
  paperType: '理论简答题' | '技能评分表'
  candidates: number
  experts: string[]
  leader: string
  rule: string
  diffRange: number
  progress: number
  status: MarkStatus
}

const initialTasks: MarkingTask[] = [
  { id: 'm1', planName: '2026年第一批核反应堆运行值班员三级认定', subject: '理论简答题', paperType: '理论简答题', candidates: 45, experts: ['陈建国', '刘秀芳'], leader: '陈建国', rule: '双评差值不超过5分，超差进入仲裁', diffRange: 5, progress: 68, status: '评分中' },
  { id: 'm2', planName: '2026年第一批电气试验员四级认定', subject: '技能评分表', paperType: '技能评分表', candidates: 32, experts: ['刘秀芳', '黄志强'], leader: '刘秀芳', rule: '组长确认最终得分', diffRange: 8, progress: 100, status: '已完成' },
  { id: 'm3', planName: '2026年第二批机械设备检修工三级认定', subject: '理论简答题', paperType: '理论简答题', candidates: 28, experts: [], leader: '', rule: '未设置', diffRange: 5, progress: 0, status: '待分配' },
]

const expertOptions = ['陈建国', '刘秀芳', '黄志强', '赵丽华']

interface ScoreWorker {
  id: string
  name: string
  loginName: string
  password: string
  phone: string
}

const initialWorkers: ScoreWorker[] = [
  { id: 'sw-1', name: '陈建国', loginName: '440301197801011234', password: '123456', phone: '13800138001' },
  { id: 'sw-2', name: '刘秀芳', loginName: '440301198206063456', password: '123456', phone: '13800138002' },
]

export default function MarkingLeadPage() {
  const [workers, setWorkers] = useState<ScoreWorker[]>(initialWorkers)
  const [tasks, setTasks] = useState<MarkingTask[]>(initialTasks)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'全部' | MarkStatus>('全部')
  const [dialog, setDialog] = useState<'worker' | 'expert' | 'rule' | 'score' | null>(null)
  const [active, setActive] = useState<MarkingTask | null>(null)
  const [editingWorker, setEditingWorker] = useState<ScoreWorker | null>(null)

  const filtered = useMemo(() => tasks.filter(task => {
    const byStatus = status === '全部' || task.status === status
    const bySearch = !search || task.planName.includes(search) || task.subject.includes(search)
    return byStatus && bySearch
  }), [search, status, tasks])

  const saveExperts = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!active) return
    const fd = new FormData(event.currentTarget)
    const experts = fd.getAll('experts').map(String)
    const leader = String(fd.get('leader') || experts[0] || '')
    setTasks(prev => prev.map(item => item.id === active.id ? { ...item, experts, leader, status: experts.length ? '评分中' : '待分配' } : item))
    setDialog(null)
    toast.success('阅卷专家已分配')
  }

  const saveWorker = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next = {
      name: String(fd.get('name') || ''),
      loginName: String(fd.get('loginName') || ''),
      password: String(fd.get('password') || ''),
      phone: String(fd.get('phone') || ''),
    }
    if (editingWorker) {
      setWorkers(prev => prev.map(item => item.id === editingWorker.id ? { ...item, ...next } : item))
      toast.success('阅卷负责人已更新')
    } else {
      setWorkers(prev => [{ ...next, id: `sw-${Date.now()}` }, ...prev])
      toast.success('新增阅卷负责人')
    }
    setEditingWorker(null)
    setDialog(null)
  }

  const resetWorkerPassword = (worker: ScoreWorker) => {
    setWorkers(prev => prev.map(item => item.id === worker.id ? { ...item, password: '123456' } : item))
    toast.success('密码重置成功')
  }

  const saveRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!active) return
    const fd = new FormData(event.currentTarget)
    setTasks(prev => prev.map(item => item.id === active.id ? { ...item, rule: String(fd.get('rule') || ''), diffRange: Number(fd.get('diffRange') || 5) } : item))
    setDialog(null)
    toast.success('阅卷规则已保存')
  }

  const finishMarking = (task: MarkingTask) => {
    setTasks(prev => prev.map(item => item.id === task.id ? { ...item, progress: 100, status: '已完成' } : item))
    toast.success('阅卷评分已结束，成绩已回写成绩管理')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">阅卷负责</h1>
          <p className="mt-1 text-sm text-gray-500">维护阅卷负责人账号，并按设计文档管理阅卷专家、规则、评分进度和结束阅卷</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingWorker(null); setDialog('worker') }}><Plus className="mr-2 h-4 w-4" />新增阅卷负责人</Button>
          <Button variant="outline" onClick={() => toast.success('阅卷任务已从成绩管理同步')}><BookOpen className="mr-2 h-4 w-4" />同步阅卷任务</Button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-900">阅卷负责人账号</div>
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">姓名</th><th className="px-4 py-3 text-left font-medium">登录账号</th><th className="px-4 py-3 text-left font-medium">联系电话</th><th className="px-4 py-3 text-left font-medium">操作</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workers.map((worker, index) => (
              <tr key={worker.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{worker.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{worker.loginName}</td>
                <td className="px-4 py-3 text-gray-600">{worker.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingWorker(worker); setDialog('worker') }} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-1 inline h-3.5 w-3.5" />编辑</button>
                    <button onClick={() => resetWorkerPassword(worker)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><KeyRound className="mr-1 inline h-3.5 w-3.5" />重置密码</button>
                    <button onClick={() => { setWorkers(prev => prev.filter(item => item.id !== worker.id)); toast.success('阅卷负责人已删除') }} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="阅卷任务" value={tasks.length} />
        <Stat label="评分中" value={tasks.filter(item => item.status === '评分中').length} />
        <Stat label="已完成" value={tasks.filter(item => item.status === '已完成').length} />
        <Stat label="阅卷专家" value={new Set(tasks.flatMap(item => item.experts)).size} />
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex gap-2">{(['全部', '待分配', '评分中', '已完成'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}</div>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="计划名称 / 阅卷科目" className="h-9 w-80 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">认定计划</th><th className="px-4 py-3 text-left font-medium">阅卷科目</th><th className="px-4 py-3 text-right font-medium">考生</th><th className="px-4 py-3 text-left font-medium">阅卷专家</th><th className="px-4 py-3 text-left font-medium">组长</th><th className="px-4 py-3 text-left font-medium">规则</th><th className="px-4 py-3 text-left font-medium">进度</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{filtered.map(task => <tr key={task.id} className="hover:bg-gray-50"><td className="max-w-[320px] px-4 py-3 font-medium text-gray-900"><FileText className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{task.planName}</td><td className="px-4 py-3 text-gray-600">{task.paperType}</td><td className="px-4 py-3 text-right">{task.candidates}</td><td className="px-4 py-3 text-gray-600">{task.experts.join('、') || '--'}</td><td className="px-4 py-3 text-gray-600">{task.leader || '--'}</td><td className="px-4 py-3 text-xs text-gray-500">{task.rule}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#1A56DB]" style={{ width: `${task.progress}%` }} /></div><Badge className={task.status === '已完成' ? 'bg-green-50 text-green-700' : task.status === '评分中' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}>{task.status}</Badge></div></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => { setActive(task); setDialog('expert') }} className="text-xs text-[#1A56DB] hover:underline"><Users className="mr-0.5 inline h-3.5 w-3.5" />添加阅卷专家</button><button onClick={() => { setActive(task); setDialog('rule') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />添加规则</button><button onClick={() => { setActive(task); setDialog('score') }} className="text-xs text-gray-600 hover:text-[#1A56DB]">专家评分</button><button onClick={() => finishMarking(task)} className="text-xs text-green-600 hover:underline"><CheckCircle2 className="mr-0.5 inline h-3.5 w-3.5" />结束</button></div></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <Dialog open={dialog === 'worker'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>{editingWorker ? '编辑阅卷负责人' : '新增阅卷负责人'}</DialogTitle></DialogHeader><form onSubmit={saveWorker} className="space-y-3 text-sm"><label className="block"><span className="font-medium text-gray-700">姓　　名：</span><input name="name" required defaultValue={editingWorker?.name || ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label><label className="block"><span className="font-medium text-gray-700">登录账号：</span><input name="loginName" required placeholder="请使用身份证号" defaultValue={editingWorker?.loginName || ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label><label className="block"><span className="font-medium text-gray-700">密　　码：</span><input name="password" required defaultValue={editingWorker?.password || '123456'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label><label className="block"><span className="font-medium text-gray-700">联系电话：</span><input name="phone" required defaultValue={editingWorker?.phone || ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>返回</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'expert'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>添加阅卷专家</DialogTitle></DialogHeader><form onSubmit={saveExperts} className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-2">{expertOptions.map(name => <label key={name} className="rounded-md border border-gray-100 px-3 py-2"><input type="checkbox" name="experts" value={name} defaultChecked={active?.experts.includes(name)} className="mr-2" />{name}</label>)}</div><label className="block"><span className="font-medium text-gray-700">阅卷组长</span><select name="leader" defaultValue={active?.leader || expertOptions[0]} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{expertOptions.map(name => <option key={name}>{name}</option>)}</select></label><div className="flex justify-end"><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'rule'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>添加阅卷规则</DialogTitle></DialogHeader><form onSubmit={saveRule} className="space-y-3 text-sm"><label className="block"><span className="font-medium text-gray-700">阅卷规则</span><textarea name="rule" defaultValue={active?.rule} className="mt-1 h-24 w-full rounded-md border border-gray-200 px-3 py-2" /></label><label className="block"><span className="font-medium text-gray-700">差值范围</span><input name="diffRange" type="number" defaultValue={active?.diffRange || 5} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label><div className="rounded-md bg-[#F9FAFB] p-3 text-xs text-gray-500">定义阅卷组长、组员、差值范围、超差处理和最终得分方式。</div><div className="flex justify-end"><Button type="submit">保存规则</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'score'} onOpenChange={() => setDialog(null)}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>专家评分</DialogTitle></DialogHeader><div className="space-y-2 text-sm">{['张三', '李四', '王五'].map((name, index) => <div key={name} className="grid grid-cols-[1fr_100px_100px_100px] items-center gap-2 rounded-md border border-gray-100 px-3 py-2"><span>{name}</span><span>一评 {80 + index}</span><span>二评 {82 + index}</span><Badge className="bg-blue-50 text-blue-700">待提交</Badge></div>)}<div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('专家评分已提交') }}>提交评分</Button></div></div></DialogContent></Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div>
}
