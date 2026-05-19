import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users, Plus, Upload, Download, CheckCircle, Trash2,
  FileSpreadsheet, AlertTriangle, ChevronRight, UserPlus, RotateCcw
} from 'lucide-react'

interface RegistrationPlan {
  id: number
  planNo: string
  planName: string
  examMonth: string
  regDeadline: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  regCount: number
  batchCount: number
}

interface RegBatch {
  id: number
  name: string
  orgName: string
  candidateCount: number
  status: 'open' | 'closed'
  createdAt: string
}

interface Candidate {
  id: number
  name: string
  gender: string
  idCard: string
  profession: string
  level: string
  photo: boolean
  type: 'normal' | 'makeup'
  orgName: string
  batchId: number
}

const mockPlans: RegistrationPlan[] = [
  { id: 1, planNo: '20260324001', planName: '大亚湾核电2026年第1批认定', examMonth: '2026年04月', regDeadline: '2026-03-15', status: 'pending', regCount: 45, batchCount: 2 },
  { id: 2, planNo: '20260324002', planName: '阳江核电2026年第1批认定', examMonth: '2026年05月', regDeadline: '2026-04-10', status: 'submitted', regCount: 32, batchCount: 1 },
  { id: 3, planNo: '20260324003', planName: '台山核电2026年第2批认定', examMonth: '2026年06月', regDeadline: '2026-05-20', status: 'approved', regCount: 28, batchCount: 1 },
]

const mockBatches: RegBatch[] = [
  { id: 1, name: '报名批次-1', orgName: '运行一部', candidateCount: 25, status: 'open', createdAt: '2026-03-01' },
  { id: 2, name: '报名批次-2', orgName: '维修部', candidateCount: 20, status: 'open', createdAt: '2026-03-02' },
]

const mockCandidates: Candidate[] = [
  { id: 1, name: '张三', gender: '男', idCard: '440301199001011234', profession: '核反应堆操作员', level: '三级', photo: true, type: 'normal', orgName: '运行一部', batchId: 1 },
  { id: 2, name: '李四', gender: '女', idCard: '440301199205063456', profession: '电气维修工', level: '四级', photo: true, type: 'normal', orgName: '运行一部', batchId: 1 },
  { id: 3, name: '王五', gender: '男', idCard: '440301198803127890', profession: '仪表维修工', level: '三级', photo: false, type: 'normal', orgName: '维修部', batchId: 2 },
  { id: 4, name: '赵六', gender: '男', idCard: '440301199511224567', profession: '汽轮机操作员', level: '四级', photo: true, type: 'makeup', orgName: '维修部', batchId: 2 },
  { id: 5, name: '孙七', gender: '女', idCard: '440301199307088901', profession: '化学分析员', level: '三级', photo: true, type: 'normal', orgName: '运行一部', batchId: 1 },
]

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待报名', color: 'bg-yellow-100 text-yellow-700' },
  submitted: { label: '已提交', color: 'bg-blue-100 text-blue-700' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  rejected: { label: '已退回', color: 'bg-red-100 text-red-700' },
}

