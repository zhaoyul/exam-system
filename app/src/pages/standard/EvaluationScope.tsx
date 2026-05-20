import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Building2, Plus, Search, Upload, FileText, Award, Edit3,
  ChevronRight, School, BookOpen, X
} from 'lucide-react'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'

// 二、标准大纲 - 评价范围页面
// 功能：新增职业级别、评价等级、考试科目、申报条件、批量授权、导入

interface BranchOrg {
  id: number
  name: string
  certCount: number
}

interface EvalProject {
  id: number
  orgId: number
  professionName: string
  jobTypeName: string
  level: string
  examTheory: boolean
  examSkill: boolean
  examComposite: boolean
  theoryMode: string
  skillMode: string
  compositeMode: string
  passScore: number
  conditionCount: number
}

interface Condition {
  id: number
  code: string
  description: string
}

const mockBranches: BranchOrg[] = [
  { id: 1, name: '中国工业集团有限公司', certCount: 3 },
  { id: 2, name: '中电运行管理有限公司', certCount: 0 },
  { id: 3, name: '环宇能源分支机构', certCount: 3 },
]

const mockProjects: EvalProject[] = [
  { id: 1, orgId: 1, professionName: '车工', jobTypeName: '车工', level: '五级', examTheory: true, examSkill: true, examComposite: false, theoryMode: '知识考试', skillMode: '现场操作', compositeMode: '', passScore: 60.0, conditionCount: 1 },
  { id: 2, orgId: 1, professionName: '车工', jobTypeName: '普通车床', level: '四级', examTheory: true, examSkill: true, examComposite: false, theoryMode: '知识考试', skillMode: '现场操作', compositeMode: '', passScore: 60.0, conditionCount: 2 },
  { id: 3, orgId: 1, professionName: '车工', jobTypeName: '数控车床', level: '四级', examTheory: true, examSkill: true, examComposite: false, theoryMode: '知识考试', skillMode: '现场操作', compositeMode: '', passScore: 60.0, conditionCount: 2 },
]

const examModes = [
  { value: 'knowledge', label: '知识考试' },
  { value: 'operation', label: '现场操作' },
  { value: 'defense', label: '综合答辩' },
  { value: 'none', label: '不编排' },
]

