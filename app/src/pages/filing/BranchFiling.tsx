import { useMemo, useState } from 'react'
import { CheckCircle, MapPin, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendResourceState } from '@/hooks/useBackendListState'

interface FilingAudit {
  id: string
  org: string
  orgType: string
  filingType: string
  filingPlace: string
  submitTime: string
  status: 'reviewing' | 'approved' | 'returned'
  siteCount: number
  projectCount: number
  staffCount: number
  supervisorCount: number
  assessorCount: number
  examRoomCount: number
  rejectReason?: string
}

const initialRows: FilingAudit[] = [
  { id: 'fa1', org: '中广测试有限公司', orgType: '全国性用人单位分支机构', filingType: '初次备案', filingPlace: '天津市', submitTime: '2026-04-17', status: 'reviewing', siteCount: 1, projectCount: 3, staffCount: 0, supervisorCount: 0, assessorCount: 0, examRoomCount: 0 },
  { id: 'fa2', org: '福建宁德核电有限公司', orgType: '全国性用人单位分支机构', filingType: '变更备案', filingPlace: '福建省', submitTime: '2026-03-11', status: 'approved', siteCount: 1, projectCount: 5, staffCount: 12, supervisorCount: 3, assessorCount: 8, examRoomCount: 2 },
  { id: 'fa3', org: '防城港核电', orgType: '全国性用人单位分支机构', filingType: '初次备案', filingPlace: '广西壮族自治区', submitTime: '2026-02-26', status: 'approved', siteCount: 1, projectCount: 6, staffCount: 9, supervisorCount: 3, assessorCount: 10, examRoomCount: 3 },
]