export default function ExamRegistration() {
  const [plans] = useState<RegistrationPlan[]>(mockPlans)
  const [batches, setBatches] = useState<RegBatch[]>(mockBatches)
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<number>(1)
  const [addBatchOpen, setAddBatchOpen] = useState(false)
  const [addCandidateOpen, setAddCandidateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [checkMultiCert, setCheckMultiCert] = useState(false)
  const [activeTab, setActiveTab] = useState('todo')

  const filteredCandidates = candidates.filter(c => c.batchId === selectedBatch)

  const handleAddBatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newBatch: RegBatch = {
      id: Date.now(),
      name: fd.get('name') as string,
      orgName: fd.get('orgName') as string,
      candidateCount: 0,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setBatches(prev => [...prev, newBatch])
    setAddBatchOpen(false)
    toast.success(`新增报名批次：${newBatch.name}`)
    form.reset()
  }

  const handleAddCandidate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newCandidate: Candidate = {
      id: Date.now(),
      name: fd.get('name') as string,
      gender: fd.get('gender') as string,
      idCard: fd.get('idCard') as string,
      profession: fd.get('profession') as string,
      level: fd.get('level') as string,
      photo: false,
      type: fd.get('type') as 'normal' | 'makeup' ?? 'normal',
      orgName: batches.find(b => b.id === selectedBatch)?.orgName || '',
      batchId: selectedBatch,
    }
    setCandidates(prev => [...prev, newCandidate])
    setBatches(prev => prev.map(b => b.id === selectedBatch ? { ...b, candidateCount: b.candidateCount + 1 } : b))
    setAddCandidateOpen(false)
    toast.success(`添加考生：${newCandidate.name}`)
    form.reset()
  }

  const handleDeleteCandidate = (id: number) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
    setBatches(prev => prev.map(b => b.id === selectedBatch ? { ...b, candidateCount: Math.max(0, b.candidateCount - 1) } : b))
    toast.success('已删除考生')
  }

  const handleEndRegistration = () => {
    toast.success('报名已结束提交')
    setActiveTab('done')
  }

  const handleCheckMultiCert = () => {
    setCheckMultiCert(true)
    toast.success('一人多证检查完成，未发现异常')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考试报名</h1>
          <p className="text-sm text-gray-500 mt-1">集体报名管理，支持批量导入、补考、一人多证检查</p>
        </div>
        {selectedPlan && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCheckMultiCert}>
              <AlertTriangle className="w-4 h-4 mr-2" /> 检查一人多证
            </Button>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" /> 导入
            </Button>
            <Button onClick={() => setAddCandidateOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> 添加考生
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todo">
            待办 ({plans.filter(p => p.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="done">
            已办 ({plans.filter(p => p.status !== 'pending').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todo" className="space-y-4 pt-4">
          {!selectedPlan ? (
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">考试月份</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">报名截止</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.filter(p => p.status === 'pending').map((plan, idx) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{plan.planNo}</td>
                      <td className="px-4 py-3 font-medium">{plan.planName}</td>
                      <td className="px-4 py-3 text-gray-600">{plan.examMonth}</td>
                      <td className="px-4 py-3 text-gray-500">{plan.regDeadline}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[plan.status].color}`}>
                          {statusMap[plan.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" onClick={() => setSelectedPlan(plan.id)}>
                          集体报名 <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setSelectedPlan(null)}>
                  <RotateCcw className="w-3 h-3 mr-1" /> 返回计划列表
                </Button>
                <span className="text-sm text-gray-500">
                  当前计划：{plans.find(p => p.id === selectedPlan)?.planName}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-4">
                {/* Left: Batch list */}
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">报名批次</h3>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddBatchOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" /> 新增批次
                    </Button>
                  </div>
                  {batches.map(batch => (
                    <div
                      key={batch.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedBatch === batch.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedBatch(batch.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{batch.name}</span>
                        <Badge variant="outline" className="text-[10px]">{batch.candidateCount}人</Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{batch.orgName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{batch.createdAt}</div>
                      <div className="mt-1">
                        <Badge className={`text-[10px] ${batch.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {batch.status === 'open' ? '正在报名' : '已结束'}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Actions */}
                  <div className="pt-2 space-y-2 border-t mt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.success('申报表已导出')}>导出申报表</Button>
                    <Button variant="default" size="sm" className="w-full text-xs" onClick={handleEndRegistration}>结束报名</Button>
                  </div>
                </div>

                {/* Right: Candidate list */}
                <div className="col-span-9">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          考生列表 ({filteredCandidates.length})
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => toast.success('报名报表已导出')}>
                            <FileSpreadsheet className="w-3 h-3 mr-1" /> 报名报表
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => toast.success('导入模板已下载')}>
                            <Download className="w-3 h-3 mr-1" /> 下载模板
                          </Button>
                          <Button size="sm" className="text-xs h-8" onClick={() => setAddCandidateOpen(true)}>
                            <Plus className="w-3 h-3 mr-1" /> 添加考生
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left"><input type="checkbox" /></th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">序号</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">姓名</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">性别</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">照片</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">证件号码</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">职业工种</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">多证检查</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">技能等级</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">类型</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredCandidates.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="px-3 py-12 text-center text-gray-400">
                                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                  <p>暂无数据</p>
                                  <p className="text-xs mt-1">点击「添加考生」或「导入」录入考生信息</p>
                                </td>
                              </tr>
                            ) : (
                              filteredCandidates.map((c, idx) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2"><input type="checkbox" /></td>
                                  <td className="px-3 py-2 text-xs">{idx + 1}</td>
                                  <td className="px-3 py-2 font-medium">{c.name}</td>
                                  <td className="px-3 py-2 text-xs">{c.gender}</td>
                                  <td className="px-3 py-2">
                                    <Badge variant="outline" className={`text-[10px] ${c.photo ? 'text-green-600' : 'text-red-600'}`}>
                                      {c.photo ? '已上传' : '未上传'}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2 text-xs font-mono text-gray-500">{c.idCard}</td>
                                  <td className="px-3 py-2 text-xs">{c.profession}</td>
                                  <td className="px-3 py-2 text-xs">
                                    <span className="text-green-600">同职业0个 其他职业0个</span>
                                  </td>
                                  <td className="px-3 py-2 text-xs">{c.level}</td>
                                  <td className="px-3 py-2">
                                    <Badge variant="outline" className={`text-[10px] ${c.type === 'makeup' ? 'text-amber-600' : 'text-blue-600'}`}>
                                      {c.type === 'makeup' ? '补考' : '正考'}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">查看</Button>
                                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">申报表</Button>
                                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDeleteCandidate(c.id)}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {checkMultiCert && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">一人多证检查完成，未发现异常情况</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="done" className="space-y-4 pt-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">考试月份</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">报名人数</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.filter(p => p.status !== 'pending').map((plan, idx) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{plan.planNo}</td>
                    <td className="px-4 py-3 font-medium">{plan.planName}</td>
                    <td className="px-4 py-3 text-gray-600">{plan.examMonth}</td>
                    <td className="px-4 py-3">{plan.regCount}人</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[plan.status].color}`}>
                        {statusMap[plan.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">查看详情</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Batch Dialog */}
      <Dialog open={addBatchOpen} onOpenChange={setAddBatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增报名批次</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBatch} className="space-y-3">
            <div className="space-y-1"><Label>批次名称 *</Label><Input name="name" required placeholder="如：报名批次-3" /></div>
            <div className="space-y-1"><Label>报名机构 *</Label>
              <Select name="orgName" defaultValue="运行一部">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="运行一部">运行一部</SelectItem>
                  <SelectItem value="运行二部">运行二部</SelectItem>
                  <SelectItem value="维修部">维修部</SelectItem>
                  <SelectItem value="仪控部">仪控部</SelectItem>
                  <SelectItem value="技术部">技术部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddBatchOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>添加考生</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCandidate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>姓名 *</Label><Input name="name" required /></div>
              <div className="space-y-1"><Label>性别 *</Label>
                <Select name="gender" defaultValue="男">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="男">男</SelectItem><SelectItem value="女">女</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>身份证号 *</Label><Input name="idCard" required /></div>
              <div className="space-y-1"><Label>职业工种 *</Label><Input name="profession" required /></div>
              <div className="space-y-1"><Label>技能等级 *</Label>
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
              <div className="space-y-1"><Label>考试类型</Label>
                <Select name="type" defaultValue="normal">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">正考</SelectItem>
                    <SelectItem value="makeup">补考</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddCandidateOpen(false)}>取消</Button>
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
              <p className="text-xs text-gray-400 mt-1">支持 .xlsx, .xls 格式</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
              <p className="font-medium mb-1">导入字段说明：</p>
              <p>姓名、性别、身份证号、职业工种、技能等级、考试类型、申报条件编号</p>
              <p className="mt-1 text-amber-600">注：编辑完成后，请删除表中的说明文字</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>取消</Button>
            <Button onClick={() => { setImportOpen(false); toast.success('成功导入考生信息') }}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
