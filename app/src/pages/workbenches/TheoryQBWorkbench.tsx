import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, FileQuestion, FileSpreadsheet, FolderOpen, Layers, PieChart, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { theorySubjects, questionTypes } from '@/pages/question/theoryData'

export default function TheoryQBWorkbench() {
  const navigate = useNavigate()
  const totals = useMemo(() => {
    const questions = theorySubjects.reduce((sum, subject) => sum + subject.questions, 0)
    const papers = theorySubjects.reduce((sum, subject) => sum + subject.papers, 0)
    const resources = theorySubjects.reduce((sum, subject) => sum + subject.resources, 0)
    const categories = new Set(theorySubjects.map(subject => subject.category)).size
    return { questions, papers, resources, categories }
  }, [])

  const typeTotals = questionTypes.map(type => ({
    type,
    count: theorySubjects.reduce((sum, subject) => sum + (subject.typeCounts[type] || 0), 0),
  }))
  const maxType = Math.max(...typeTotals.map(item => item.count), 1)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">科目分类</h1>
          <p className="mt-1 text-sm text-gray-500">查看理论题库分类、科目、试题、试卷和题型分布资源情况</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/question/subjects')}>科目管理 <ArrowRight className="ml-1 h-4 w-4" /></Button>
          <Button onClick={() => navigate('/question/theory')} className="bg-[#1A56DB] hover:bg-[#1748B5]">进入试题管理</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="题库分类" value={totals.categories} icon={Layers} tone="blue" />
        <Stat label="科目总数" value={theorySubjects.length} icon={BookOpen} tone="green" />
        <Stat label="试题总数" value={totals.questions} icon={FileQuestion} tone="amber" />
        <Stat label="试卷总数" value={totals.papers} icon={FolderOpen} tone="red" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><PieChart className="h-4 w-4 text-[#1A56DB]" />题库资源分配</div>
            <Badge className="bg-blue-50 text-blue-700">学习资源 {totals.resources} 个</Badge>
          </div>
          <div className="divide-y divide-gray-100">
            {theorySubjects.map(subject => (
              <button key={subject.id} onClick={() => navigate('/question/subjects')} className="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 px-4 py-3 text-left hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{subject.name}</div>
                  <div className="mt-1 text-xs text-gray-500">{subject.category} / {subject.level} / {subject.version}</div>
                </div>
                <div className="text-sm text-gray-600">{subject.questions} 题</div>
                <div className="text-sm text-gray-600">{subject.papers} 套卷</div>
                <div>
                  <span className={`rounded px-2 py-0.5 text-xs ${subject.status === '有效' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{subject.status}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2 font-semibold text-gray-900"><TrendingUp className="h-4 w-4 text-[#1A56DB]" />题型分配比例</div>
          <div className="space-y-3">
            {typeTotals.map(item => (
              <div key={item.type}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.type}</span>
                  <span className="font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#1A56DB]" style={{ width: `${(item.count / maxType) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '知识结构', path: '/question/knowledge', icon: Layers, desc: '维护知识点树和细目表' },
          { label: '结构比重', path: '/question/ratio', icon: PieChart, desc: '设置考点和题型比例' },
          { label: '组卷规则', path: '/question/paper-rules', icon: FileSpreadsheet, desc: '单科目/跨科目组卷' },
          { label: '卷库管理', path: '/question/paper-library', icon: FolderOpen, desc: '固定卷、抽卷、推送' },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-[#1A56DB] hover:bg-blue-50">
            <item.icon className="mb-3 h-5 w-5 text-[#1A56DB]" />
            <div className="font-medium text-gray-900">{item.label}</div>
            <div className="mt-1 text-xs text-gray-500">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: 'blue' | 'green' | 'amber' | 'red' }) {
  const color = { blue: 'text-blue-700 bg-blue-50', green: 'text-green-700 bg-green-50', amber: 'text-amber-700 bg-amber-50', red: 'text-red-700 bg-red-50' }[tone]
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
        </div>
        <div className={`rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  )
}
