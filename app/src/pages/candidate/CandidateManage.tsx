import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Search, Plus, Upload, Eye, CheckCircle, XCircle, FileDown,
  User, Phone, Mail, Building2, GraduationCap, Calendar
} from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

interface Candidate {
  id: number
  name: string
  idCard: string
  phone: string
  email: string
  gender: string
  org: string
  dept: string
  job: string
  level: string
  profession: string
  registerDate: string
  status: 'pending' | 'approved' | 'rejected'
  photo: boolean
  education: string
  workYears: number
}

const mockCandidates: Candidate[] = [
  { id: 1, name: '张三', idCard: '440301199001011234', phone: '13800138001', email: 'zhangsan@cgnc.com', gender: '男', org: '大亚湾核电', dept: '运行一部', job: '核反应堆操作员', level: '三级', profession: '核能工程', registerDate: '2024-01-15', status: 'approved', photo: true, education: '本科', workYears: 8 },
  { id: 2, name: '李四', idCard: '440301199205063456', phone: '13800138002', email: 'lisi@cgnc.com', gender: '女', org: '阳江核电', dept: '维修部', job: '电气维修工', level: '四级', profession: '电气工程', registerDate: '2024-02-20', status: 'pending', photo: true, education: '大专', workYears: 5 },
  { id: 3, name: '王五', idCard: '440301198803127890', phone: '13800138003', email: 'wangwu@cgnc.com', gender: '男', org: '台山核电', dept: '仪控部', job: '仪表维修工', level: '三级', profession: '自动化', registerDate: '2024-03-10', status: 'approved', photo: false, education: '本科', workYears: 12 },
  { id: 4, name: '赵六', idCard: '440301199511224567', phone: '13800138004', email: 'zhaoliu@cgnc.com', gender: '男', org: '防城港核电', dept: '运行二部', job: '汽轮机操作员', level: '四级', profession: '热能动力', registerDate: '2024-04-05', status: 'rejected', photo: true, education: '本科', workYears: 3 },
  { id: 5, name: '孙七', idCard: '440301199307088901', phone: '13800138005', email: 'sunqi@cgnc.com', gender: '女', org: '大亚湾核电', dept: '技术部', job: '化学分析员', level: '三级', profession: '化学工程', registerDate: '2024-05-12', status: 'pending', photo: true, education: '硕士', workYears: 6 },
  { id: 6, name: '周八', idCard: '440301199012315678', phone: '13800138006', email: 'zhouba@cgnc.com', gender: '男', org: '宁德核电', dept: '运行部', job: '核燃料操作员', level: '二级', profession: '核能工程', registerDate: '2024-06-01', status: 'approved', photo: true, education: '本科', workYears: 10 },
]

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', color: 'bg-red-100 text-red-700' },
}

