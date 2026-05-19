import { } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import {
  Building2, FileCheck, Globe, Clock, AlertTriangle,
  ArrowRight, CheckCircle, MapPin, Calendar
} from 'lucide-react'

const stats = [
  { label: '集团备案', value: 1, unit: '项', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '分支机构', value: 28, unit: '家', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '已备案机构', value: 24, unit: '家', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: '待备案/年审', value: 4, unit: '家', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
]

const branchStatus = [
  { name: '大亚湾核电', province: '广东', status: 'approved', type: '初次备案', date: '2025-06-01', expiry: '2028-06-01' },
  { name: '阳江核电', province: '广东', status: 'approved', type: '初次备案', date: '2025-08-15', expiry: '2028-08-15' },
  { name: '台山核电', province: '广东', status: 'approved', type: '年审通过', date: '2026-03-20', expiry: '2029-03-20' },
  { name: '防城港核电', province: '广西', status: 'approved', type: '初次备案', date: '2025-09-10', expiry: '2028-09-10' },
  { name: '宁德核电', province: '福建', status: 'pending', type: '待年审', date: '2026-01-15', expiry: '2026-06-15' },
  { name: '红沿河核电', province: '辽宁', status: 'pending', type: '待备案', date: '-', expiry: '-' },
  { name: '惠州核电', province: '广东', status: 'rejected', type: '材料退回', date: '-', expiry: '-' },
  { name: '苍南核电', province: '浙江', status: 'pending', type: '待备案', date: '-', expiry: '-' },
]

const statusMap: Record<string, { label: string; color: string; badge: string }> = {
  approved: { label: '已通过', color: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  pending: { label: '待审核', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  rejected: { label: '已驳回', color: 'text-red-600', badge: 'bg-red-100 text-red-700' },
}

const provinceDist = [
  { name: '广东', count: 12 },
  { name: '广西', count: 3 },
  { name: '福建', count: 3 },
  { name: '辽宁', count: 2 },
  { name: '浙江', count: 2 },
  { name: '山东', count: 2 },
  { name: '海南', count: 1 },
  { name: '其他', count: 3 },
]

const timeline = [
  { id: 1, title: '集团备案更新', desc: '人力资源社会保障部备案信息年度更新', date: '2026-06-01', status: 'upcoming' },
  { id: 2, title: '大亚湾核电年审', desc: '省级人社部门年审材料提交', date: '2026-06-15', status: 'upcoming' },
  { id: 3, title: '阳江核电年审', desc: '省级人社部门年审材料提交', date: '2026-08-15', status: 'normal' },
  { id: 4, title: '惠州核电补交材料', desc: '根据审核意见补充完善备案材料', date: '2026-05-30', status: 'urgent' },
  { id: 5, title: '新增红沿河核电备案', desc: '首次向辽宁省人社部门提交备案申请', date: '2026-07-01', status: 'normal' },
]

export default function FilingWorkbench() {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">机构备案工作台</h1>
          <p className="text-sm text-gray-500 mt-1">集团公司及分支机构备案管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/filing/branch')}>
            分支备案 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={() => navigate('/filing/province')}>
            <Globe className="w-4 h-4 mr-2" /> 省级备案
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
                  <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}<span className="text-xs font-normal text-gray-400 ml-1">{s.unit}</span></p>
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
              <Building2 className="w-4 h-4 text-blue-600" />
              分支机构备案状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">机构名称</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">省份</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">类型</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">备案日期</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">有效期至</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchStatus.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-sm">{b.name}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{b.province}</td>
                      <td className="px-3 py-2.5 text-xs">{b.type}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{b.date}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{b.expiry}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMap[b.status].badge}`}>
                          {statusMap[b.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate('/filing/branch')}>
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
                <Globe className="w-4 h-4 text-green-600" />
                省份分布
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {provinceDist.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="text-gray-500">{p.count}家</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(p.count / 12) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                备案时间线
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeline.map(t => (
                <div key={t.id} className={`p-2 rounded-lg cursor-pointer transition-colors ${t.status === 'urgent' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`} onClick={() => navigate('/filing/branch')}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'urgent' ? 'bg-red-500' : t.status === 'upcoming' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                      <p className="text-xs text-gray-500 truncate">{t.desc}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{t.date}</span>
                        {t.status === 'urgent' && <Badge variant="destructive" className="text-[9px] ml-2">紧急</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '集团备案', path: '/system/filing-group', icon: Building2, desc: '人社部备案管理' },
          { label: '分支备案', path: '/filing/branch', icon: MapPin, desc: '省级二次备案' },
          { label: '省级备案', path: '/filing/province', icon: Globe, desc: '省级人社部门备案' },
          { label: '备案材料', path: '/system/filing-branch', icon: FileCheck, desc: '备案材料管理' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.path)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-green-600" />
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