export default function EvaluationScope() {
  const [selectedOrg, setSelectedOrg] = useState<number>(1)
  const [projects] = useBackendListState<EvalProject>(mockProjects)
  const backendBranches = useBackendResourceList('/certification/organizations', mockBranches)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [conditions, setConditions] = useState<Condition[]>([])

  const filtered = projects.filter(p => p.orgId === selectedOrg && (!search || p.professionName.includes(search) || p.jobTypeName.includes(search)))

  const selectedOrgData = backendBranches.find(b => b.id === selectedOrg)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">评价范围</h1>
          <p className="text-sm text-gray-500 mt-1">管理各分支机构的职业工种认定范围、评价等级、考试科目和申报条件</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('下载导入模板')}>
            <Upload className="w-3.5 h-3.5 mr-1" /> 下载模板
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('导入评价范围')}>
            <Upload className="w-3.5 h-3.5 mr-1" /> 导入
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> 添加
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Branch Org List */}
        <div className="col-span-3 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" /> 分支机构
          </h3>
          {backendBranches.map(org => (
            <div
              key={org.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedOrg === org.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedOrg(org.id)}
            >
              <div className="font-medium text-sm">{org.name}</div>
              <div className="text-xs text-gray-500 mt-1">{org.certCount}个职业等级</div>
              {selectedOrg === org.id && <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" />}
            </div>
          ))}
        </div>

        {/* Right: Project List */}
        <div className="col-span-9">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">评价项目</span>
                <span className="text-xs text-gray-500">（{selectedOrgData?.name}）</span>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input placeholder="职业工种" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs w-40" />
                </div>
                <Button size="sm" className="h-8 text-xs" onClick={() => setAddOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> 添加
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.success('批量授权')}>
                  <Award className="w-3 h-3 mr-1" /> 批量授权
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.success('增加全职业申报条件')}>
                  <BookOpen className="w-3 h-3 mr-1" /> 增加全职业申报条件
                </Button>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">职业名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">工种名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">认定等级</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      <School className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>暂无数据</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.professionName}</td>
                      <td className="px-4 py-3 text-xs">{p.jobTypeName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px]">{p.level}</Badge>
                          <Button variant="ghost" size="sm" className="h-5 px-1 text-xs text-blue-600"><Edit3 className="w-2.5 h-2.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-5 px-1 text-xs text-red-600"><X className="w-2.5 h-2.5" /></Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">详情</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t text-xs text-gray-500 flex justify-between">
              <span>共计{filtered.length}条数据</span>
              <div className="flex gap-1 items-center">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">&lt;</Button>
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs">1</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">&gt;</Button>
                <span className="ml-2">10条/页</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Evaluation Project Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增职业级别</DialogTitle>
          </DialogHeader>

          {/* Query Section */}
          <div className="flex gap-2 mb-4">
            <Button variant="link" size="sm" className="text-xs text-blue-600 h-7 p-0">查询增加职业</Button>
            <Button variant="link" size="sm" className="text-xs text-blue-600 h-7 p-0">查询增加工种/方向</Button>
            <Button variant="link" size="sm" className="text-xs text-blue-600 h-7 p-0">粘贴编码增加所有认定项目</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left: Profession selection */}
            <div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Label className="text-xs">职业</Label>
                  <div className="flex gap-1">
                    <Input placeholder="输入职业名称" className="h-8 text-xs" />
                    <Button size="sm" className="h-8 text-xs">查询</Button>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium">序号</th>
                      <th className="px-2 py-1.5 text-left font-medium">职业编码</th>
                      <th className="px-2 py-1.5 text-left font-medium">职业</th>
                      <th className="px-2 py-1.5 text-left font-medium">工种/方向</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { code: '6-18-01-01', name: '车工', type: '车工' },
                      { code: '6-18-01-01', name: '车工', type: '数控车工' },
                      { code: '6-18-01-01', name: '车工', type: '普通车工' },
                      { code: '6-18-01-01', name: '车工', type: '普通车床' },
                      { code: '6-18-01-01', name: '车工', type: '数控车床' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-2 py-1.5"><Checkbox className="w-3 h-3" /></td>
                        <td className="px-2 py-1.5 font-mono text-gray-500">{item.code}</td>
                        <td className="px-2 py-1.5">{item.name}</td>
                        <td className="px-2 py-1.5">{item.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Config */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">评价等级 *</Label>
                <div className="flex gap-3">
                  {['无级别', '五级', '四级', '三级', '二级', '一级'].map(l => (
                    <label key={l} className="flex items-center gap-1 text-xs cursor-pointer">
                      <input type="radio" name="level" className="w-3 h-3" />
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="multiEval" className="w-3.5 h-3.5" />
                <Label htmlFor="multiEval" className="text-xs">多元评价</Label>
              </div>

              <Separator />

              {/* Exam Subjects */}
              <div className="space-y-3">
                {/* Theory */}
                <div className="flex items-start gap-2">
                  <Checkbox id="theory" className="w-3.5 h-3.5 mt-0.5" defaultChecked />
                  <div className="flex-1">
                    <Label htmlFor="theory" className="text-xs font-medium">理论</Label>
                    <div className="flex gap-2 mt-1">
                      {examModes.map(m => (
                        <label key={m.value} className="flex items-center gap-1 text-[10px] cursor-pointer">
                          <input type="radio" name="theoryMode" defaultChecked={m.value === 'knowledge'} className="w-2.5 h-2.5" />
                          {m.label}
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">考试及格线：</span>
                      <Input defaultValue="60.0" className="h-6 w-16 text-xs" />
                    </div>
                  </div>
                </div>

                {/* Skill */}
                <div className="flex items-start gap-2">
                  <Checkbox id="skill" className="w-3.5 h-3.5 mt-0.5" defaultChecked />
                  <div className="flex-1">
                    <Label htmlFor="skill" className="text-xs font-medium">技能</Label>
                    <div className="flex gap-2 mt-1">
                      {examModes.map(m => (
                        <label key={m.value} className="flex items-center gap-1 text-[10px] cursor-pointer">
                          <input type="radio" name="skillMode" defaultChecked={m.value === 'operation'} className="w-2.5 h-2.5" />
                          {m.label}
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">考试及格线：</span>
                      <Input defaultValue="60.0" className="h-6 w-16 text-xs" />
                    </div>
                  </div>
                </div>

                {/* Composite */}
                <div className="flex items-start gap-2">
                  <Checkbox id="composite" className="w-3.5 h-3.5 mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="composite" className="text-xs font-medium">综合</Label>
                    <div className="flex gap-2 mt-1">
                      {examModes.map(m => (
                        <label key={m.value} className="flex items-center gap-1 text-[10px] cursor-pointer">
                          <input type="radio" name="compositeMode" className="w-2.5 h-2.5" />
                          {m.label}
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">考试及格线：</span>
                      <Input className="h-6 w-16 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Conditions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">共 {conditions.length} 个申报条件</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setConditions(prev => [...prev, { id: Date.now(), code: `COND-${Date.now()}`, description: '新申报条件' }])}>
                    添加新申报条件
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 text-[10px]">
                    选择默认申报条件
                  </Button>
                </div>
              </div>
              {conditions.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded text-xs">
                  <span className="text-gray-400">{conditions.indexOf(c) + 1}</span>
                  <span className="flex-1">{c.description}</span>
                  <Button variant="ghost" size="sm" className="h-5 px-1 text-xs text-blue-600">编辑</Button>
                  <Button variant="ghost" size="sm" className="h-5 px-1 text-xs text-red-600" onClick={() => setConditions(prev => prev.filter(x => x.id !== c.id))}>删除</Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)}>返回</Button>
            <Button size="sm" onClick={() => { setAddOpen(false); toast.success('新增职业级别成功'); }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
