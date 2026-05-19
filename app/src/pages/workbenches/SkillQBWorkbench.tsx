import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import {
  PenTool, Wrench, Zap, CheckCircle, AlertTriangle,
  ArrowRight, TrendingUp, FileSpreadsheet, BookOpen, FolderOpen
} from 'lucide-react'

const stats = [
  { label: '实操题目总数', value: 3850, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '已审核', value: 3240, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '待审核', value: 156, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: '技能模块数', value: 42, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const skillCategories = [
  { name: '核反应堆运行', total: 520, used: 480, type: '实操' },
  { name: '电气设备维修', total: 480, used: 430, type: '实操' },
  { name: '仪表校验', total: 420, used: 380, type: '实操' },
  { name: '汽轮机检修', total: 380, used: 340, type: '实操' },
  { name: '化学分析', total: 350, used: 310, type: '实操' },
  { name: '机械维修', total: 320, used: 290, type: '实操' },
  { name: '焊接技术', total: 290, used: 260, type: '实操' },
  { name: '起重作业', total: 260, used: 230, type: '实操' },
  { name: '辐射防护', total: 240, used: 210, type: '实操' },
  { name: '其他技能', total: 590, used: 510, type: '综合' },
]

const recentActivities = [
  { id: 1, action: '新增实操题', category: '核反应堆运行', count: 20, user: '张工', time: '15分钟前' },
  { id: 2, action: '审核通过', category: '电气设备维修', count: 45, user: '李工', time: '45分钟前' },
  { id: 3, action: '视频上传', category: '汽轮机检修', count: 8, user: '王工', time: '1小时前' },
  { id: 4, action: '评分标准更新', category: '仪表校验', count: 12, user: '赵工', time: '2小时前' },
  { id: 5, action: '批量导入', category: '焊接技术', count: 30, user: '孙工', time: '3小时前' },
]

export default function SkillQBWorkbench() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">技能题库工作台</h1>
          <p className="text-sm text-gray-500 mt-1">实操技能题库资源概览与统计分析</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/question/skill')}>
            进入技能题库 <ArrowRight className="w-4 h-4 ml-1" />
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
              <Wrench className="w-4 h-4 text-blue-600" />
              技能模块分布
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {skillCategories.map((s, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg transition-all cursor-pointer ${hovered === i ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-transparent'}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{s.name}</span>
                    <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                  </div>
                  <span className="text-xs text-gray-500">{s.used}/{s.total} 题</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(s.used / s.total) * 100}%` }} />
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
                难度分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: '初级', count: 1280, color: 'bg-green-400' },
                  { label: '中级', count: 1120, color: 'bg-blue-400' },
                  { label: '高级', count: 890, color: 'bg-amber-400' },
                  { label: '技师', count: 380, color: 'bg-purple-400' },
                  { label: '高级技师', count: 180, color: 'bg-red-400' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-16">{t.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${t.color} rounded-full`} style={{ width: `${(t.count / 1280) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{t.count}</span>
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
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-700">{a.action}</span>
                    <span className="text-gray-500"> · {a.category}</span>
                    <span className="text-green-600 ml-1">+{a.count}</span>
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
          { label: '技能题库', path: '/question/skill', icon: PenTool, desc: '实操题目录入与管理' },
          { label: '组卷规则', path: '/question/paper-rules', icon: FileSpreadsheet, desc: '实操组卷规则配置' },
          { label: '试卷需求', path: '/question/paper-require', icon: BookOpen, desc: '试卷需求申请' },
          { label: '卷库管理', path: '/question/paper-library', icon: FolderOpen, desc: '已生成试卷管理' },
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
