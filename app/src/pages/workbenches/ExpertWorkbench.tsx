import { } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Users, Shield, Award, ClipboardCheck, TrendingUp,
  ArrowRight, Star, Calendar, MapPin, GraduationCap, Clock
} from 'lucide-react'

const stats = [
  { label: '专家总数', value: 286, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '在聘专家', value: 210, icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '待派遣任务', value: 18, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: '本月评价', value: 45, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const experts = [
  { id: 'EXP-001', name: '张建国', title: '高级工程师', field: '核能工程', org: '大亚湾核电', status: 'active', rating: 4.8, missions: 32, years: 12 },
  { id: 'EXP-002', name: '李秀芳', title: '教授级高工', field: '电气工程', org: '阳江核电', status: 'active', rating: 4.9, missions: 28, years: 15 },
  { id: 'EXP-003', name: '王志强', title: '高级工程师', field: '自动化', org: '台山核电', status: 'dispatched', rating: 4.7, missions: 25, years: 10 },
  { id: 'EXP-004', name: '赵丽华', title: '工程师', field: '热能动力', org: '防城港核电', status: 'active', rating: 4.6, missions: 18, years: 8 },
  { id: 'EXP-005', name: '孙伟明', title: '高级工程师', field: '化学工程', org: '宁德核电', status: 'training', rating: 4.5, missions: 15, years: 9 },
]

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: '在聘', color: 'bg-green-100 text-green-700' },
  dispatched: { label: '已派遣', color: 'bg-blue-100 text-blue-700' },
  training: { label: '培训中', color: 'bg-amber-100 text-amber-700' },
  retired: { label: '已解聘', color: 'bg-gray-100 text-gray-700' },
}

const fieldDist = [
  { name: '核能工程', count: 68 },
  { name: '电气工程', count: 52 },
  { name: '自动化', count: 45 },
  { name: '热能动力', count: 38 },
  { name: '化学工程', count: 32 },
  { name: '机械工程', count: 28 },
  { name: '仪控工程', count: 23 },
]

const upcomingTasks = [
  { id: 1, title: '大亚湾核电三级认定督导', date: '2026-05-25', org: '大亚湾核电', experts: 3 },
  { id: 2, title: '阳江核电四级认定督导', date: '2026-05-28', org: '阳江核电', experts: 2 },
  { id: 3, title: '台山核电实操考评', date: '2026-06-02', org: '台山核电', experts: 4 },
  { id: 4, title: '防城港港核电理论考评', date: '2026-06-05', org: '防城港核电', experts: 2 },
]

export default function ExpertWorkbench() {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">评价专家工作台</h1>
          <p className="text-sm text-gray-500 mt-1">质量督导专家管理与派遣调度</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/supervision/expert-info')}>
            专家库 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={() => navigate('/supervision/dispatch')}>
            <ClipboardCheck className="w-4 h-4 mr-2" /> 派遣管理
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              专家列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">编号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">职称</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">专业领域</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">单位</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">评分</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">派遣</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {experts.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/supervision/expert-info')}>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{e.id}</td>
                      <td className="px-3 py-2.5 font-medium">{e.name}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{e.title}</td>
                      <td className="px-3 py-2.5 text-xs">{e.field}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{e.org}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMap[e.status].color}`}>
                          {statusMap[e.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium">{e.rating}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{e.missions}次</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                专业领域分布
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fieldDist.map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700">{f.name}</span>
                    <span className="text-gray-500">{f.count}人</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(f.count / 68) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                即将开始的督导任务
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks.map(t => (
                <div key={t.id} className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate('/supervision/dispatch')}>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.org}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.experts}人</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '专家信息', path: '/supervision/expert-info', icon: Users, desc: '专家库管理与查询' },
          { label: '专家聘用', path: '/supervision/hiring', icon: Award, desc: '专家聘用管理' },
          { label: '专家派遣', path: '/supervision/dispatch', icon: ClipboardCheck, desc: '派遣调度管理' },
          { label: '督导培训', path: '/supervision/training', icon: GraduationCap, desc: '培训记录管理' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.path)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
