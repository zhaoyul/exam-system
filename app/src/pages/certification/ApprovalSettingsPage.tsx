import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  AlertTriangle,
  ClipboardCheck,
  FilePlus2,
  FileText,
  Save,
  Settings,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type Level = '一级' | '二级' | '三级' | '四级' | '五级'
type AuditScope = '本机构' | '下级机构'

interface WarningSettings {
  nodeWorkDays: Record<string, number>
  minAges: Record<Level, number>
  minExamineeCnt: number
  passRateHigh: number
  passRateLow: number
  lowScore: number
  lowScoreRate: number
  highScore: number
  highScoreRate: number
}

interface MaterialRule {
  id: string
  title: string
  isMust: boolean
  fileExt: string[]
  templateName?: string
}

interface AuditNodeSetting {
  id: string
  name: string
  enabled: boolean
  forced?: boolean
  scope: AuditScope[]
  auditors: Auditor[]
  materials: MaterialRule[]
  needSuccessivelyAudit: boolean
  reviewLevels: Level[]
}

interface Auditor {
  id: string
  loginName: string
  name: string
}

const nodeMeta = [
  { id: '1', name: '制定计划', timing: '考前' },
  { id: '5', name: '报名', timing: '考前' },
  { id: '10', name: '考场编排', timing: '考前' },
  { id: '15', name: '考务安排', timing: '考前' },
  { id: '25', name: '考试成绩', timing: '考后' },
  { id: '27', name: '成绩公示', timing: '考后' },
  { id: '30', name: '证书制证', timing: '考后' },
  { id: '35', name: '证书打印', timing: '考后' },
]

const levelLabels: Level[] = ['一级', '二级', '三级', '四级', '五级']

const auditors: Auditor[] = [
  { id: 'u1', loginName: 'cgnzx001cs', name: '集团管理员' },
  { id: 'u2', loginName: 'audit_plan', name: '计划批复员' },
  { id: 'u3', loginName: 'audit_score', name: '成绩批复员' },
  { id: 'u4', loginName: 'audit_cert', name: '证书批复员' },
]

const fileExtOptions = ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'png', 'zip']

const initialWarning: WarningSettings = {
  nodeWorkDays: { '1': 7, '5': 5, '10': 3, '15': 2, '25': 2, '27': 1, '30': 1, '35': 1 },
  minAges: { 一级: 26, 二级: 24, 三级: 20, 四级: 18, 五级: 16 },
  minExamineeCnt: 30,
  passRateHigh: 95,
  passRateLow: 50,
  lowScore: 40,
  lowScoreRate: 20,
  highScore: 95,
  highScoreRate: 30,
}

