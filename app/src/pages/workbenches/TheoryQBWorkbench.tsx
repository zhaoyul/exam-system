import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, FileQuestion, Layers, CheckCircle, TrendingUp,
  ArrowRight, AlertTriangle, PenTool, FileSpreadsheet, FolderOpen
} from 'lucide-react'

const stats = [
  { label: '理论题目总数', value: 12856, icon: FileQuestion, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '已审核题目', value: 11240, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '待审核题目', value: 342, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: '组卷规则数', value: 86, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const subjectStats = [
  { name: '核能工程', total: 3240, used: 2890, accuracy: 92 },
  { name: '电气工程', total: 2156, used: 1980, accuracy: 88 },
  { name: '自动化', total: 1870, used: 1650, accuracy: 85 },
  { name: '热能动力', total: 1560, used: 1420, accuracy: 90 },
  { name: '化学工程', total: 1340, used: 1200, accuracy: 87 },
  { name: '机械工程', total: 980, used: 890, accuracy: 89 },
  { name: '仪控工程', total: 860, used: 780, accuracy: 91 },
  { name: '其他', total: 850, used: 720, accuracy: 83 },
]

const recentActivities = [
  { id: 1, action: '新增单选题', subject: '核能工程', count: 50, user: '张工', time: '10分钟前' },
  { id: 2, action: '审核通过', subject: '电气工程', count: 120, user: '李工', time: '30分钟前' },
  { id: 3, action: '修改题目', subject: '自动化', count: 15, user: '王工', time: '1小时前' },
  { id: 4, action: '批量导入', subject: '热能动力', count: 200, user: '赵工', time: '2小时前' },
  { id: 5, action: '创建组卷规则', subject: '核能工程', count: 1, user: '张工', time: '3小时前' },
]

export default function TheoryQBWorkbench() {
  const navigate = useNavigate()
  const [hoveredSubject, setHoveredSubject] = useState<number | null>(null)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">理论题库工作台</h1>
          <p className="text-sm text-gray-500 mt-1">理论题库资源概览与统计分析</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/question/theory')}>
            进入题库 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={() => navigate('/question/paper-rules')}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> 组卷规则
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
              <BookOpen className="w-4 h-4 text-blue-600" />
              各专业题目分布
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjectStats.map((s, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg transition-all cursor-pointer ${hoveredSubject === i ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                onMouseEnter={() => setHoveredSubject(i)}
                onMouseLeave={() => setHoveredSubject(null)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{s.name}</span>
                    <Badge variant="outline" className="text-[10px]">{s.total} 题</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>使用率 {Math.round((s.used / s.total) * 100)}%</span>
                    <span>正确率 {s.accuracy}%</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(s.used / s.total) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                题型分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: '单选题', count: 5420, color: 'bg-blue-500' },
                  { label: '多选题', count: 3850, color: 'bg-green-500' },
                  { label: '判断题', count: 2186, color: 'bg-amber-500' },
                  { label: '填空题', count: 860, color: 'bg-purple-500' },
                  { label: '简答题', count: 540, color: 'bg-red-500' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-14">{t.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${t.color} rounded-full`} style={{ width: `${(t.count / 5420) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-600" />
                最近动态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivities.map(a => (
                <div key={a.id} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-700">{a.action}</span>
                    <span className="text-gray-500"> · {a.subject}</span>
                    <span className="text-blue-600 ml-1">+{a.count}</span>
                    <div className="text-gray-400 mt-0.5">{a.user} · {a.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '理论题库', path: '/question/theory', icon: BookOpen, desc: '单选/多选/判断等题型管理' },
          { label: '组卷规则', path: '/question/paper-rules', icon: FileSpreadsheet, desc: '自动组卷规则配置' },
          { label: '试卷需求', path: '/question/paper-require', icon: PenTool, desc: '试卷需求申请与管理' },
          { label: '卷库管理', path: '/question/paper-library', icon: FolderOpen, desc: '已生成试卷管理' },
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
