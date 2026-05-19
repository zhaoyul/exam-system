import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Plus, Search, Trash2, Eye, Download, Upload
} from 'lucide-react'

interface Evaluator {
  id: string
  name: string
  gender: string
  idCard: string
  phone: string
  education: string
  title: string
  level: string
  workUnit: string
  profession: string
  skillLevel: string
  certNo: string
  issueDate: string
  specialties: string
  status: 'active' | 'inactive'
  evalProfessions: string[]
}

const mockEvaluators: Evaluator[] = [
  {
    id: '1', name: '张专家', gender: '男', idCard: '440301197805154321', phone: '13800138001',
    education: '本科', title: '高级工程师', level: '高级考评员', workUnit: '中广核研究院',
    profession: '核反应堆运行', skillLevel: '一级/高级技师', certNo: 'KP-2025-001',
    issueDate: '2025-06-01', specialties: '核反应堆运行、辐射防护', status: 'active',
    evalProfessions: ['核反应堆运行值班员', '辐射防护员']
  },
  {
    id: '2', name: '李专家', gender: '女', idCard: '440301198203287654', phone: '13800138002',
    education: '硕士', title: '教授级高工', level: '高级考评员', workUnit: '大亚湾核电',
    profession: '电气维修', skillLevel: '一级/高级技师', certNo: 'KP-2025-002',
    issueDate: '2025-06-15', specialties: '电气试验、继电保护', status: 'active',
    evalProfessions: ['电气试验员', '继电保护员']
  },
  {
    id: '3', name: '王专家', gender: '男', idCard: '440301198510098765', phone: '13800138003',
    education: '本科', title: '工程师', level: '考评员', workUnit: '阳江核电',
    profession: '机械设备检修', skillLevel: '二级/技师', certNo: 'KP-2025-003',
    issueDate: '2025-07-01', specialties: '机械设备检修', status: 'active',
    evalProfessions: ['机械设备检修工']
  },
]

