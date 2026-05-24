import { useNavigate, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import CertPlanManage from './CertPlanManage'
import ExamRegistration from './ExamRegistration'
import ExamArrangement from './ExamArrangement'
import ExamSessionArrange from './ExamSessionArrange'
import ScoreEntry from '@/pages/score/ScoreEntry'
import ScorePublicityManage from './ScorePublicityManage'
import CertificatesGroup from './CertificatesGroup'
import CertificatesPrint from './CertificatesPrint'
import { useApp } from '@/context/AppContext'
import {
  ListChecks, Users, LayoutGrid, BookOpen, BarChart3, Eye, Award, Printer,
  ChevronRight, CheckCircle, ShieldAlert
} from 'lucide-react'

// 等级认定（机构）核心流程步骤
const baseFlowSteps = [
  { id: 'plans', label: '制定计划', icon: ListChecks, path: '/cert/exec/plans', desc: '创建认定计划，选择站点、职业工种' },
  { id: 'registration', label: '考试报名', icon: Users, path: '/cert/exec/registration', desc: '集体报名，批量导入考生' },
  { id: 'arrangement', label: '考场编排', icon: LayoutGrid, path: '/cert/exec/arrangement', desc: '安排考点、考场、座位' },
  { id: 'session', label: '考务安排', icon: BookOpen, path: '/cert/exec/session', desc: '推送试卷，安排考务人员' },
  { id: 'score', label: '成绩管理', icon: BarChart3, path: '/cert/exec/score', desc: '录入、查看、审核成绩' },
  { id: 'publicity', label: '成绩公示', icon: Eye, path: '/cert/exec/publicity', desc: '公示成绩，设置公示期' },
  { id: 'cert', label: '证书管理', icon: Award, path: '/cert/exec/cert', desc: '生成证书，查看考生证书' },
  { id: 'print', label: '证书打印', icon: Printer, path: '/cert/exec/print', desc: '预览、打印证书' },
]

export default function CertExecution() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useApp()
  const flowSteps = useMemo(() => {
    if (user?.role === 'branch_admin') {
      return baseFlowSteps.slice(0, 6)
    }
    return baseFlowSteps
  }, [user?.role])

  // Determine current step from URL
  const currentPath = location.pathname
  const activeStep = Math.max(0, flowSteps.findIndex(s => currentPath === s.path))
  const effectiveStep = activeStep === -1 ? 0 : activeStep

  const handleStepClick = (index: number) => {
    navigate(flowSteps[index].path)
  }

  return (
    <div className="flex h-full">
      {/* Left Step Navigation */}
      <aside className="w-48 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">等级认定</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">机构端 · 认定流程</p>
        </div>
        <div className="py-2">
          {flowSteps.map((step, index) => {
            const isActive = index === effectiveStep
            const isCompleted = index < effectiveStep
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-[3px] border-blue-600'
                    : isCompleted
                    ? 'text-gray-700 hover:bg-gray-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle className="w-3 h-3" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate ${isActive ? 'text-blue-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-900">
              {flowSteps[effectiveStep]?.id === 'plans' ? '指定计划' : (flowSteps[effectiveStep]?.label || '指定计划')}
            </span>
            <span className="text-xs text-gray-400">
              步骤 {effectiveStep + 1} / {flowSteps.length}
            </span>
            <span className="text-xs text-gray-400 ml-2">{flowSteps[effectiveStep]?.desc}</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {user?.role === 'branch_admin' && effectiveStep === flowSteps.length - 1 && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>成绩公示结束后，由集团管理员在“等级认定 / 集团证书”统一生成证书并确认打印，机构端仅负责前六个环节。</div>
            </div>
          )}
          {effectiveStep === 0 && <CertPlanManage />}
          {effectiveStep === 1 && <ExamRegistration />}
          {effectiveStep === 2 && <ExamArrangement />}
          {effectiveStep === 3 && <ExamSessionArrange />}
          {effectiveStep === 4 && <ScoreEntry />}
          {effectiveStep === 5 && <ScorePublicityManage />}
          {user?.role !== 'branch_admin' && effectiveStep === 6 && <CertificatesGroup />}
          {user?.role !== 'branch_admin' && effectiveStep === 7 && <CertificatesPrint />}
        </div>
      </main>
    </div>
  )
}
