import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import {
  Link2, Search, FileSearch, TrendingUp, CheckCircle,
  ArrowRight, Shield, User, Award, AlertTriangle
} from 'lucide-react'

const stats = [
  { label: '追溯记录总数', value: 15820, icon: FileSearch, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '本月追溯', value: 486, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '完整追溯链', value: 15240, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: '异常记录', value: 23, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
]

const recentTraces = [
  { id: 'TR-2026-0001', name: '张三', certNo: 'CGN-2026-001', type: '证书溯源', org: '大亚湾核电', date: '2026-05-18', status: 'complete' },
  { id: 'TR-2026-0002', name: '李四', certNo: 'CGN-2026-002', type: '成绩溯源', org: '阳江核电', date: '2026-05-17', status: 'complete' },
  { id: 'TR-2026-0003', name: '王五', certNo: 'CGN-2026-003', type: '认定溯源', org: '台山核电', date: '2026-05-17', status: 'processing' },
  { id: 'TR-2026-0004', name: '赵六', certNo: 'CGN-2026-004', type: '证书溯源', org: '防城港核电', date: '2026-05-16', status: 'complete' },
  { id: 'TR-2026-0005', name: '孙七', certNo: 'CGN-2026-005', type: '评价溯源', org: '宁德核电', date: '2026-05-16', status: 'abnormal' },
]

const orgStats = [
  { name: '大亚湾核电', total: 4250, thisMonth: 128 },
  { name: '阳江核电', total: 3560, thisMonth: 95 },
  { name: '台山核电', total: 3120, thisMonth: 82 },
  { name: '防城港核电', total: 2800, thisMonth: 76 },
  { name: '宁德核电', total: 2090, thisMonth: 55 },
]

const statusMap: Record<string, { label: string; color: string }> = {
  complete: { label: '完整', color: 'bg-green-100 text-green-700' },
  processing: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  abnormal: { label: '异常', color: 'bg-red-100 text-red-700' },
}

export default function TraceabilityWorkbench() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">溯源中心工作台</h1>
          <p className="text-sm text-gray-500 mt-1">职业技能等级认定全流程追溯与查询</p>
        </div>
        <Button onClick={() => navigate('/traceability')}>
          <Link2 className="w-4 h-4 mr-2" /> 进入溯源查询
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value.toLocaleString()}</p>
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
              <FileSearch className="w-4 h-4 text-blue-600" />
              最近追溯记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">追溯编号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">证书编号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">类型</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">单位</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTraces.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-600">{t.id}</td>
                      <td className="px-3 py-2.5 font-medium">{t.name}</td>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{t.certNo}</td>
                      <td className="px-3 py-2.5 text-xs">{t.type}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{t.org}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMap[t.status].color}`}>
                          {statusMap[t.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate('/traceability')}>
                          查看 <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
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
                <Shield className="w-4 h-4 text-blue-600" />
                快速溯源查询
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="输入证书编号或身份证号"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/traceability')}>
                  <Award className="w-3 h-3 mr-1" /> 证书溯源
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/traceability')}>
                  <User className="w-3 h-3 mr-1" /> 人员溯源
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                各单位追溯量
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {orgStats.map((o, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{o.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{o.total.toLocaleString()}</span>
                    <Badge variant="outline" className="text-[10px]">+{o.thisMonth}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '证书溯源', path: '/traceability', icon: Award, desc: '按证书编号追溯' },
          { label: '人员溯源', path: '/traceability', icon: User, desc: '按人员信息追溯' },
          { label: '认定溯源', path: '/traceability', icon: FileSearch, desc: '认定全流程追溯' },
          { label: '异常处理', path: '/traceability', icon: AlertTriangle, desc: '异常记录处理' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.path)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-blue-600" />
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