const initialAuditNodes: AuditNodeSetting[] = [
  {
    id: '1',
    name: '制定计划',
    enabled: true,
    forced: true,
    scope: ['本机构', '下级机构'],
    auditors: [auditors[1]],
    materials: [{ id: 'm1', title: '认定计划申报表', isMust: true, fileExt: ['pdf', 'docx'], templateName: '认定计划申报表.docx' }],
    needSuccessivelyAudit: true,
    reviewLevels: ['一级', '二级', '三级'],
  },
  {
    id: '5',
    name: '报名',
    enabled: false,
    scope: ['本机构'],
    auditors: [],
    materials: [],
    needSuccessivelyAudit: false,
    reviewLevels: [],
  },
  {
    id: '10',
    name: '考场编排',
    enabled: true,
    scope: ['本机构'],
    auditors: [auditors[0]],
    materials: [{ id: 'm2', title: '考场编排表', isMust: false, fileExt: ['xlsx', 'pdf'] }],
    needSuccessivelyAudit: false,
    reviewLevels: ['四级', '五级'],
  },
  {
    id: '15',
    name: '考务安排',
    enabled: false,
    scope: ['本机构'],
    auditors: [],
    materials: [],
    needSuccessivelyAudit: false,
    reviewLevels: [],
  },
  {
    id: '25',
    name: '考试成绩',
    enabled: true,
    scope: ['本机构'],
    auditors: [auditors[2]],
    materials: [{ id: 'm3', title: '成绩汇总表', isMust: true, fileExt: ['xlsx', 'pdf'] }],
    needSuccessivelyAudit: true,
    reviewLevels: ['一级', '二级'],
  },
  {
    id: '27',
    name: '成绩公示',
    enabled: true,
    scope: ['本机构'],
    auditors: [auditors[2]],
    materials: [],
    needSuccessivelyAudit: false,
    reviewLevels: ['一级', '二级', '三级', '四级', '五级'],
  },
  {
    id: '30',
    name: '证书制证',
    enabled: true,
    scope: ['本机构'],
    auditors: [auditors[3]],
    materials: [{ id: 'm4', title: '证书生成确认表', isMust: true, fileExt: ['pdf'] }],
    needSuccessivelyAudit: false,
    reviewLevels: ['一级', '二级', '三级'],
  },
  {
    id: '35',
    name: '证书打印',
    enabled: false,
    scope: ['本机构'],
    auditors: [],
    materials: [],
    needSuccessivelyAudit: false,
    reviewLevels: [],
  },
]

