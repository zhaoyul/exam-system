import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Building2, FileText, MapPin, Users, Shield,
  Upload, Search, Plus, Edit3, CheckCircle
} from 'lucide-react'

// 集团备案 - 区别于分支机构备案
// 集团备案：集团向人社部备案，管理集团层面信息、认定项目、分支机构授权
// 分支机构备案：分支机构向省级人社部门备案，管理8个详细信息标签

interface BranchOrg {
  id: number
  name: string
  orgCode: string
  province: string
  city: string
  contact: string
  phone: string
  certCount: number
  status: 'active' | 'pending' | 'inactive'
}

interface EvalProject {
  id: number
  professionName: string
  jobTypeName: string
  level: string
  levelCode: string
  examTheory: boolean
  examSkill: boolean
  examComposite: boolean
  passScore: number
  conditionCount: number
}

const mockBranches: BranchOrg[] = [
  { id: 1, name: '大亚湾核电运营管理有限责任公司', orgCode: 'CSN-DYW', province: '广东', city: '深圳', contact: '张主任', phone: '0755-12345678', certCount: 12, status: 'active' },
  { id: 2, name: '阳江核电有限公司', orgCode: 'CSN-YJ', province: '广东', city: '阳江', contact: '李主任', phone: '0755-12345679', certCount: 8, status: 'active' },
  { id: 3, name: '台山核电合营有限公司', orgCode: 'CSN-TS', province: '广东', city: '江门', contact: '王主任', phone: '0755-12345680', certCount: 10, status: 'active' },
  { id: 4, name: '广西防城港核电有限公司', orgCode: 'CSN-FCG', province: '广西', city: '防城港', contact: '赵主任', phone: '0770-12345678', certCount: 6, status: 'pending' },
  { id: 5, name: '福建宁德核电有限公司', orgCode: 'CSN-ND', province: '福建', city: '宁德', contact: '孙主任', phone: '0593-12345678', certCount: 5, status: 'active' },
]

const mockProjects: EvalProject[] = [
  { id: 1, professionName: '核反应堆运行值班员', jobTypeName: '核反应堆运行值班员', level: '三级', levelCode: '3', examTheory: true, examSkill: true, examComposite: false, passScore: 60.0, conditionCount: 3 },
  { id: 2, professionName: '电气值班员', jobTypeName: '电气值班员', level: '四级', levelCode: '4', examTheory: true, examSkill: true, examComposite: false, passScore: 60.0, conditionCount: 2 },
  { id: 3, professionName: '汽轮机运行值班员', jobTypeName: '汽轮机运行值班员', level: '三级', levelCode: '3', examTheory: true, examSkill: true, examComposite: false, passScore: 60.0, conditionCount: 3 },
  { id: 4, professionName: '仪器仪表维修工', jobTypeName: '仪器仪表维修工', level: '四级', levelCode: '4', examTheory: true, examSkill: true, examComposite: false, passScore: 60.0, conditionCount: 2 },
]

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: '已备案', color: 'bg-green-100 text-green-700' },
  pending: { label: '待备案', color: 'bg-yellow-100 text-yellow-700' },
  inactive: { label: '已停用', color: 'bg-gray-100 text-gray-700' },
}

