import { useMemo, useState } from 'react'
import { Plus, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type ReqStatus = '待配置' | '已配置' | '已推送'
type AssembleMode = '题库组卷' | '卷库' | '非题库组卷' | '不传试卷'

interface SkillReq {
  id: string
  profession: string
  level: string
  name: string
  assembleMode: AssembleMode
  examType: '技能考试' | '补考' | '模拟考试'
  candidateCount: number
  specialRule: string
  attachmentName: string
  status: ReqStatus
  pushedAt: string
}

const initialReqs: SkillReq[] = [
  { id: 'skr1', profession: '汽轮机检修工', level: '三级', name: '汽轮机检修工三级实操任务书', assembleMode: '非题库组卷', examType: '技能考试', candidateCount: 18, specialRule: '上传任务书附件并设置工位', attachmentName: 'task-book-v3.pdf', status: '待配置', pushedAt: '' },
]

export default function SkillPaperRequirements() {
  const [reqs, setReqs] = useBackendListState<SkillReq>(initialReqs)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'全部' | ReqStatus>('全部')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [active, setActive] = useState<SkillReq | null>(null)

  const filtered = useMemo(() => reqs.filter(req => {
    const byStatus = status === '全部' || req.status === status
    const bySearch = !search || [req.name, req.profession, req.level].join(' ').includes(search)
    return byStatus && bySearch
  }), [reqs, search, status])

  const saveReq = (next: SkillReq) => {
    setReqs(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialogOpen(false)
    setActive(null)
    toast.success(active ? '技能试卷需求已更新' : '技能试卷需求已添加')
  }

  const pushRequirement = (id: string) => {
    setReqs(prev => prev.map(item => item.id === id ? { ...item, status: '已推送', pushedAt: new Date().toLocaleString('zh-CN') } : item))
    toast.success('技能试卷需求已推送')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">技能试卷需求</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">需求名称</span>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
          <div className="flex gap-2">{(['全部', '待配置', '已配置', '已推送'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{item}</button>)}</div>
          <div className="ml-auto flex gap-2">
            <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setActive(null); setDialogOpen(true) }}><Plus className="mr-1.5 h-3.5 w-3.5" />新增需求</Button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">职业工种</th>
                <th className="px-4 py-3 text-left font-medium">级别</th>
                <th className="px-4 py-3 text-left font-medium">需求名称</th>
                <th className="px-4 py-3 text-left font-medium">组卷方式</th>
                <th className="px-4 py-3 text-left font-medium">考生数量</th>
                <th className="px-4 py-3 text-left font-medium">特殊要求</th>
                <th className="px-4 py-3 text-left font-medium">附件</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req, index) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3"><Badge className={req.status === '已推送' ? 'bg-green-50 text-green-700' : req.status === '已配置' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}>{req.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-900">{req.profession}</td>
                  <td className="px-4 py-3 text-gray-600">{req.level}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{req.name}</td>
                  <td className="px-4 py-3 text-gray-600">{req.assembleMode}</td>
                  <td className="px-4 py-3 text-gray-600">{req.candidateCount}</td>
                  <td className="px-4 py-3 text-gray-600">{req.specialRule}</td>
                  <td className="px-4 py-3 text-gray-600">{req.attachmentName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => { setActive(req); setDialogOpen(true) }} className="text-[#1A56DB] hover:underline">编辑</button>
                      {req.status !== '已推送' && <button onClick={() => pushRequirement(req.id)} className="text-green-600 hover:underline"><Send className="mr-0.5 inline h-3.5 w-3.5" />推送</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <SkillRequirementDialog
        open={dialogOpen}
        initial={active}
        onClose={() => { setDialogOpen(false); setActive(null) }}
        onSave={saveReq}
      />
    </div>
  )
}

function SkillRequirementDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  initial: SkillReq | null
  onClose: () => void
  onSave: (next: SkillReq) => void
}) {
  const [profession, setProfession] = useState(initial?.profession || '汽轮机检修工')
  const [level, setLevel] = useState(initial?.level || '三级')
  const [name, setName] = useState(initial?.name || '')
  const [assembleMode, setAssembleMode] = useState<AssembleMode>(initial?.assembleMode || '非题库组卷')
  const [candidateCount, setCandidateCount] = useState(String(initial?.candidateCount || 0))
  const [specialRule, setSpecialRule] = useState(initial?.specialRule || '')
  const [attachmentName, setAttachmentName] = useState(initial?.attachmentName || '')

  const handleSave = () => {
    if (!name) {
      toast.error('请填写需求名称')
      return
    }
    if (assembleMode === '非题库组卷' && !attachmentName) {
      toast.error('非题库组卷需上传实操任务书或评分表附件')
      return
    }
    onSave({
      id: initial?.id || String(Date.now()),
      profession,
      level,
      name,
      assembleMode,
      examType: '技能考试',
      candidateCount: Number(candidateCount) || 0,
      specialRule,
      attachmentName,
      status: initial?.status || '待配置',
      pushedAt: initial?.pushedAt || '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{initial ? '编辑技能试卷需求' : '新增技能试卷需求'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <SelectField label="职业工种" value={profession} onChange={setProfession} options={['汽轮机检修工', '核反应堆运行值班员', '机械设备检修工']} />
          <SelectField label="级别" value={level} onChange={setLevel} options={['一级', '二级', '三级', '四级', '五级']} />
          <Field label="需求名称" value={name} onChange={setName} />
          <SelectField label="组卷方式" value={assembleMode} onChange={value => setAssembleMode(value as AssembleMode)} options={['题库组卷', '卷库', '非题库组卷', '不传试卷']} />
          <Field label="考生数量" value={candidateCount} onChange={setCandidateCount} type="number" />
          <Field label="附件名称" value={attachmentName} onChange={setAttachmentName} placeholder="请输入评分表/任务书附件名" />
          <label className="col-span-2 block">
            <span className="font-medium text-gray-700">特殊要求</span>
            <textarea value={specialRule} onChange={event => setSpecialRule(event.target.value)} className="mt-1 min-h-24 w-full rounded-md border border-gray-200 px-3 py-2" />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>取消</Button>
          <Button type="button" onClick={handleSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select value={value} onChange={event => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
