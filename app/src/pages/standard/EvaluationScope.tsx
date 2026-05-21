import { useMemo, useState } from 'react'
import { Award, BookOpen, ChevronRight, FileText, Plus, Search, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendResourceList, useBackendResourceState } from '@/hooks/useBackendListState'

interface ScopeOrg {
  id: string
  name: string
  certCount: number
}

interface EvalProject {
  id: string
  orgId: string
  professionName: string
  jobTypeName: string
  level: string
  examSubjects: string
  condition: string
}

const initialOrgs: ScopeOrg[] = [
  { id: 'org0', name: '中国工业集团有限公司', certCount: 29 },
  { id: 'org1', name: '中广测试有限公司', certCount: 3 },
  { id: 'org2', name: '福建宁A电有限公司', certCount: 5 },
  { id: 'org3', name: '防城港核电', certCount: 6 },
  { id: 'org4', name: '宁德', certCount: 0 },
  { id: 'org5', name: '002', certCount: 0 },
  { id: 'org6', name: 'emacs', certCount: 0 },
]

const initialProjects: EvalProject[] = [
  { id: 'ep1', orgId: 'org0', professionName: '企业人力资源管理师', jobTypeName: '企业人力资源管理师', level: '四级', examSubjects: '理论+技能', condition: '累计从事本职业或相关职业工作满4年' },
  { id: 'ep2', orgId: 'org0', professionName: '职业培训师', jobTypeName: '企业培训', level: '三级', examSubjects: '理论+技能+综合', condition: '取得四级证书后累计工作满5年' },
  { id: 'ep3', orgId: 'org0', professionName: '仪器仪表维修工', jobTypeName: '核电仪控', level: '三级', examSubjects: '理论+技能', condition: '具备相关专业高级工基础' },
  { id: 'ep4', orgId: 'org0', professionName: '起重工', jobTypeName: '起重装卸机械操作', level: '五级', examSubjects: '理论+技能', condition: '经本职业五级正规培训达到规定学时' },
  { id: 'ep5', orgId: 'org0', professionName: '泵装配调试工', jobTypeName: '核级泵检修', level: '四级', examSubjects: '理论+技能', condition: '具备本职业初级技能证书' },
  { id: 'ep6', orgId: 'org0', professionName: '光伏发电运维值班员', jobTypeName: '光伏电站运维', level: '四级', examSubjects: '理论+技能', condition: '累计从事相关职业工作满3年' },
  { id: 'ep7', orgId: 'org1', professionName: '汽轮机和水轮机检修工', jobTypeName: '汽轮机检修', level: '三级', examSubjects: '理论+技能', condition: '取得四级证书后累计工作满5年' },
  { id: 'ep8', orgId: 'org1', professionName: '电机检修工', jobTypeName: '发电机检修', level: '三级', examSubjects: '理论+技能', condition: '具备本职业中级技能证书' },
  { id: 'ep9', orgId: 'org1', professionName: '内燃机装配调试工', jobTypeName: '柴油机调试', level: '四级', examSubjects: '理论+技能', condition: '累计从事相关职业工作满3年' },
]

