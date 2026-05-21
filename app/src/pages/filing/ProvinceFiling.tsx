import { useMemo, useState } from 'react'
import { FileText, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendResourceList, useBackendResourceState } from '@/hooks/useBackendListState'

interface SiteReview {
  id: string
  siteName: string
  previousExpireDate: string
  applyTime: string
  result: 'pending' | 'approved' | 'returned'
  reviewTime: string
  materialCount: number
  org: string
}

const initialRows: SiteReview[] = [
  { id: 'sr1', siteName: '中广测试有限公司北京站点', previousExpireDate: '2026-12-31', applyTime: '2026-04-17 11:20', result: 'pending', reviewTime: '-', materialCount: 5, org: '中广测试有限公司' },
  { id: 'sr2', siteName: '宁德核电培训中心', previousExpireDate: '2026-09-30', applyTime: '2026-03-26 09:10', result: 'approved', reviewTime: '2026-03-28 16:40', materialCount: 7, org: '福建宁德核电有限公司' },
]

const materialNames = ['场地平面图', '设备设施清单', '安全管理制度', '消防验收材料', '站点负责人承诺书', '现场照片', '复核申请表']

export default function ProvinceFiling() {
  const [items, setItems] = useBackendResourceState<SiteReview>('/filing/province', initialRows)
  const backendMaterials = useBackendResourceList('/file/receive', materialNames)
  const [keyword, setKeyword] = useState('')
  const [detail, setDetail] = useState<SiteReview | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ siteName: '', org: '', previousExpireDate: '', applyTime: '', materialCount: 0 })

  const filtered = useMemo(() => items.filter(item => !keyword || item.siteName.includes(keyword) || item.org.includes(keyword)), [items, keyword])

  const saveSite = () => {
    if (!form.siteName) return
    setItems(prev => [{
      id: `sr${Date.now()}`,
      siteName: form.siteName,
      org: form.org,
      previousExpireDate: form.previousExpireDate || '-',
      applyTime: form.applyTime || '2026-05-21 09:00',
      result: 'pending',
      reviewTime: '-',
      materialCount: Number(form.materialCount || 0),
    }, ...prev])
    setForm({ siteName: '', org: '', previousExpireDate: '', applyTime: '', materialCount: 0 })
    setAddOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">站点复核</h1>
        <Button onClick={() => setAddOpen(true)} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]"><Plus className="mr-1 h-4 w-4" />添 加</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="站点名称"
            className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
          />
        </div>
        <Button variant="outline" className="h-9">搜 索</Button>
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">序号</th>
              <th className="px-4 py-3 text-left font-medium">站点名称</th>
              <th className="px-4 py-3 text-left font-medium">申请前有效截止时间</th>
              <th className="px-4 py-3 text-left font-medium">申请时间</th>
              <th className="px-4 py-3 text-left font-medium">审核结果</th>
              <th className="px-4 py-3 text-left font-medium">审核时间</th>
              <th className="px-4 py-3 text-left font-medium">材料数量</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.siteName}</td>
                <td className="px-4 py-3 text-gray-600">{item.previousExpireDate}</td>
                <td className="px-4 py-3 text-gray-600">{item.applyTime}</td>
                <td className="px-4 py-3"><ResultBadge value={item.result} /></td>
                <td className="px-4 py-3 text-gray-600">{item.reviewTime}</td>
                <td className="px-4 py-3 text-gray-600">{item.materialCount}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(item)} className="text-xs text-[#1A56DB] hover:underline">查看材料</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>站点复核材料</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3">
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">{detail.siteName} · {detail.org}</div>
              <div className="space-y-2">
                {backendMaterials.map((name, index) => (
                  <div key={String(name)} className="flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm">
                    <FileText className={`h-4 w-4 ${index < detail.materialCount ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={index < detail.materialCount ? 'text-gray-900' : 'text-gray-400'}>{String(name)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>添加站点复核</DialogTitle></DialogHeader>
          <div className="grid gap-3 text-sm">
            <Field label="站点名称" value={form.siteName} onChange={value => setForm(prev => ({ ...prev, siteName: value }))} />
            <Field label="申请机构" value={form.org} onChange={value => setForm(prev => ({ ...prev, org: value }))} />
            <Field label="申请前有效截止时间" value={form.previousExpireDate} onChange={value => setForm(prev => ({ ...prev, previousExpireDate: value }))} />
            <Field label="申请时间" value={form.applyTime} onChange={value => setForm(prev => ({ ...prev, applyTime: value }))} />
            <Field label="材料数量" value={String(form.materialCount)} onChange={value => setForm(prev => ({ ...prev, materialCount: Number(value) }))} />
          </div>
          <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={saveSite}>保存</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ResultBadge({ value }: { value: SiteReview['result'] }) {
  const label = value === 'approved' ? '审核通过' : value === 'returned' ? '退回' : '待审核'
  const cls = value === 'approved' ? 'bg-green-50 text-green-700' : value === 'returned' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
  return <span className={`rounded px-2 py-0.5 text-xs ${cls}`}>{label}</span>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1"><span className="text-gray-600">{label}</span><input value={value} onChange={event => onChange(event.target.value)} className="h-9 rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" /></label>
}
