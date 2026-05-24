import { useMemo, useState } from 'react'
import { Edit3, FileText, Plus, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type ReqStatus = '待配置' | '已配置' | '已推送'
type AssembleMode = '题库组卷' | '卷库' | '非题库组卷' | '不传试卷'

interface PaperRequirement {
  id: string
  profession: string
  level: string
  name: string
  assembleMode: AssembleMode
  examType: '理论考试' | '补考' | '模拟考试'
  candidateCount: number
  remark: string
  paperNo: string
  attachmentName: string
  status: ReqStatus
  pushedAt: string
}

const initialReqs: PaperRequirement[] = [
  {
    id: 'rq1',
    profession: '核反应堆操作员',
    level: '三级',
    name: '核反应堆操作员三级理论考试',
    assembleMode: '题库组卷',
    examType: '理论考试',
    candidateCount: 42,
    remark: '千人千卷',
    paperNo: '',
    attachmentName: '',
    status: '待配置',
    pushedAt: '',
  },
  {
    id: 'rq2',
    profession: '电气维修工',
    level: '四级',
    name: '电气维修工四级理论考试',
    assembleMode: '卷库',
    examType: '理论考试',
    candidateCount: 26,
    remark: '统一使用卷库抽取结果',
    paperNo: 'LL-202605-01',
    attachmentName: '',
    status: '已推送',
    pushedAt: '2026-05-18 15:30',
  },
]

export default function PaperRequirements() {
  const [reqs, setReqs] = useBackendListState<PaperRequirement>(initialReqs)
  const [status, setStatus] = useState<'全部' | ReqStatus>('全部')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<'edit' | 'detail' | null>(null)
  const [active, setActive] = useState<PaperRequirement | null>(null)

  const filtered = useMemo(() => reqs.filter(req => {
    const byStatus = status === '全部' || req.status === status
    const bySearch = !search || [req.name, req.profession, req.level, req.remark].join(' ').includes(search)
    return byStatus && bySearch
  }), [reqs, search, status])

  const saveReq = (next: PaperRequirement) => {
    setReqs(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '试卷需求已更新' : '试卷需求已添加')
  }

  const configurePaper = () => {
    if (!active) return
    setReqs(prev => prev.map(req => req.id === active.id
      ? {
          ...req,
          status: '已配置',
          paperNo: req.paperNo || `LL-${new Date().getFullYear()}${String(prev.findIndex(item => item.id === req.id) + 1).padStart(3, '0')}`,
        }
      : req))
    setDialog(null)
    toast.success('试卷需求已配置')
  }

  const pushPaper = (id: string) => {
    setReqs(prev => prev.map(req => req.id === id ? { ...req, status: '已推送', pushedAt: new Date().toLocaleString('zh-CN') } : req))
    toast.success('试卷需求已推送')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">理论试卷需求</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">职业工种/需求名称</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
          <div className="flex gap-2">
            {(['全部', '待配置', '已配置', '已推送'] as const).map(item => (
              <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{item}</button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setActive(null); setDialog('edit') }}><Plus className="mr-1.5 h-3.5 w-3.5" />新增需求</Button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">职业工种</th>
                <th className="px-4 py-3 text-left font-medium">级别</th>
                <th className="px-4 py-3 text-left font-medium">需求名称</th>
                <th className="px-4 py-3 text-left font-medium">组卷方式</th>
                <th className="px-4 py-3 text-left font-medium">考试类型</th>
                <th className="px-4 py-3 text-left font-medium">考生数量</th>
                <th className="px-4 py-3 text-left font-medium">试卷编号/附件</th>
                <th className="px-4 py-3 text-left font-medium">备注</th>
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
                  <td className="px-4 py-3 font-medium text-gray-900"><FileText className="mr-1.5 inline h-4 w-4 text-[#1A56DB]" />{req.name}</td>
                  <td className="px-4 py-3 text-gray-600">{req.assembleMode}</td>
                  <td className="px-4 py-3 text-gray-600">{req.examType}</td>
                  <td className="px-4 py-3 text-gray-600">{req.candidateCount}</td>
                  <td className="px-4 py-3 text-gray-600">{req.paperNo || req.attachmentName || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{req.remark}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => { setActive(req); setDialog('edit') }} className="text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => { setActive(req); setDialog('detail') }} className="text-[#1A56DB] hover:underline">查看</button>
                      {req.status === '待配置' && <button onClick={() => { setActive(req); configurePaper() }} className="text-purple-600 hover:underline">配置试卷</button>}
                      {req.status !== '已推送' && <button onClick={() => pushPaper(req.id)} className="text-green-600 hover:underline"><Send className="mr-0.5 inline h-3.5 w-3.5" />推送</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <RequirementDialog
        open={dialog === 'edit'}
        initial={active}
        onClose={() => { setDialog(null); setActive(null) }}
        onSave={saveReq}
      />

      <Dialog open={dialog === 'detail'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>试卷需求详情</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <Info label="职业工种" value={active?.profession || ''} />
            <Info label="级别" value={active?.level || ''} />
            <Info label="组卷方式" value={active?.assembleMode || ''} />
            <Info label="考试类型" value={active?.examType || ''} />
            <Info label="考生数量" value={String(active?.candidateCount || 0)} />
            <Info label="试卷编号/附件" value={active?.paperNo || active?.attachmentName || '-'} />
            <Info label="备注" value={active?.remark || ''} />
            <div className="flex justify-end"><Button onClick={() => setDialog(null)}>确定</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RequirementDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  initial: PaperRequirement | null
  onClose: () => void
  onSave: (next: PaperRequirement) => void
}) {
  const [profession, setProfession] = useState(initial?.profession || '核反应堆操作员')
  const [level, setLevel] = useState(initial?.level || '三级')
  const [name, setName] = useState(initial?.name || '')
  const [assembleMode, setAssembleMode] = useState<AssembleMode>(initial?.assembleMode || '题库组卷')
  const [examType, setExamType] = useState<PaperRequirement['examType']>(initial?.examType || '理论考试')
  const [candidateCount, setCandidateCount] = useState(String(initial?.candidateCount || 0))
  const [paperNo, setPaperNo] = useState(initial?.paperNo || '')
  const [attachmentName, setAttachmentName] = useState(initial?.attachmentName || '')
  const [remark, setRemark] = useState(initial?.remark || '')

  const handleSave = () => {
    if (!name) {
      toast.error('请填写需求名称')
      return
    }
    if (assembleMode === '非题库组卷' && (!paperNo || !attachmentName)) {
      toast.error('非题库组卷需同时填写试卷编号并上传试题附件')
      return
    }
    onSave({
      id: initial?.id || String(Date.now()),
      profession,
      level,
      name,
      assembleMode,
      examType,
      candidateCount: Number(candidateCount) || 0,
      paperNo,
      attachmentName,
      remark,
      status: initial?.status || '待配置',
      pushedAt: initial?.pushedAt || '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{initial ? '编辑试卷需求' : '新增试卷需求'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <SelectField label="职业工种" value={profession} onChange={setProfession} options={['核反应堆操作员', '电气维修工', '汽轮机检修工']} />
          <SelectField label="级别" value={level} onChange={setLevel} options={['一级', '二级', '三级', '四级', '五级']} />
          <Field label="需求名称" value={name} onChange={setName} />
          <SelectField label="组卷方式" value={assembleMode} onChange={value => setAssembleMode(value as AssembleMode)} options={['题库组卷', '卷库', '非题库组卷', '不传试卷']} />
          <SelectField label="考试类型" value={examType} onChange={value => setExamType(value as PaperRequirement['examType'])} options={['理论考试', '补考', '模拟考试']} />
          <Field label="考生数量" value={candidateCount} onChange={setCandidateCount} type="number" />
          {(assembleMode === '题库组卷' || assembleMode === '卷库') && <Field label="试卷编号" value={paperNo} onChange={setPaperNo} placeholder="可为空，由系统生成" />}
          {assembleMode === '非题库组卷' && <Field label="试卷编号" value={paperNo} onChange={setPaperNo} placeholder="请输入纸质试卷编号" />}
          {assembleMode === '非题库组卷' && <Field label="试题附件" value={attachmentName} onChange={setAttachmentName} placeholder="请输入上传附件名称" />}
          {assembleMode === '不传试卷' && <div className="col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">选择“不传试卷”后，本需求仅记录考试用途与考生数量，不执行回推。</div>}
          <label className="col-span-2 block">
            <span className="font-medium text-gray-700">备注</span>
            <textarea value={remark} onChange={event => setRemark(event.target.value)} className="mt-1 min-h-24 w-full rounded-md border border-gray-200 px-3 py-2" />
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

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>
}