export default function GroupFiling() {
  const [activeTab, setActiveTab] = useState('basic')
  const [branches] = useState<BranchOrg[]>(mockBranches)
  const [projects] = useState<EvalProject[]>(mockProjects)
  const [search, setSearch] = useState('')

  const filteredProjects = projects.filter(p => !search || p.professionName.includes(search) || p.jobTypeName.includes(search))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">集团备案</h1>
          <p className="text-sm text-gray-500 mt-1">集团向人社部备案，管理集团层面信息、认定项目、分支机构授权</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">区别于分支机构备案（向省级人社部门备案）</Badge>
      </div>

      {/* Group Basic Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="font-bold text-gray-900">中国广核集团有限公司</h2>
            <p className="text-sm text-gray-500">统一社会信用代码：91440300100016901X</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">机构类型：</span><span>央企集团</span></div>
          <div><span className="text-gray-500">联系人：</span><span>王集团</span></div>
          <div><span className="text-gray-500">联系电话：</span><span>0755-88618888</span></div>
          <div><span className="text-gray-500">电子邮箱：</span><span>cgnc@cgnpc.com.cn</span></div>
          <div><span className="text-gray-500">企业性质：</span><span>央企</span></div>
          <div><span className="text-gray-500">主管部门：</span><span>国务院国资委</span></div>
          <div><span className="text-gray-500">单位地址：</span><span>深圳市福田区深南大道2002号中广核大厦</span></div>
          <div><span className="text-gray-500">分支机构数：</span><span className="font-bold text-blue-600">{branches.length}家</span></div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <Building2 className="w-4 h-4 mr-1" /> 基本信息
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FileText className="w-4 h-4 mr-1" /> 认定项目
          </TabsTrigger>
          <TabsTrigger value="branches">
            <MapPin className="w-4 h-4 mr-1" /> 分支机构
          </TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-6 bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> 机构信息
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">机构全称</span>
                  <span>中国广核集团有限公司</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">机构简称</span>
                  <span>中广核集团</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">统一社会信用代码</span>
                  <span className="font-mono">91440300100016901X</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">企业性质</span>
                  <span>央企</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">负责人</span>
                  <span>杨长利</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">负责人职务</span>
                  <span>董事长</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" /> 联系信息
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">联系人</span>
                  <span>王集团</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">联系人职务</span>
                  <span>人力资源部主任</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">联系电话</span>
                  <span>0755-88618888</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">电子邮箱</span>
                  <span>cgnc@cgnpc.com.cn</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">单位地址</span>
                  <span>深圳市福田区深南大道2002号</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">主管部门</span>
                  <span>国务院国资委</span>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" /> 人员场地、设备设施以及组织优势、专业优势
              </h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                中国广核集团是我国唯一以核电为主业、由国务院国资委监管的大型清洁能源中央企业。
                集团拥有大亚湾、阳江、台山、防城港、宁德、红沿河等核电站，具备完善的技能人才培养体系和鉴定设施。
                集团人力资源部门设有专门的职业技能鉴定中心，配备先进的实训设备和考评场地。
              </p>
            </div>
          </div>
        </TabsContent>

        {/* 认定项目 */}
        <TabsContent value="projects" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索职业工种..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success('下载模板')}>
                <Upload className="w-3.5 h-3.5 mr-1" /> 下载模板
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('导入认定项目')}>
                <Upload className="w-3.5 h-3.5 mr-1" /> 导入
              </Button>
              <Button size="sm" onClick={() => toast.success('新增认定项目')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> 添加
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">职业名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">工种名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">认定等级</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">理论考试</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">技能考试</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">综合</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">及格线</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">申报条件</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{p.professionName}</td>
                    <td className="px-4 py-3 text-xs">{p.jobTypeName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">{p.level}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.examTheory ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.examSkill ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.examComposite ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">{p.passScore}分</td>
                    <td className="px-4 py-3 text-xs">{p.conditionCount}个</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">详情</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Edit3 className="w-3 h-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 分支机构 */}
        <TabsContent value="branches" className="space-y-4 pt-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">分支机构名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">机构编码</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">省份</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">城市</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">联系人</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">联系电话</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">职业等级数</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branches.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{b.orgCode}</td>
                    <td className="px-4 py-3 text-xs">{b.province}</td>
                    <td className="px-4 py-3 text-xs">{b.city}</td>
                    <td className="px-4 py-3 text-xs">{b.contact}</td>
                    <td className="px-4 py-3 text-xs">{b.phone}</td>
                    <td className="px-4 py-3 text-xs">{b.certCount}个</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMap[b.status].color}`}>
                        {statusMap[b.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">授权</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">查看</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