export default function BranchFiling() {
  const [rows, setRows] = useBackendResourceState<FilingAudit>('/filing/branch', initialRows)
  const [status, setStatus] = useState<FilingAudit['status']>('reviewing')
  const [detail, setDetail] = useState<FilingAudit | null>(null)
  const [auditTarget, setAuditTarget] = useState<FilingAudit | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const visibleRows = useMemo(() => rows.filter(row => row.status === status), [rows, status])
  const counts = {
    reviewing: rows.filter(row => row.status === 'reviewing').length,
    approved: rows.filter(row => row.status === 'approved').length,
    returned: rows.filter(row => row.status === 'returned').length,
  }
  const updateAuditStatus = (item: FilingAudit, nextStatus: FilingAudit['status']) => {
    const updated = { ...item, status: nextStatus, rejectReason: nextStatus === 'returned' ? rejectReason.trim() : undefined }
    setRows(prev => prev.map(row => row.id === item.id ? updated : row))
    setAuditTarget(null)
    setRejectReason('')
    setStatus(nextStatus)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">集团审核</h1>

      <div className="flex gap-2">
        <Tab active={status === 'reviewing'} onClick={() => setStatus('reviewing')}>正在审核({counts.reviewing}个)</Tab>
        <Tab active={status === 'approved'} onClick={() => setStatus('approved')}>审核通过({counts.approved}个)</Tab>
        <Tab active={status === 'returned'} onClick={() => setStatus('returned')}>退回({counts.returned}个)</Tab>
      </div>

      <section className="space-y-4">
        {visibleRows.map(item => (
          <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-[#1A56DB]" />备案地：{item.filingPlace}</span>
                <span>提交时间：{item.submitTime}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetail(item)}>查看详情</Button>
                {item.status === 'reviewing' && <Button size="sm" className="bg-[#1A56DB] hover:bg-[#1748B5]" onClick={() => setAuditTarget(item)}>审核</Button>}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
              <div className="space-y-2 text-sm">
                <Info label="备案类型" value={item.filingType} />
                <Info label="申请机构" value={item.org} />
                <Info label="机构类型" value={item.orgType} />
                {item.status === 'returned' && item.rejectReason && <Info label="退回原因" value={item.rejectReason} />}
              </div>
              <div className="grid grid-cols-6 gap-3">
                <Stat label="站点" value={item.siteCount} />
                <Stat label="职业等级" value={item.projectCount} />
                <Stat label="工作人员" value={item.staffCount} />
                <Stat label="督导人员" value={item.supervisorCount} />
                <Stat label="考评人员" value={item.assessorCount} />
                <Stat label="考点" value={item.examRoomCount} />
              </div>
            </div>
          </article>
        ))}
        {visibleRows.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">暂无数据</div>
        )}
      </section>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>集团审核详情</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <div className="font-semibold text-gray-900">{detail.org}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-gray-600">
                  <span>备案类型：{detail.filingType}</span>
                  <span>备案地：{detail.filingPlace}</span>
                  <span>提交时间：{detail.submitTime}</span>
                  <span>机构类型：{detail.orgType}</span>
                </div>
                {detail.status === 'returned' && detail.rejectReason && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-red-700">退回原因：{detail.rejectReason}</div>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="站点" value={detail.siteCount} />
                <Stat label="职业等级" value={detail.projectCount} />
                <Stat label="工作人员" value={detail.staffCount} />
                <Stat label="督导人员" value={detail.supervisorCount} />
                <Stat label="考评人员" value={detail.assessorCount} />
                <Stat label="考点" value={detail.examRoomCount} />
              </div>
              <div className="rounded-lg border border-gray-200">
                <div className="border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-900">本次备案信息明细</div>
                <div className="grid grid-cols-2 gap-2 p-3 text-sm text-gray-600">
                  <Info label="站点信息" value={`${detail.siteCount} 个，含备案地、子站点和所属考点`} />
                  <Info label="认定项目" value={`${detail.projectCount} 个，来自集团授权评价范围`} />
                  <Info label="工作人员" value={`${detail.staffCount} 人，姓名和身份证号必填`} />
                  <Info label="督导人员" value={`${detail.supervisorCount} 人，含聘用和有效期信息`} />
                  <Info label="考评人员" value={`${detail.assessorCount} 人，按职业工种能力匹配`} />
                  <Info label="考点信息" value={`${detail.examRoomCount} 个，含笔试/机考/实操/答辩类型`} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!auditTarget} onOpenChange={() => setAuditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>备案审核</DialogTitle></DialogHeader>
          {auditTarget && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="font-semibold text-gray-900">{auditTarget.org}</div>
                <div className="mt-2 text-gray-600">备案类型：{auditTarget.filingType}，备案地：{auditTarget.filingPlace}</div>
              </div>
              <textarea value={rejectReason} onChange={event => setRejectReason(event.target.value)} placeholder="不通过时必须填写原因" className="h-24 w-full rounded-md border border-gray-200 px-3 py-2 focus:border-[#1A56DB] focus:outline-none" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  if (!rejectReason.trim()) return
                  updateAuditStatus(auditTarget, 'returned')
                }}><XCircle className="mr-1 h-4 w-4" />不通过</Button>
                <Button className="bg-[#1A56DB] hover:bg-[#1748B5]" onClick={() => updateAuditStatus(auditTarget, 'approved')}><CheckCircle className="mr-1 h-4 w-4" />通过</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`h-9 rounded-md px-4 text-sm ${active ? 'bg-[#1A56DB] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{children}</button>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="text-gray-500">{label}：</span><span className="font-medium text-gray-900">{value}</span></div>
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
      <CheckCircle className="mx-auto mb-1 h-4 w-4 text-[#1A56DB]" />
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function appendBackendItems(base: FilingAudit[], incoming: FilingAudit[]) {
  const knownIds = new Set(base.map(item => item.id))
  const knownOrgs = new Set(base.map(item => `${item.org}-${item.submitTime}`))
  const extras = incoming.filter(item => item.id && item.org && !knownIds.has(item.id) && !knownOrgs.has(`${item.org}-${item.submitTime}`))
  return [...base, ...extras]
}