export default function ApprovalSettingsPage() {
  const [warning, setWarning] = useState<WarningSettings>(initialWarning)
  const [auditNodes, setAuditNodes] = useBackendListState<AuditNodeSetting>(initialAuditNodes)
  const [activeTab, setActiveTab] = useState<'预警设置' | '批复设置'>('预警设置')
  const [userNodeId, setUserNodeId] = useState<string | null>(null)
  const [materialNodeId, setMaterialNodeId] = useState<string | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<MaterialRule | null>(null)
  const [saved, setSaved] = useState(false)

  const activeUserNode = useMemo(() => auditNodes.find(node => node.id === userNodeId) || null, [auditNodes, userNodeId])
  const activeMaterialNode = useMemo(() => auditNodes.find(node => node.id === materialNodeId) || null, [auditNodes, materialNodeId])

  const updateWarning = <K extends keyof WarningSettings>(key: K, value: WarningSettings[K]) => {
    setWarning(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const updateNode = (id: string, patch: Partial<AuditNodeSetting>) => {
    setAuditNodes(prev => prev.map(node => node.id === id ? { ...node, ...patch } : node))
    setSaved(false)
  }

  const toggleScope = (node: AuditNodeSetting, scope: AuditScope) => {
    const next = node.scope.includes(scope) ? node.scope.filter(item => item !== scope) : [...node.scope, scope]
    updateNode(node.id, { scope: next })
  }

  const toggleReviewLevel = (node: AuditNodeSetting, level: Level) => {
    const next = node.reviewLevels.includes(level) ? node.reviewLevels.filter(item => item !== level) : [...node.reviewLevels, level]
    updateNode(node.id, { reviewLevels: next })
  }

  const toggleAuditor = (auditor: Auditor) => {
    if (!activeUserNode) return
    const exists = activeUserNode.auditors.some(item => item.id === auditor.id)
    const next = exists
      ? activeUserNode.auditors.filter(item => item.id !== auditor.id)
      : [...activeUserNode.auditors, auditor]
    updateNode(activeUserNode.id, { auditors: next })
  }

  const removeAuditor = (node: AuditNodeSetting, auditorId: string) => {
    updateNode(node.id, { auditors: node.auditors.filter(item => item.id !== auditorId) })
  }

  const removeMaterial = (node: AuditNodeSetting, materialId: string) => {
    updateNode(node.id, { materials: node.materials.filter(item => item.id !== materialId) })
  }

  const saveMaterial = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeMaterialNode) return
    const fd = new FormData(event.currentTarget)
    const title = String(fd.get('title') || '').trim()
    const ext = fd.getAll('fileExt').map(String)
    if (!title || ext.length === 0) {
      toast.error('请填写材料名称并选择文件后缀名')
      return
    }
    const nextMaterial: MaterialRule = {
      id: editingMaterial?.id || String(Date.now()),
      title,
      isMust: String(fd.get('isMust')) === 'true',
      fileExt: ext,
      templateName: String(fd.get('templateName') || '').trim() || undefined,
    }
    const existsSameTitle = activeMaterialNode.materials.some(item => item.title === title && item.id !== nextMaterial.id)
    if (existsSameTitle) {
      toast.error('已有相同的材料设置，请更换材料名称')
      return
    }
    const nextMaterials = editingMaterial
      ? activeMaterialNode.materials.map(item => item.id === editingMaterial.id ? nextMaterial : item)
      : [...activeMaterialNode.materials, nextMaterial]
    updateNode(activeMaterialNode.id, { materials: nextMaterials })
    setEditingMaterial(null)
    setMaterialNodeId(null)
    toast.success('材料设置已更新')
  }

  const handleSave = () => {
    const invalidNode = auditNodes.find(node => node.enabled && node.auditors.length === 0)
    if (invalidNode) {
      toast.error(`请设置${invalidNode.name}的批复授权`)
      setActiveTab('批复设置')
      return
    }
    setSaved(true)
    toast.success('批复/预警设置已保存')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#1A56DB]" />
            <h1 className="text-xl font-bold text-gray-900">批复设置</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">配置集团端预警规则、批复节点、授权人员、上传材料和逐级审批方式</p>
        </div>
        <Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]">
          <Save className="mr-2 h-4 w-4" />{saved ? '已保存' : '保存'}
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex border-b border-gray-100 px-4 pt-3">
          {(['预警设置', '批复设置'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mr-4 border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === tab ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === '预警设置' ? (
          <div className="space-y-6 p-4">
            <section>
              <SectionTitle icon={<AlertTriangle className="h-4 w-4 text-[#1A56DB]" />} title="工作进度预警" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
                {nodeMeta.map(node => (
                  <div key={node.id} className="rounded-md border border-gray-100 p-3">
                    <div className="text-sm font-medium text-gray-900">{node.name}</div>
                    <label className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                      {node.timing}
                      <input
                        type="number"
                        min={0}
                        value={warning.nodeWorkDays[node.id] || 0}
                        onChange={event => updateWarning('nodeWorkDays', { ...warning.nodeWorkDays, [node.id]: Number(event.target.value) })}
                        className="h-8 w-16 rounded-md border border-gray-200 px-2 text-right text-sm"
                      />
                      日
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle icon={<ShieldCheck className="h-4 w-4 text-[#1A56DB]" />} title="报考最小年龄预警" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {levelLabels.map(level => (
                  <label key={level} className="rounded-md border border-gray-100 p-3 text-sm">
                    <span className="font-medium text-gray-900">{level}</span>
                    <div className="mt-2 flex items-center gap-1 text-gray-600">
                      <input
                        type="number"
                        min={0}
                        value={warning.minAges[level]}
                        onChange={event => updateWarning('minAges', { ...warning.minAges, [level]: Number(event.target.value) })}
                        className="h-8 w-20 rounded-md border border-gray-200 px-2 text-right"
                      />
                      岁以下
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle icon={<ClipboardCheck className="h-4 w-4 text-[#1A56DB]" />} title="成绩预警" />
              <div className="space-y-3 rounded-md border border-gray-100 p-4 text-sm text-gray-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span>如果本次考生数量在</span>
                  <NumberInput value={warning.minExamineeCnt} onChange={value => updateWarning('minExamineeCnt', value)} />
                  <span>人及以上</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>合格率高于</span>
                  <NumberInput value={warning.passRateHigh} precision="decimal" onChange={value => updateWarning('passRateHigh', value)} />
                  <span>%，或者低于</span>
                  <NumberInput value={warning.passRateLow} precision="decimal" onChange={value => updateWarning('passRateLow', value)} />
                  <span>%，则报送成绩合格率预警信息</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>如果成绩低于</span>
                  <NumberInput value={warning.lowScore} precision="decimal" onChange={value => updateWarning('lowScore', value)} />
                  <span>分的人数超过</span>
                  <NumberInput value={warning.lowScoreRate} precision="decimal" onChange={value => updateWarning('lowScoreRate', value)} />
                  <span>%，则报送成绩过低的预警信息</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>如果成绩高于</span>
                  <NumberInput value={warning.highScore} precision="decimal" onChange={value => updateWarning('highScore', value)} />
                  <span>分的人数超过</span>
                  <NumberInput value={warning.highScoreRate} precision="decimal" onChange={value => updateWarning('highScoreRate', value)} />
                  <span>%，则报送成绩过高的预警信息</span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 rounded-md bg-[#F9FAFB] p-3 text-sm text-gray-600">
              勾选需要批复的项目节点，设置批复授权、上传材料和是否依次审核。分支机构完成该节点后，需集团审核通过才可进入下一步。
            </div>
            <div className="space-y-3">
              {auditNodes.map(node => (
                <div key={node.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <input
                        type="checkbox"
                        checked={node.enabled || !!node.forced}
                        disabled={node.forced}
                        onChange={event => updateNode(node.id, { enabled: event.target.checked })}
                      />
                      {node.name}
                      {node.forced && <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">强制批复</span>}
                    </label>
                    <div className="text-xs text-gray-500">节点编号：{node.id}</div>
                  </div>

                  {(node.enabled || node.forced) && (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                        <div className="text-sm font-medium text-gray-700">必须批复：</div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {(['本机构', '下级机构'] as AuditScope[]).map(scope => (
                            <label key={scope} className="inline-flex items-center gap-1.5">
                              <input type="checkbox" checked={node.scope.includes(scope)} onChange={() => toggleScope(node, scope)} />
                              {scope}
                            </label>
                          ))}
                        </div>

                        <div className="text-sm font-medium text-gray-700">批复授权：</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => setUserNodeId(node.id)} className="inline-flex h-8 items-center gap-1 rounded border border-dashed border-[#1A56DB] px-3 text-xs text-[#1A56DB]">
                            <UserPlus className="h-3.5 w-3.5" />添加用户
                          </button>
                          {node.auditors.map(auditor => (
                            <span key={auditor.id} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700" title={`登录名：${auditor.loginName}`}>
                              {auditor.name}
                              <button onClick={() => removeAuditor(node, auditor.id)}><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>

                        <div className="text-sm font-medium text-gray-700">上传材料：</div>
                        <div className="flex flex-wrap items-center gap-2">
                          {node.materials.map(material => (
                            <span key={material.id} className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                              <FileText className="h-3.5 w-3.5 text-[#1A56DB]" />
                              {material.title}({material.fileExt.join(',')}){material.isMust ? ' 必传' : ' 选传'}
                              <button onClick={() => { setMaterialNodeId(node.id); setEditingMaterial(material) }} className="ml-1 text-[#1A56DB]">编辑</button>
                              <button onClick={() => removeMaterial(node, material.id)}><X className="h-3 w-3 text-red-500" /></button>
                            </span>
                          ))}
                          <button onClick={() => { setMaterialNodeId(node.id); setEditingMaterial(null) }} className="inline-flex h-8 items-center gap-1 rounded border border-dashed border-[#1A56DB] px-3 text-xs text-[#1A56DB]">
                            <FilePlus2 className="h-3.5 w-3.5" />添加材料
                          </button>
                        </div>

                        <div className="text-sm font-medium text-gray-700">是否依次审核：</div>
                        <div className="flex gap-4 text-sm">
                          <label className="inline-flex items-center gap-1.5">
                            <input type="radio" checked={node.needSuccessivelyAudit} onChange={() => updateNode(node.id, { needSuccessivelyAudit: true })} />是
                          </label>
                          <label className="inline-flex items-center gap-1.5">
                            <input type="radio" checked={!node.needSuccessivelyAudit} onChange={() => updateNode(node.id, { needSuccessivelyAudit: false })} />否
                          </label>
                        </div>

                        <div className="text-sm font-medium text-gray-700">复审批复：</div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {levelLabels.map(level => (
                            <label key={level} className="inline-flex items-center gap-1.5">
                              <input type="checkbox" checked={node.reviewLevels.includes(level)} onChange={() => toggleReviewLevel(node, level)} />
                              {level}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!activeUserNode} onOpenChange={() => setUserNodeId(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>批复授权 - {activeUserNode?.name}</DialogTitle></DialogHeader>
          {activeUserNode && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-[#F9FAFB] text-gray-600">
                  <tr>
                    <th className="w-16 px-3 py-3 text-left font-medium">选择</th>
                    <th className="px-3 py-3 text-left font-medium">登录名</th>
                    <th className="px-3 py-3 text-left font-medium">用户姓名</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditors.map(auditor => (
                    <tr key={auditor.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={activeUserNode.auditors.some(item => item.id === auditor.id)} onChange={() => toggleAuditor(auditor)} />
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-600">{auditor.loginName}</td>
                      <td className="px-3 py-3 font-medium text-gray-900">{auditor.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end">
            <Button className="bg-[#1A56DB] hover:bg-[#1748B5]" onClick={() => setUserNodeId(null)}>确定</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeMaterialNode} onOpenChange={() => { setMaterialNodeId(null); setEditingMaterial(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingMaterial ? '编辑材料' : '添加材料'} - {activeMaterialNode?.name}</DialogTitle></DialogHeader>
          {activeMaterialNode && (
            <form onSubmit={saveMaterial} className="space-y-4 text-sm">
              <label className="block space-y-1">
                <span className="font-medium text-gray-700">材料名称：</span>
                <input name="title" required defaultValue={editingMaterial?.title || ''} className="h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" />
              </label>
              <div>
                <div className="mb-2 font-medium text-gray-700">必传材料：</div>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-1.5">
                    <input type="radio" name="isMust" value="true" defaultChecked={editingMaterial?.isMust ?? true} />必传
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input type="radio" name="isMust" value="false" defaultChecked={editingMaterial ? !editingMaterial.isMust : false} />选传
                  </label>
                </div>
              </div>
              <div>
                <div className="mb-2 font-medium text-gray-700">文件后缀名：</div>
                <div className="grid grid-cols-4 gap-2">
                  {fileExtOptions.map(ext => (
                    <label key={ext} className="inline-flex items-center gap-1.5">
                      <input type="checkbox" name="fileExt" value={ext} defaultChecked={editingMaterial?.fileExt.includes(ext) || false} />
                      {ext}
                    </label>
                  ))}
                </div>
              </div>
              <label className="block space-y-1">
                <span className="font-medium text-gray-700">模板：</span>
                <input name="templateName" defaultValue={editingMaterial?.templateName || ''} placeholder="模板文件名，可选" className="h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" />
              </label>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <Button type="button" variant="outline" onClick={() => { setMaterialNodeId(null); setEditingMaterial(null) }}>取消</Button>
                <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
      {icon}
      {title}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  precision = 'integer',
}: {
  value: number
  onChange: (value: number) => void
  precision?: 'integer' | 'decimal'
}) {
  return (
    <input
      type="number"
      min={0}
      max={100}
      step={precision === 'decimal' ? 0.1 : 1}
      value={value}
      onChange={event => onChange(Number(event.target.value))}
      className="h-8 w-24 rounded-md border border-gray-200 px-2 text-right focus:border-[#1A56DB] focus:outline-none"
    />
  )
}
