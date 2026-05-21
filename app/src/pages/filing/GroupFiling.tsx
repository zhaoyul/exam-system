import { useMemo, useState } from 'react'
import { FileText, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendResourceList } from '@/hooks/useBackendListState'
import { useApp } from '@/context/AppContext'

interface FilingOrg {
  id: string
  name: string
  orgType: string
  creditCode: string
  contact: string
  phone: string
  address: string
  filingPlaces: string[]
  siteCount: number
  rejectCount: number
  materialCount: number
  projectCount: number
  staffCount: number
  supervisorCount: number
  assessorCount: number
  examRoomCount: number
}

const initialOrgs: FilingOrg[] = [
  { id: 'fo1', name: '中广测试有限公司', orgType: '全国性用人单位分支机构', creditCode: '123456789QWE123', contact: '张三', phone: '13412341234', address: '广东省深圳市大亚湾核电基地培训中心', filingPlaces: ['北京市', '广东省', '天津市'], siteCount: 1, rejectCount: 0, materialCount: 0, projectCount: 6, staffCount: 2, supervisorCount: 4, assessorCount: 6, examRoomCount: 1 },
  { id: 'fo2', name: '福建宁德核电有限公司', orgType: '全国性用人单位分支机构', creditCode: '91350900111111111X', contact: '李四', phone: '13512341234', address: '福建省宁德市', filingPlaces: ['福建省'], siteCount: 1, rejectCount: 0, materialCount: 6, projectCount: 5, staffCount: 12, supervisorCount: 3, assessorCount: 8, examRoomCount: 2 },
  { id: 'fo3', name: '防城港核电', orgType: '全国性用人单位分支机构', creditCode: '91450600111111111X', contact: '王五', phone: '13612341234', address: '广西防城港', filingPlaces: ['广西壮族自治区'], siteCount: 1, rejectCount: 0, materialCount: 6, projectCount: 6, staffCount: 9, supervisorCount: 3, assessorCount: 10, examRoomCount: 3 },
]

const tabs = ['备案材料', '站点信息', '认定项目', '工作人员', '督导人员', '考评人员', '考点信息']

export default function GroupFiling() {
  const { user } = useApp()
  const isBranch = user?.role === 'branch_admin'
  const backendOrgs = useBackendResourceList<FilingOrg>('/filing/group', initialOrgs)
  const orgs = useMemo(() => isBranch ? [initialOrgs[0]] : appendBackendItems(initialOrgs, backendOrgs), [backendOrgs, isBranch])
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('fo1')
  const [activeTab, setActiveTab] = useState('备案材料')
  const [dialog, setDialog] = useState<string | null>(null)

  const filtered = useMemo(() => orgs.filter(item => !search || item.name.includes(search)), [orgs, search])
  const selected = orgs.find(item => item.id === selectedId) || orgs[0]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">备案查看</h1>

      <section className="grid grid-cols-[300px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-3">
            <div className="text-sm font-semibold text-gray-900">分支机构</div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2 p-3">
            {filtered.map(org => (
              <button key={org.id} onClick={() => setSelectedId(org.id)} className={`w-full rounded-md border p-3 text-left ${selected?.id === org.id ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                <div className="font-medium text-gray-900">{org.name}</div>
                <div className="mt-2 text-xs text-gray-500">{org.siteCount}个站点</div>
                <div className="text-xs text-gray-500">退回:{org.rejectCount}次</div>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900"><FileText className="h-4 w-4 text-[#1A56DB]" />采集表</div>
            {selected && (
              <>
                <div className="text-lg font-semibold text-gray-900">{selected.orgType}{selected.name}</div>
                <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                  <div>统一社会信用代码：{selected.creditCode}</div>
                  <div>联系方式：{selected.contact}（{selected.phone}）</div>
                  <div className="md:col-span-2">联系地址：{selected.address || '-'}</div>
                  <div className="md:col-span-2">备案地：{selected.filingPlaces.join('、')}</div>
                </div>
              </>
            )}
          </section>

          <section className="grid grid-cols-7 gap-3">
            <Stat label="站点" value={selected?.siteCount || 0} />
            <Stat label="职业等级" value={selected?.projectCount || 0} />
            <Stat label="工作人员" value={selected?.staffCount || 0} />
            <Stat label="督导人员" value={selected?.supervisorCount || 0} />
            <Stat label="考评人员" value={selected?.assessorCount || 0} />
            <Stat label="考点" value={selected?.examRoomCount || 0} />
            <Stat label="备案材料" value={selected?.materialCount || 0} />
          </section>

          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
              {tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`h-8 rounded-md px-3 text-xs ${activeTab === tab ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{tab}</button>)}
            </div>
            <div className="min-h-56 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">{activeTab}</div>
                <Button size="sm" variant="outline" onClick={() => setDialog(activeTab)}>查看详情</Button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-3 py-2 text-left">序号</th><th className="px-3 py-2 text-left">名称</th><th className="px-3 py-2 text-left">状态</th><th className="px-3 py-2 text-left">操作</th></tr></thead>
                <tbody><tr><td className="px-3 py-3">1</td><td className="px-3 py-3">{selected?.name}-{activeTab}</td><td className="px-3 py-3 text-gray-600">已备案</td><td className="px-3 py-3"><button className="text-xs text-[#1A56DB] hover:underline">详情</button></td></tr></tbody>
              </table>
            </div>
          </section>
        </main>
      </section>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <Info label="机构" value={selected?.name || ''} />
            <Info label="备案地" value={selected?.filingPlaces.join('、') || ''} />
            <Info label="当前页签" value={dialog || ''} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-3 text-center"><MapPin className="mx-auto mb-1 h-4 w-4 text-[#1A56DB]" /><div className="text-xl font-bold text-gray-900">{value}个</div><div className="text-xs text-gray-500">{label}</div></div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>
}

function appendBackendItems(base: FilingOrg[], incoming: FilingOrg[]) {
  const knownIds = new Set(base.map(item => item.id))
  const knownNames = new Set(base.map(item => item.name))
  const extras = incoming.filter(item => item.id && item.name && !knownIds.has(item.id) && !knownNames.has(item.name))
  return [...base, ...extras]
}
