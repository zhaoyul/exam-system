import { useState, useEffect } from 'react'
import { Clock, ChevronLeft, ChevronRight, Flag, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendResourceList } from '@/hooks/useBackendListState'

const questions = [
  { id: 1, type: '单选', content: '核反应堆运行值班员的主要职责是什么？', options: ['A. 负责核反应堆的日常运行监控和操作', 'B. 负责核电站的安保工作', 'C. 负责核电站的行政管理工作', 'D. 负责核电站的设备采购'] },
  { id: 2, type: '单选', content: '核安全文化的核心理念包括哪些？', options: ['A. 安全第一、预防为主', 'B. 效率优先、兼顾安全', 'C. 成本控制、安全次要', 'D. 技术领先、安全随缘'] },
  { id: 3, type: '单选', content: '核反应堆控制棒的主要作用是什么？', options: ['A. 控制核裂变反应的速率', 'B. 用于冷却反应堆', 'C. 用于发电', 'D. 用于测量温度'] },
  { id: 4, type: '判断', content: '核反应堆运行中，控制棒插入越深，反应性越高。', options: ['A. 正确', 'B. 错误'] },
  { id: 5, type: '判断', content: '核电站工作人员必须持有相应的资格证书才能上岗。', options: ['A. 正确', 'B. 错误'] },
]

export default function OnlineExam() {
  const questionRows = useBackendResourceList('/question/theory', questions)
  const examQuestions = questionRows.map((item, index) => {
    const template = questions[index] || questions[0]
    const backendItem = item as typeof item & { name?: string }
    return {
      id: Number(index + 1),
      type: backendItem.type || template.type,
      content: backendItem.content || backendItem.name || template.content,
      options: backendItem.options?.length ? backendItem.options : template.options,
    }
  })
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [marked, setMarked] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 0) { clearInterval(timer); return 0 } return prev - 1 })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const selectAnswer = (ans: string) => { setAnswers(prev => ({ ...prev, [examQuestions[current].id]: ans })) }
  const toggleMark = () => {
    const qid = examQuestions[current].id
    setMarked(prev => prev.includes(qid) ? prev.filter(i => i !== qid) : [...prev, qid])
  }
  const submitExam = () => { setSubmitted(true); setShowSubmit(false) }

  const q = examQuestions[current]
  const answeredCount = Object.keys(answers).length

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">考试已提交</h2>
        <p className="text-sm text-gray-500 mb-4">您的答卷已成功提交，成绩将在复核后公布</p>
        <div className="bg-white rounded-lg border border-gray-200 p-4 inline-block text-left">
          <div className="text-sm space-y-2">
            <div className="flex justify-between gap-8"><span className="text-gray-500">总题数</span><span className="font-medium">{examQuestions.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">已作答</span><span className="font-medium">{answeredCount}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">标记题目</span><span className="font-medium">{marked.length}</span></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">在线考试</h1>

      {/* 考试信息栏 */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">核反应堆运行值班员 · 三级</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">共 {examQuestions.length} 题</span>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-mono font-medium ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 题目区 */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{q.type}</span>
            <span className="text-sm text-gray-400">第 {current + 1} / {examQuestions.length} 题</span>
            {marked.includes(q.id) && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs flex items-center gap-1"><Flag className="w-3 h-3" />已标记</span>}
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-6">{q.content}</h3>
          <div className="space-y-3">
            {q.options.map(opt => (
              <button key={opt} onClick={() => selectAnswer(opt[0])} className={`w-full text-left p-4 border rounded-lg transition-all ${answers[q.id] === opt[0] ? 'border-[#1A56DB] bg-blue-50/50 text-[#1A56DB]' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <Button onClick={toggleMark} variant="outline" className="h-9 text-xs"><Flag className="w-3.5 h-3.5 mr-1" />{marked.includes(q.id) ? '取消标记' : '标记本题'}</Button>
            <div className="flex gap-2">
              <Button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} variant="outline" className="h-9 text-xs"><ChevronLeft className="w-3.5 h-3.5 mr-1" />上一题</Button>
              {current < examQuestions.length - 1 ? (
                <Button onClick={() => setCurrent(current + 1)} className="h-9 text-xs bg-[#1A56DB]">下一题<ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>
              ) : (
                <Button onClick={() => setShowSubmit(true)} className="h-9 text-xs bg-green-600 hover:bg-green-700"><Send className="w-3.5 h-3.5 mr-1" />提交试卷</Button>
              )}
            </div>
          </div>
        </div>

        {/* 题号导航 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">答题卡</h3>
          <div className="grid grid-cols-5 gap-2">
            {examQuestions.map((qs, idx) => (
              <button key={qs.id} onClick={() => setCurrent(idx)} className={`h-9 rounded-md text-xs font-medium transition-all ${idx === current ? 'bg-[#1A56DB] text-white' : answers[qs.id] ? 'bg-green-50 text-green-700 border border-green-200' : marked.includes(qs.id) ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-50 border border-green-200 rounded" /><span className="text-gray-500">已作答</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded" /><span className="text-gray-500">已标记</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded" /><span className="text-gray-500">未作答</span></div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">答题进度</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(answeredCount / examQuestions.length * 100)}%` }} /></div>
            <div className="text-xs text-gray-400 mt-1">{answeredCount}/{examQuestions.length}</div>
          </div>
        </div>
      </div>

      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>确认提交</DialogTitle></DialogHeader>
          <div className="text-center py-2">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">您已作答 {answeredCount}/{examQuestions.length} 题</p>
            {answeredCount < examQuestions.length && <p className="text-xs text-red-500 mt-1">还有 {examQuestions.length - answeredCount} 题未作答，确定提交吗？</p>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSubmit(false)}>继续答题</Button>
            <Button onClick={submitExam} className="bg-green-600 hover:bg-green-700">确认提交</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
