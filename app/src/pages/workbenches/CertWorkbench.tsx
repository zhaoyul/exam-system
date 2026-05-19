import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle, TrendingUp,
  Building2, Award, ArrowRight, Calendar, FileCheck
} from 'lucide-react'

const stats = [
  { label: '本年度认定计划', value: 24, unit: '个', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '进行中认定', value: 8, unit: '个', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: '已完成认定', value: 156, unit: '人次', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '待审批申请', value: 12, unit: '条', icon: FileCheck, color: 'text-red-600', bg: 'bg-red-50' },
]

const planProgress = [
  { name: '2026年第一批等级认定', org: '大亚湾核电', status: 'in_progress', progress: 65, total: 120, completed: 78, date: '2026-03-15' },
  { name: '2026年第二批等级认定', org: '阳江核电', status: 'pending', progress: 30, total: 95, completed: 28, date: '2026-04-20' },
  { name: '2026年第三批等级认定', org: '台山核电', status: 'in_progress', progress: 80, total: 80, completed: 64, date: '2026-05-10' },
  { name: '2026年第四批等级认定', org: '防城港核电', status: 'pending', progress: 10, total: 60, completed: 6, date: '2026-06-01' },
]

const todos = [
  { id: 1, title: '大亚湾核电认定计划待审批', type: '审批', urgency: 'high', time: '2小时前' },
  { id: 2, title: '阳江核电考务安排需确认', type: '考务', urgency: 'medium', time: '5小时前' },
  { id: 3, title: '台山核电成绩待录入', type: '成绩', urgency: 'high', time: '1天前' },
  { id: 4, title: '防城港核电证书待核发', type: '证书', urgency: 'medium', time: '2天前' },
  { id: 5, title: '宁德核电认定材料补交提醒', type: '材料', urgency: 'low', time: '3天前' },
]

const monthlyData = [
  { month: '1月', count: 45 },
  { month: '2月', count: 62 },
  { month: '3月', count: 78 },
  { month: '4月', count: 55 },
  { month: '5月', count: 89 },
  { month: '6月', count: 120 },
]

const urgencyColor: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
}

const urgencyLabel: Record<string, string> = {
  high: '紧急',
  medium: '一般',
  low: '普通',
}

export default function CertWorkbench() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">等级认定工作台</h1>
          <p className="text-sm text-gray-500 mt-1">职业技能等级认定业务总览与快捷入口</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/cert/plans')}>
            认定计划 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={() => navigate('/cert/approval')}>
            <FileCheck className="w-4 h-4 mr-2" /> 待审批
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
              <TrendingUp className="w-4 h-4 text-blue-600" />
              认定进度概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">计划进度</TabsTrigger>
                <TabsTrigger value="monthly">月度趋势</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-3 pt-3">
                {planProgress.map((p, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{p.name}</span>
                        <Badge variant={p.status === 'in_progress' ? 'default' : 'secondary'} className="text-[10px]">
                          {p.status === 'in_progress' ? '进行中' : '待启动'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{p.completed}/{p.total} 人次</span>
                    </div>
                    <Progress value={p.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{p.org}</span>
                      <span>{p.date}</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="monthly" className="pt-3">
                <div className="flex items-end justify-between h-40 gap-2">
                  {monthlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-blue-100 rounded-t" style={{ height: `${(d.count / 120) * 120}px` }}>
                        <div className="w-full h-full bg-blue-500 rounded-t opacity-80" />
                      </div>
                      <span className="text-xs text-gray-500">{d.month}</span>
                      <span className="text-xs font-medium">{d.count}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              待办事项
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todos.map(t => (
              <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-[10px] ${urgencyColor[t.urgency]}`}>{urgencyLabel[t.urgency]}</Badge>
                    <span className="text-xs text-gray-400">{t.type}</span>
                    <span className="text-xs text-gray-400 ml-auto">{t.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '认定计划', path: '/cert/plans', icon: ClipboardList, desc: '制定与管理认定计划' },
          { label: '认定批复', path: '/cert/approval', icon: FileCheck, desc: '审批认定申请' },
          { label: '考场信息', path: '/cert/exam-rooms', icon: Building2, desc: '考场设置与管理' },
          { label: '证书管理', path: '/certificate/issue', icon: Award, desc: '证书核发与查看' },
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
