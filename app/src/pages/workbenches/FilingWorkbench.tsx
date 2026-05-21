import { } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import {
  Building2, FileCheck, Globe, Clock, AlertTriangle,
  ArrowRight, CheckCircle, MapPin, Calendar
} from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

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

const branchFilingStats = [
  { label: '备案材料', value: 0, unit: '份', icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '备案地', value: 3, unit: '个', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '站点', value: 1, unit: '个', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: '认定项目', value: 6, unit: '项', icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: '工作人员', value: 2, unit: '人', icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: '督导人员', value: 4, unit: '人', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: '考评人员', value: 6, unit: '人', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: '考点', value: 1, unit: '个', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const branchFilingLocations = [
  { province: '广东省', city: '深圳市', sites: 1, scopes: 2, staff: 4, status: '审核通过' },
  { province: '北京市', city: '北京市', sites: 0, scopes: 2, staff: 4, status: '审核通过' },
  { province: '天津市', city: '天津市', sites: 0, scopes: 2, staff: 4, status: '正在审核' },
]

export default function FilingWorkbench() {
  const navigate = useNavigate()
  const { user } = useApp()
  const isBranch = user?.role === 'branch_admin'
  const [backendStats] = useBackendListState(stats)
  const [backendBranchStatus] = useBackendListState(branchStatus)
  const [backendProvinceDist] = useBackendListState(provinceDist)
  const [backendTimeline] = useBackendListState(timeline)

  if (isBranch) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">机构备案工作台</h1>
            <p className="mt-1 text-sm text-gray-500">全国性用人单位分支机构备案信息、备案申报和变更上报</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/system/filing-branch')}>
              备案信息 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button onClick={() => navigate('/system/filing-branch/apply')}>
              <Globe className="w-4 h-4 mr-2" /> 备案申报
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-blue-50 text-blue-700">全国性用人单位分支机构</Badge>
                  <Badge className="bg-green-50 text-green-700">审核通过</Badge>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">中广测试有限公司</h2>
                <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-gray-600 sm:grid-cols-2">
                  <span>统一社会信用代码：91110108MA01CGN001</span>
                  <span>联系人：张三</span>
                  <span>联系电话：010-88886666</span>
                  <span>备案地：广东省、北京市、天津市</span>
                  <span className="sm:col-span-2">联系地址：广东省深圳市大亚湾核电基地培训中心</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/filing/group')}>备案查看</Button>
                <Button variant="outline" onClick={() => navigate('/system/filing-branch/modify')}>备案修改</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {branchFilingStats.map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}<span className="ml-1 text-xs font-normal text-gray-400">{s.unit}</span></p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-blue-600" /> 备案地
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {branchFilingLocations.map(item => (
                  <button key={item.province} onClick={() => navigate('/system/filing-branch')} className="rounded-lg border border-gray-200 p-4 text-left hover:border-[#1A56DB] hover:bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{item.province}</div>
                      <Badge className={item.status === '审核通过' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>{item.status}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{item.city}</div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded bg-gray-50 py-2"><b className="block text-gray-900">{item.sites}</b>站点</div>
                      <div className="rounded bg-gray-50 py-2"><b className="block text-gray-900">{item.scopes}</b>项目</div>
                      <div className="rounded bg-gray-50 py-2"><b className="block text-gray-900">{item.staff}</b>人员</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-amber-600" /> 待处理事项
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { title: '天津市备案申请正在审核', desc: '等待主管部门审核意见', path: '/system/filing-branch/apply' },
                { title: '备案变更记录待上报', desc: '工作人员、认定项目变更需统一上报', path: '/system/filing-branch/modify' },
                { title: '考点信息采集表可查看', desc: '进入备案查看核对完整采集表', path: '/filing/group' },
              ].map(item => (
                <button key={item.title} onClick={() => navigate(item.path)} className="w-full rounded-lg p-3 text-left hover:bg-gray-50">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.desc}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">机构备案工作台</h1>
          <p className="text-sm text-gray-500 mt-1">{isBranch ? '本机构备案信息、备案申报和变更上报' : '集团公司及分支机构备案管理'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(isBranch ? '/system/filing-branch' : '/filing/branch')}>
            {isBranch ? '备案信息' : '分支备案'} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={() => navigate(isBranch ? '/system/filing-branch/apply' : '/filing/province')}>
            <Globe className="w-4 h-4 mr-2" /> {isBranch ? '备案申报' : '省级备案'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {backendStats.map((s, i) => (
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
                  {backendBranchStatus.map((b, i) => (
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
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(isBranch ? '/system/filing-branch' : '/filing/branch')}>
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
              {backendProvinceDist.map((p, i) => (
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
              {backendTimeline.map(t => (
                <div key={t.id} className={`p-2 rounded-lg cursor-pointer transition-colors ${t.status === 'urgent' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`} onClick={() => navigate(isBranch ? '/system/filing-branch/modify' : '/filing/branch')}>
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
          { label: '分支备案', path: isBranch ? '/system/filing-branch/apply' : '/filing/branch', icon: MapPin, desc: '省级二次备案' },
          { label: '备案查看', path: '/filing/group', icon: Globe, desc: '备案采集表查看' },
          { label: '备案材料', path: '/system/filing-branch', icon: FileCheck, desc: '备案材料管理' },
        ].filter(item => !isBranch || item.label !== '集团备案').map((item, i) => (
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