export default function EvaluatorStaff() {
  const [evaluators, setEvaluators] = useState<Evaluator[]>(mockEvaluators)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [showDetail, setShowDetail] = useState<Evaluator | null>(null)

  const filtered = evaluators.filter(e => {
    const m = !search || e.name.includes(search) || e.idCard.includes(search) || e.phone.includes(search)
    const l = levelFilter === 'all' || e.level === levelFilter
    return m && l
  })

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newEval: Evaluator = {
      id: Date.now().toString(),
      name: fd.get('name') as string,
      gender: fd.get('gender') as string,
      idCard: fd.get('idCard') as string,
      phone: fd.get('phone') as string,
      education: fd.get('education') as string,
      title: fd.get('title') as string,
      level: fd.get('level') as string,
      workUnit: fd.get('workUnit') as string,
      profession: fd.get('profession') as string,
      skillLevel: fd.get('skillLevel') as string,
      certNo: `KP-2026-${String(evaluators.length + 1).padStart(3, '0')}`,
      issueDate: fd.get('issueDate') as string,
      specialties: fd.get('specialties') as string,
      status: 'active',
      evalProfessions: (fd.get('evalProfessions') as string)?.split(',').filter(Boolean) || [],
    }
    setEvaluators(prev => [newEval, ...prev])
    setAddOpen(false)
    toast.success(`新增考评人员：${newEval.name}`)
  }

  const handleDelete = (id: string) => {
    setEvaluators(prev => prev.filter(e => e.id !== id))
    toast.success('考评人员已删除')
  }

  const handleToggleStatus = (id: string) => {
    setEvaluators(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' as const : 'active' as const } : e))
    toast.success('状态已更新')
  }

  const stats = {
    total: evaluators.length,
    active: evaluators.filter(e => e.status === 'active').length,
    senior: evaluators.filter(e => e.level === '高级考评员').length,
    normal: evaluators.filter(e => e.level === '考评员').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考评人员</h1>
          <p className="text-sm text-gray-500 mt-1">管理职业技能等级认定考评人员信息</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><Download className="w-3.5 h-3.5 mr-1" />下载模板</Button>
          <Button variant="outline" size="sm" className="text-xs"><Upload className="w-3.5 h-3.5 mr-1" />导入</Button>
          <Button onClick={() => setAddOpen(true)} size="sm"><Plus className="w-3.5 h-3.5 mr-1" />新增</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">总人数</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">在职</div>
          <div className="text-2xl font-bold text-green-700">{stats.active}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">高级考评员</div>
          <div className="text-2xl font-bold text-blue-700">{stats.senior}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600">考评员</div>
          <div className="text-2xl font-bold text-purple-700">{stats.normal}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索姓名、身份证号、电话..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部等级</SelectItem>
            <SelectItem value="高级考评员">高级考评员</SelectItem>
            <SelectItem value="考评员">考评员</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">姓名</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">性别</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">身份证号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">联系电话</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">文化程度</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">职称</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">等级</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">工作单位</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">职业工种</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">技能等级</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">证卡编号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 font-medium text-gray-900">{e.name}</td>
                <td className="px-3 py-3 text-gray-600">{e.gender}</td>
                <td className="px-3 py-3 text-gray-600 font-mono text-xs">{e.idCard}</td>
                <td className="px-3 py-3 text-gray-600">{e.phone}</td>
                <td className="px-3 py-3 text-gray-600">{e.education}</td>
                <td className="px-3 py-3 text-gray-600">{e.title}</td>
                <td className="px-3 py-3"><Badge className={`text-[10px] ${e.level === '高级考评员' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{e.level}</Badge></td>
                <td className="px-3 py-3 text-gray-600">{e.workUnit}</td>
                <td className="px-3 py-3 text-gray-600">{e.profession}</td>
                <td className="px-3 py-3 text-gray-600">{e.skillLevel}</td>
                <td className="px-3 py-3 font-mono text-xs text-gray-600">{e.certNo}</td>
                <td className="px-3 py-3">
                  <button onClick={() => handleToggleStatus(e.id)}>
                    <Badge className={`text-[10px] cursor-pointer ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{e.status === 'active' ? '在职' : '停用'}</Badge>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowDetail(e)}><Eye className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDelete(e.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>新增考评人员</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>姓名 *</Label><Input name="name" required /></div>
              <div className="space-y-1"><Label>性别 *</Label>
                <Select name="gender" defaultValue="男"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="男">男</SelectItem><SelectItem value="女">女</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1"><Label>身份证号 *</Label><Input name="idCard" required /></div>
              <div className="space-y-1"><Label>联系电话 *</Label><Input name="phone" required /></div>
              <div className="space-y-1"><Label>出生日期 *</Label><Input name="birthDate" type="date" required /></div>
              <div className="space-y-1"><Label>文化程度 *</Label>
                <Select name="education" defaultValue="本科">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="博士">博士</SelectItem>
                    <SelectItem value="硕士">硕士</SelectItem>
                    <SelectItem value="本科">本科</SelectItem>
                    <SelectItem value="大专">大专</SelectItem>
                    <SelectItem value="中专">中专</SelectItem>
                    <SelectItem value="高中">高中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>考评等级 *</Label>
                <Select name="level" defaultValue="考评员">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="高级考评员">高级考评员</SelectItem><SelectItem value="考评员">考评员</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>职称</Label><Input name="title" placeholder="如：高级工程师" /></div>
              <div className="space-y-1"><Label>职业工种</Label><Input name="profession" placeholder="考评职业工种" /></div>
              <div className="space-y-1"><Label>技能等级</Label>
                <Select name="skillLevel" defaultValue="一级/高级技师">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="一级/高级技师">一级/高级技师</SelectItem>
                    <SelectItem value="二级/技师">二级/技师</SelectItem>
                    <SelectItem value="三级/高级工">三级/高级工</SelectItem>
                    <SelectItem value="四级/中级工">四级/中级工</SelectItem>
                    <SelectItem value="五级/初级工">五级/初级工</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>发证日期</Label><Input name="issueDate" type="date" /></div>
              <div className="space-y-1"><Label>工作单位</Label><Input name="workUnit" /></div>
              <div className="space-y-1"><Label>证卡编号</Label><Input name="certNo" placeholder="系统自动生成" disabled /></div>
              <div className="space-y-1 col-span-2"><Label>专业特长</Label><Input name="specialties" placeholder="如：核反应堆运行、辐射防护" /></div>
              <div className="space-y-1 col-span-2"><Label>考评职业</Label><Input name="evalProfessions" placeholder="多个用逗号分隔" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>考评人员详情</DialogTitle></DialogHeader>
          {showDetail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">姓名：</span><span className="font-medium">{showDetail.name}</span></div>
                <div><span className="text-gray-500">性别：</span><span>{showDetail.gender}</span></div>
                <div><span className="text-gray-500">身份证号：</span><span className="font-mono text-xs">{showDetail.idCard}</span></div>
                <div><span className="text-gray-500">联系电话：</span><span>{showDetail.phone}</span></div>
                <div><span className="text-gray-500">文化程度：</span><span>{showDetail.education}</span></div>
                <div><span className="text-gray-500">职称：</span><span>{showDetail.title}</span></div>
                <div><span className="text-gray-500">等级：</span><Badge className={`text-[10px] ${showDetail.level === '高级考评员' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{showDetail.level}</Badge></div>
                <div><span className="text-gray-500">证卡编号：</span><span className="font-mono text-xs">{showDetail.certNo}</span></div>
                <div><span className="text-gray-500">工作单位：</span><span>{showDetail.workUnit}</span></div>
                <div><span className="text-gray-500">发证日期：</span><span>{showDetail.issueDate}</span></div>
              </div>
              <div>
                <span className="text-gray-500">考评职业：</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {showDetail.evalProfessions.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p}</span>
                  ))}
                </div>
              </div>
              <div><span className="text-gray-500">专业特长：</span><span>{showDetail.specialties}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