export default function CandidateManage() {
  const [candidates, setCandidates] = useBackendListState<Candidate>(mockCandidates)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [orgFilter, setOrgFilter] = useState<string>('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const filtered = candidates.filter(c => {
    const matchSearch = !search || c.name.includes(search) || c.idCard.includes(search) || c.phone.includes(search)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchOrg = orgFilter === 'all' || c.org === orgFilter
    return matchSearch && matchStatus && matchOrg
  })

  const handleApprove = (id: number) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' as const } : c))
    toast.success('审核通过：考生资格审核已通过')
  }

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) {
      toast.error('请输入驳回原因')
      return
    }
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' as const } : c))
    setRejectOpen(false)
    setRejectReason('')
    toast.success(`已驳回：${rejectReason}`)
  }

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newCandidate: Candidate = {
      id: Date.now(),
      name: fd.get('name') as string,
      idCard: fd.get('idCard') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string,
      gender: fd.get('gender') as string,
      org: fd.get('org') as string,
      dept: fd.get('dept') as string,
      job: fd.get('job') as string,
      level: fd.get('level') as string,
      profession: fd.get('profession') as string,
      registerDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      photo: false,
      education: fd.get('education') as string,
      workYears: parseInt(fd.get('workYears') as string) || 0,
    }
    setCandidates(prev => [newCandidate, ...prev])
    setAddOpen(false)
    toast.success(`添加成功：已添加考生 ${newCandidate.name}`)
    form.reset()
  }

  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    approved: candidates.filter(c => c.status === 'approved').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考生档案管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理考生报名信息、资格审核、照片管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> 批量导入
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> 新增考生
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">考生总数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600">待审核</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">已通过</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{stats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600">已驳回</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{stats.rejected}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索姓名、身份证号、手机号..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="审核状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已驳回</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="所属单位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部单位</SelectItem>
              <SelectItem value="大亚湾核电">大亚湾核电</SelectItem>
              <SelectItem value="阳江核电">阳江核电</SelectItem>
              <SelectItem value="台山核电">台山核电</SelectItem>
              <SelectItem value="防城港核电">防城港核电</SelectItem>
              <SelectItem value="宁德核电">宁德核电</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" /> 导出
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">身份证号</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">单位/部门</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">申报职业/等级</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">报名时间</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">照片</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-gray-400">{c.gender}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{c.idCard}</td>
                  <td className="px-3 py-2.5 text-gray-600">{c.org}/{c.dept}</td>
                  <td className="px-3 py-2.5">
                    <div className="text-gray-900">{c.profession}</div>
                    <div className="text-xs text-gray-400">{c.level}</div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{c.registerDate}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={c.photo ? 'default' : 'secondary'} className={c.photo ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                      {c.photo ? '已上传' : '未上传'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[c.status].color}`}>
                      {statusMap[c.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setSelected(c); setDetailOpen(true) }}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {c.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-green-600" onClick={() => handleApprove(c.id)}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600" onClick={() => { setSelected(c); setRejectOpen(true) }}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>考生详情</DialogTitle>
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="basic" className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="job">职业信息</TabsTrigger>
                <TabsTrigger value="audit">审核记录</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs text-gray-500">姓名</Label><div className="text-sm font-medium">{selected.name}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">性别</Label><div className="text-sm">{selected.gender}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">身份证号</Label><div className="text-sm font-mono">{selected.idCard}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">联系电话</Label><div className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" />{selected.phone}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">邮箱</Label><div className="text-sm flex items-center gap-1"><Mail className="w-3 h-3" />{selected.email}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">学历</Label><div className="text-sm flex items-center gap-1"><GraduationCap className="w-3 h-3" />{selected.education}</div></div>
                </div>
              </TabsContent>
              <TabsContent value="job" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs text-gray-500">所属单位</Label><div className="text-sm flex items-center gap-1"><Building2 className="w-3 h-3" />{selected.org}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">部门</Label><div className="text-sm">{selected.dept}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">岗位</Label><div className="text-sm">{selected.job}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">申报职业</Label><div className="text-sm">{selected.profession}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">申报等级</Label><div className="text-sm">{selected.level}</div></div>
                  <div className="space-y-1"><Label className="text-xs text-gray-500">工作年限</Label><div className="text-sm">{selected.workYears}年</div></div>
                </div>
              </TabsContent>
              <TabsContent value="audit" className="space-y-3 pt-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{selected.registerDate} 提交报名</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={statusMap[selected.status].color}>{statusMap[selected.status].label}</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增考生</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>姓名 *</Label><Input name="name" required /></div>
              <div className="space-y-1"><Label>性别 *</Label>
                <Select name="gender" defaultValue="男">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="男">男</SelectItem><SelectItem value="女">女</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>身份证号 *</Label><Input name="idCard" required /></div>
              <div className="space-y-1"><Label>联系电话 *</Label><Input name="phone" required /></div>
              <div className="space-y-1"><Label>邮箱</Label><Input name="email" type="email" /></div>
              <div className="space-y-1"><Label>学历</Label>
                <Select name="education" defaultValue="本科">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="大专">大专</SelectItem>
                    <SelectItem value="本科">本科</SelectItem>
                    <SelectItem value="硕士">硕士</SelectItem>
                    <SelectItem value="博士">博士</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>所属单位 *</Label><Input name="org" required /></div>
              <div className="space-y-1"><Label>部门 *</Label><Input name="dept" required /></div>
              <div className="space-y-1"><Label>岗位 *</Label><Input name="job" required /></div>
              <div className="space-y-1"><Label>申报职业 *</Label><Input name="profession" required /></div>
              <div className="space-y-1"><Label>申报等级 *</Label>
                <Select name="level" defaultValue="三级">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="一级">一级/高级技师</SelectItem>
                    <SelectItem value="二级">二级/技师</SelectItem>
                    <SelectItem value="三级">三级/高级</SelectItem>
                    <SelectItem value="四级">四级/中级</SelectItem>
                    <SelectItem value="五级">五级/初级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>工作年限</Label><Input name="workYears" type="number" defaultValue="0" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量导入考生</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">点击或拖拽Excel文件到此处上传</p>
              <p className="text-xs text-gray-400 mt-1">支持 .xlsx, .xls 格式，最大10MB</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
              <p className="font-medium mb-1">导入模板字段说明：</p>
              <p>姓名、身份证号、性别、联系电话、邮箱、单位、部门、岗位、申报职业、申报等级、学历、工作年限</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>取消</Button>
            <Button onClick={() => { setImportOpen(false); toast.success('导入成功：成功导入 12 条考生记录') }}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>驳回原因</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>请填写驳回原因 *</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="例如：资料不完整、不符合报考条件..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={() => selected && handleReject(selected.id)}>确认驳回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
