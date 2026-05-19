import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileSpreadsheet, FolderOpen, Layers, PieChart, Wrench, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { skillQuestionTypes, skillSubjects } from '@/pages/question/skillData'

export default function SkillQBWorkbench() {
  const navigate = useNavigate()
  const totals = useMemo(() => ({
    categories: new Set(skillSubjects.map(item => item.category)).size,
    subjects: skillSubjects.length,
    questions: skillSubjects.reduce((sum, item) => sum + item.questions, 0),
    papers: skillSubjects.reduce((sum, item) => sum + item.papers, 0),
    modules: skillSubjects.reduce((sum, item) => sum + item.modules, 0),
  }), [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">科目分类</h1>
          <p className="mt-1 text-sm text-gray-500">查看技能题库分类、技能科目、技能模块、试题和试卷资源情况</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/question/skill-subjects')}>技能科目 <ArrowRight className="ml-1 h-4 w-4" /></Button>
          <Button onClick={() => navigate('/question/skill')} className="bg-[#1A56DB] hover:bg-[#1748B5]">进入技能试题</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="题库分类" value={totals.categories} icon={Layers} tone="blue" />
        <Stat label="技能科目" value={totals.subjects} icon={Wrench} tone="green" />
        <Stat label="技能试题" value={totals.questions} icon={Zap} tone="amber" />
        <Stat label="试卷总数" value={totals.papers} icon={FolderOpen} tone="red" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><PieChart className="h-4 w-4 text-[#1A56DB]" />技能资源分配</div>
            <Badge className="bg-blue-50 text-blue-700">技能模块 {totals.modules} 个</Badge>
          </div>
          <div className="divide-y divide-gray-100">
            {skillSubjects.map(subject => (
              <button key={subject.id} onClick={() => navigate('/question/skill-subjects')} className="grid w-full grid-cols-[1fr_120px_120px_120px] items-center gap-3 px-4 py-3 text-left hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{subject.name}</div>
                  <div className="mt-1 text-xs text-gray-500">{subject.category} / {subject.level} / {subject.version}</div>
                </div>
                <div className="text-sm text-gray-600">{subject.modules} 模块</div>
                <div className="text-sm text-gray-600">{subject.questions} 题</div>
                <span className={`w-fit rounded px-2 py-0.5 text-xs ${subject.status === '有效' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{subject.status}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2 font-semibold text-gray-900"><Zap className="h-4 w-4 text-[#1A56DB]" />试题类型</div>
          <div className="space-y-3">
            {skillQuestionTypes.map((type, index) => (
              <div key={type}>
                <div className="mb-1 flex items-center justify-between text-sm"><span>{type}</span><span className="font-medium">{[42, 18, 12, 10][index]}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#1A56DB]" style={{ width: `${[100, 43, 28, 24][index]}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '技能模块', path: '/question/skill-modules', icon: Layers, desc: '维护模块和细目表' },
          { label: '组卷规则', path: '/question/skill-rules', icon: FileSpreadsheet, desc: '单科目/跨科目规则' },
          { label: '试卷需求', path: '/question/skill-require', icon: Wrench, desc: '需求项与抽卷' },
          { label: '卷库管理', path: '/question/paper-library', icon: FolderOpen, desc: '固定卷、授权、推送' },
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
  return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><div><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div><div className={`rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></div></div></div>
}
