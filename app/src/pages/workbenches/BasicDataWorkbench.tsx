import { } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Database, Settings, Users, Building2, BookOpen,
  ArrowRight, Shield, FileText, Layers, Globe, KeyRound, Cog
} from 'lucide-react'

const stats = [
  { label: '系统用户', value: 1280, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/system/users' },
  { label: '机构数量', value: 35, icon: Building2, color: 'text-green-600', bg: 'bg-green-50', path: '/cert/organizations' },
  { label: '职业标准', value: 68, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', path: '/standard/library' },
  { label: '操作日志', value: 25680, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', path: '/system/logs' },
]

const dataModules = [
  {
    title: '组织架构',
    icon: Building2,
    color: 'bg-blue-500',
    items: [
      { label: '认定机构管理', path: '/cert/organizations', desc: '8家单位已配置' },
      { label: '单位部门管理', path: '/system/personnel', desc: '156个部门' },
      { label: '岗位管理', path: '/system/personnel', desc: '423个岗位' },
    ],
  },
  {
    title: '人员数据',
    icon: Users,
    color: 'bg-green-500',
    items: [
      { label: '系统用户管理', path: '/system/users', desc: '1280名用户' },
      { label: '人员信息管理', path: '/system/personnel', desc: '5600条记录' },
      { label: '评价专家管理', path: '/supervision/expert-info', desc: '286名专家' },
    ],
  },
  {
    title: '标准题库',
    icon: BookOpen,
    color: 'bg-purple-500',
    items: [
      { label: '职业标准库', path: '/standard/library', desc: '68个职业标准' },
      { label: '理论题库', path: '/question/theory', desc: '12856道题目' },
      { label: '技能题库', path: '/question/skill', desc: '3850道题目' },
    ],
  },
  {
    title: '系统配置',
    icon: Settings,
    color: 'bg-amber-500',
    items: [
      { label: '系统参数配置', path: '/system/config', desc: '56项参数' },
      { label: '操作日志', path: '/system/logs', desc: '25680条日志' },
      { label: '公告通知', path: '/system/announcements', desc: '12条公告' },
    ],
  },
]

const recentLogs = [
  { id: 1, user: 'admin', action: '新增用户', target: 'user_zhangsan', time: '2分钟前', type: 'create' },
  { id: 2, user: 'admin', action: '修改配置', target: 'system_config_captcha', time: '15分钟前', type: 'update' },
  { id: 3, user: 'li_si', action: '导入题目', target: 'theory_qb_batch_001', time: '32分钟前', type: 'import' },
  { id: 4, user: 'wang_wu', action: '审核通过', target: 'cert_plan_2026_03', time: '1小时前', type: 'audit' },
  { id: 5, user: 'admin', action: '备份数据', target: 'full_backup_20260518', time: '3小时前', type: 'backup' },
]

const typeColor: Record<string, string> = {
  create: 'bg-blue-100 text-blue-700',
  update: 'bg-amber-100 text-amber-700',
  import: 'bg-green-100 text-green-700',
  audit: 'bg-purple-100 text-purple-700',
  backup: 'bg-gray-100 text-gray-700',
}

const typeLabel: Record<string, string> = {
  create: '新增',
  update: '修改',
  import: '导入',
  audit: '审核',
  backup: '备份',
}

export default function BasicDataWorkbench() {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">基础数据工作台</h1>
          <p className="text-sm text-gray-500 mt-1">系统基础数据管理与配置中心</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/system/config')}>
            <Settings className="w-4 h-4 mr-2" /> 系统配置
          </Button>
          <Button onClick={() => navigate('/data/center')}>
            <Database className="w-4 h-4 mr-2" /> 数据管理
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(s.path)}>
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

      <div className="grid grid-cols-2 gap-4">
        {dataModules.map((mod, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={`w-6 h-6 rounded ${mod.color} flex items-center justify-center`}>
                  <mod.icon className="w-3.5 h-3.5 text-white" />
                </div>
                {mod.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mod.items.map((item, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(item.path)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              最近操作日志
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作人</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作类型</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作内容</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">对象</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-600">时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentLogs.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm font-medium">{l.user}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColor[l.type]}`}>
                          {typeLabel[l.type]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{l.action}</td>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{l.target}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-400">{l.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              系统健康状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: '数据库连接', status: 'normal', detail: '响应 12ms' },
              { label: '文件存储', status: 'normal', detail: '剩余 85%' },
              { label: '定时任务', status: 'normal', detail: '3/3 运行中' },
              { label: '备份状态', status: 'normal', detail: '最近 3小时前' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'normal' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-xs text-gray-500">{item.detail}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/system/config')}>
                <Cog className="w-3 h-3 mr-1" /> 查看详细配置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '用户管理', path: '/system/users', icon: Users, desc: '系统用户与权限' },
          { label: '机构管理', path: '/cert/organizations', icon: Globe, desc: '认定机构配置' },
          { label: '标准管理', path: '/standard/library', icon: Layers, desc: '职业标准库' },
          { label: '系统配置', path: '/system/config', icon: KeyRound, desc: '参数与开关' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.path)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600" />
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