export default function EvaluationScope() {
  const backendOrgs = useBackendResourceList<ScopeOrg>('/filing/group', initialOrgs)
  const orgs = useMemo(() => appendOrgs(initialOrgs, backendOrgs), [backendOrgs])
  const [backendProjects, setProjects] = useBackendResourceState<EvalProject>('/standard/evaluation-scope', initialProjects)
  const projects = useMemo(() => appendProjects(initialProjects, backendProjects), [backendProjects])
  const [selectedOrg, setSelectedOrg] = useState('org0')
  const [keyword, setKeyword] = useState('')
  const [detail, setDetail] = useState<EvalProject | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ professionName: '', jobTypeName: '', level: '四级', examSubjects: '理论+技能', condition: '' })

  const selectedOrgData = orgs.find(org => org.id === selectedOrg) || orgs[0]
  const filtered = useMemo(() => projects.filter(item => (
    item.orgId === selectedOrg
    && (!keyword || item.professionName.includes(keyword) || item.jobTypeName.includes(keyword))
  )), [keyword, projects, selectedOrg])

  const saveProject = () => {
    if (!form.professionName) return
    setProjects(prev => [{
      id: `ep${Date.now()}`,
      orgId: selectedOrg,
      professionName: form.professionName,
      jobTypeName: form.jobTypeName || form.professionName,
      level: form.level,
      examSubjects: form.examSubjects,
      condition: form.condition || '按职业标准申报条件执行',
    }, ...prev])
    setForm({ professionName: '', jobTypeName: '', level: '四级', examSubjects: '理论+技能', condition: '' })
    setAddOpen(false)
    toast.success('新增职业级别成功')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">评价项目</h1>
        <div className="flex gap-2">
          <Button onClick={() => setAddOpen(true)} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]"><Plus className="mr-1 h-4 w-4" />添 加</Button>
          <Button variant="outline" className="h-9" onClick={() => toast.success('批量授权已加入待处理队列')}><Award className="mr-1 h-4 w-4" />批量授权</Button>
          <Button variant="outline" className="h-9" onClick={() => toast.success('导入任务已创建')}><Upload className="mr-1 h-4 w-4" />导入</Button>
          <Button variant="outline" className="h-9" onClick={() => toast.success('增加全职业申报条件')}><BookOpen className="mr-1 h-4 w-4" />增加全职业申报条件</Button>
        </div>
      </div>

      <section className="grid grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">机构目录</div>
          <div className="space-y-2 p-3">
            {orgs.map(org => (
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org.id)}
                className={`w-full rounded-md border p-3 text-left transition-colors ${selectedOrg === org.id ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{org.name}</span>
                  {selectedOrg === org.id && <ChevronRight className="h-4 w-4 text-[#1A56DB]" />}
                </div>
                <div className="mt-1 text-xs text-gray-500">{org.certCount}个职业等级</div>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <FileText className="h-4 w-4 text-[#1A56DB]" />
              {selectedOrgData?.name || '评价项目'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">职业工种</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={keyword}
                  onChange={event => setKeyword(event.target.value)}
                  placeholder="职业工种"
                  className="h-9 w-56 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
                />
              </div>
              <Button variant="outline" className="h-9">搜 索</Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">职业名称</th>
                  <th className="px-4 py-3 text-left font-medium">工种名称</th>
                  <th className="px-4 py-3 text-left font-medium">认定等级</th>
                  <th className="px-4 py-3 text-left font-medium">考试科目</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.professionName}</td>
                    <td className="px-4 py-3 text-gray-600">{item.jobTypeName}</td>
                    <td className="px-4 py-3"><span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{item.level}</span></td>
                    <td className="px-4 py-3 text-gray-600">{item.examSubjects}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDetail(item)} className="text-xs text-[#1A56DB] hover:underline">详情</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-sm text-gray-400">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            <span>共计{filtered.length}条数据</span>
            <span>1 / 1　10条/页</span>
          </div>
        </main>
      </section>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>评价项目详情</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <Info label="职业名称" value={detail.professionName} />
              <Info label="工种名称" value={detail.jobTypeName} />
              <Info label="认定等级" value={detail.level} />
              <Info label="考试科目" value={detail.examSubjects} />
              <Info label="申报条件" value={detail.condition} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>新增职业级别</DialogTitle></DialogHeader>
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-[#1A56DB]">
            <button>查询增加职业</button>
            <button>查询增加工种/方向</button>
            <button>粘贴编码增加所有认定项目</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="职业名称" value={form.professionName} onChange={value => setForm(prev => ({ ...prev, professionName: value }))} />
            <Field label="工种名称" value={form.jobTypeName} onChange={value => setForm(prev => ({ ...prev, jobTypeName: value }))} />
            <label className="grid gap-1">
              <span className="text-gray-600">评价等级</span>
              <select value={form.level} onChange={event => setForm(prev => ({ ...prev, level: event.target.value }))} className="h-9 rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none">
                {['无级别', '五级', '四级', '三级', '二级', '一级'].map(level => <option key={level}>{level}</option>)}
              </select>
            </label>
            <Field label="考试科目" value={form.examSubjects} onChange={value => setForm(prev => ({ ...prev, examSubjects: value }))} />
            <label className="col-span-2 grid gap-1">
              <span className="text-gray-600">申报条件</span>
              <textarea value={form.condition} onChange={event => setForm(prev => ({ ...prev, condition: event.target.value }))} className="min-h-24 rounded-md border border-gray-200 px-3 py-2 focus:border-[#1A56DB] focus:outline-none" />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setAddOpen(false)}>返回</Button><Button onClick={saveProject}>保存</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1"><span className="text-gray-600">{label}</span><input value={value} onChange={event => onChange(event.target.value)} className="h-9 rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" /></label>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}：</span><span className="font-medium text-gray-900">{value}</span></div>
}

function appendOrgs(base: ScopeOrg[], incoming: ScopeOrg[]) {
  const knownIds = new Set(base.map(item => item.id))
  const knownNames = new Set(base.map(item => item.name))
  const extras = incoming.filter(item => item.id && item.name && !knownIds.has(item.id) && !knownNames.has(item.name))
  return [...base, ...extras]
}

function appendProjects(base: EvalProject[], incoming: EvalProject[]) {
  const knownIds = new Set(base.map(item => item.id))
  const knownNames = new Set(base.map(item => `${item.orgId}-${item.professionName}-${item.jobTypeName}-${item.level}`))
  const extras = incoming.filter(item => (
    item.id
    && item.orgId
    && item.professionName
    && !knownIds.has(item.id)
    && !knownNames.has(`${item.orgId}-${item.professionName}-${item.jobTypeName}-${item.level}`)
  ))
  return [...base, ...extras]
}
