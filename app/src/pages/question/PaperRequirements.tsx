import { useMemo, useState, type FormEvent } from 'react'
import { Edit3, FileText, Plus, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type ReqStatus = '未配卷' | '已配卷'

interface PaperRequirement {
  id: string
  item: string
  examType: string
  remark: string
  examTime: string
  applicants: number
  paperNo: string
  status: ReqStatus
}

const initialReqs: PaperRequirement[] = [
  { id: 'rq1', item: '电工三级理论考试A卷需求', examType: '正式考试', remark: '集团统考', examTime: '2026-06-12 09:00', applicants: 42, paperNo: 'L-20260612-A', status: '已配卷' },
  { id: 'rq2', item: '电工四级理论补考卷需求', examType: '补考', remark: '分支机构补考', examTime: '2026-06-20 14:00', applicants: 18, paperNo: '', status: '未配卷' },
]

export default function PaperRequirements() {
  const [reqs, setReqs] = useBackendListState<PaperRequirement>(initialReqs)
  const [status, setStatus] = useState<ReqStatus>('已配卷')
  const [dialog, setDialog] = useState<'add' | 'item' | 'paper' | null>(null)
  const [active, setActive] = useState<PaperRequirement | null>(null)

  const filtered = useMemo(() => reqs.filter(req => req.status === status), [reqs, status])

  const saveReq = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: PaperRequirement = {
      id: active?.id || String(Date.now()),
      item: String(fd.get('item') || ''),
      examType: String(fd.get('examType') || '正式考试'),
      remark: String(fd.get('remark') || ''),
      examTime: String(fd.get('examTime') || ''),
      applicants: Number(fd.get('applicants') || 0),
      paperNo: String(fd.get('paperNo') || ''),
      status: String(fd.get('status') || '未配卷') as ReqStatus,
    }
    if (!next.item) {
      toast.error('请填写试卷需求项')
      return
    }
    setReqs(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '试卷需求已更新' : '试卷需求已添加')
  }

  const assignPaper = () => {
    if (!active) return
    setReqs(prev => prev.map(req => req.id === active.id ? { ...req, status: '已配卷', paperNo: req.paperNo || `L-${Date.now()}` } : req))
    setDialog(null)
    toast.success('试卷已配置')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">试卷需求</h1>
        <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-1.5 h-3.5 w-3.5" />添加</Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-0 border-b border-gray-100 px-4 py-3">
          {(['已配卷', '未配卷'] as const).map(item => (
            <button key={item} onClick={() => setStatus(item)} className={`h-8 px-4 text-sm ${status === item ? 'border-b-2 border-[#1A56DB] font-medium text-[#1A56DB]' : 'text-gray-600 hover:text-[#1A56DB]'}`}>{item}</button>
          ))}
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">试卷需求项</th>
                <th className="px-4 py-3 text-left font-medium">考试类型</th>
                <th className="px-4 py-3 text-left font-medium">备注</th>
                <th className="px-4 py-3 text-left font-medium">考试时间</th>
                <th className="px-4 py-3 text-left font-medium">报名人数</th>
                <th className="px-4 py-3 text-left font-medium">试卷编号</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req, index) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900"><FileText className="mr-1.5 inline h-4 w-4 text-[#1A56DB]" />{req.item}</td>
                  <td className="px-4 py-3 text-gray-600">{req.examType}</td>
                  <td className="px-4 py-3 text-gray-600">{req.remark}</td>
                  <td className="px-4 py-3 text-gray-600">{req.examTime}</td>
                  <td className="px-4 py-3 text-gray-600">{req.applicants}</td>
                  <td className="px-4 py-3 text-gray-600">{req.paperNo || '-'}</td>
                  <td className="px-4 py-3"><Badge className={req.status === '已配卷' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>{req.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => { setActive(req); setDialog('add') }} className="text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => { setActive(req); setDialog('item') }} className="text-[#1A56DB] hover:underline">需求项</button>
                      <button onClick={() => { setActive(req); setDialog('paper') }} className="text-green-600 hover:underline"><Shuffle className="mr-0.5 inline h-3.5 w-3.5" />试卷</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{active ? '编辑试卷需求' : '添加试卷需求'}</DialogTitle></DialogHeader>
          <form onSubmit={saveReq} className="space-y-3 text-sm">
            <Field label="试卷需求项" name="item" defaultValue={active?.item} />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="考试类型" name="examType" defaultValue={active?.examType || '正式考试'} options={['正式考试', '补考', '模拟考试']} />
              <SelectField label="状态" name="status" defaultValue={active?.status || '未配卷'} options={['已配卷', '未配卷']} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="考试时间" name="examTime" defaultValue={active?.examTime} />
              <Field label="报名人数" name="applicants" defaultValue={String(active?.applicants || 0)} type="number" />
            </div>
            <Field label="试卷编号" name="paperNo" defaultValue={active?.paperNo} />
            <Field label="备注" name="remark" defaultValue={active?.remark} />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'item'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>需求项</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <Info label="试卷需求项" value={active?.item || ''} />
            <Info label="考试类型" value={active?.examType || ''} />
            <Info label="报名人数" value={String(active?.applicants || 0)} />
            <div className="flex justify-end"><Button onClick={() => setDialog(null)}>确定</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'paper'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>试卷</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-md bg-[#F9FAFB] p-3">需求：{active?.item}</div>
            <div className="rounded-md border border-dashed border-[#1A56DB] p-5 text-center text-[#1A56DB]">点击“配卷”后生成并绑定试卷编号</div>
            <div className="flex justify-end"><Button onClick={assignPaper}>配卷</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>
}
