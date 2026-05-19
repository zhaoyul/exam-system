import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  BookOpen, FileText, Users, CheckCircle, Send, Plus, X,
  Shield, GraduationCap, Printer
} from 'lucide-react'

interface PaperItem {
  id: number
  subject: string
  type: string
  level: string
  status: 'pending' | 'pushed'
  pushTime: string
}

interface StaffItem {
  id: number
  name: string
  role: string
  site: string
  status: 'assigned' | 'confirmed'
}

const mockPapers: PaperItem[] = [
  { id: 1, subject: '核反应堆运行理论', type: 'A卷', level: '三级', status: 'pushed', pushTime: '2022-03-28 10:23' },
  { id: 2, subject: '电气设备维修理论', type: 'B卷', level: '四级', status: 'pushed', pushTime: '2022-03-28 10:25' },
]

export default function ExamSessionArrange() {
  const [papers, setPapers] = useState<PaperItem[]>(mockPapers)
  const [proctors, setProctors] = useState<StaffItem[]>([])
  const [supervisors, setSupervisors] = useState<StaffItem[]>([])
  const [skillExaminers, setSkillExaminers] = useState<StaffItem[]>([])
  const [showProctorSelect, setShowProctorSelect] = useState(false)
  const [showSupervisorSelect, setShowSupervisorSelect] = useState(false)

  const handlePushPaper = (id: number) => {
    setPapers(prev => prev.map(p => p.id === id ? { ...p, status: 'pushed' as const, pushTime: new Date().toLocaleString('zh-CN') } : p))
    toast.success('试卷推送成功')
  }

  const handleAddProctor = () => {
    setShowProctorSelect(true)
  }

  const handleAddSupervisor = () => {
    setShowSupervisorSelect(true)
  }

  const handleAddStaff = (type: 'proctor' | 'supervisor' | 'skill', name: string, role: string) => {
    const newStaff: StaffItem = {
      id: Date.now(),
      name,
      role,
      site: '职业技能培训中心',
      status: 'assigned'
    }
    if (type === 'proctor') {
      setProctors(prev => [...prev, newStaff])
      setShowProctorSelect(false)
      toast.success(`监考人员 ${name} 已添加`)
    } else if (type === 'supervisor') {
      setSupervisors(prev => [...prev, newStaff])
      setShowSupervisorSelect(false)
      toast.success(`督导 ${name} 已添加`)
    } else {
      setSkillExaminers(prev => [...prev, newStaff])
      toast.success(`技能考评人员 ${name} 已添加`)
    }
  }

  const handleRemoveStaff = (type: 'proctor' | 'supervisor' | 'skill', id: number) => {
    if (type === 'proctor') setProctors(prev => prev.filter(s => s.id !== id))
    else if (type === 'supervisor') setSupervisors(prev => prev.filter(s => s.id !== id))
    else setSkillExaminers(prev => prev.filter(s => s.id !== id))
    toast.success('已移除')
  }

  const handleEndSession = () => {
    toast.success('考务安排已结束')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考务安排</h1>
          <p className="text-sm text-gray-500 mt-1">安排考务人员、推送试卷、管理考试</p>
        </div>
        <Button onClick={handleEndSession} size="sm">
          <CheckCircle className="w-4 h-4 mr-2" /> 结束考务安排
        </Button>
      </div>

      {/* Paper Push */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600" /> 试卷推送
        </h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">科目</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">类型</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">等级</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {papers.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 text-sm">{p.subject}</td>
                <td className="px-3 py-2.5 text-xs">{p.type}</td>
                <td className="px-3 py-2.5 text-xs">{p.level}</td>
                <td className="px-3 py-2.5">
                  <Badge className={`text-[10px] ${p.status === 'pushed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status === 'pushed' ? '已推送' : '待推送'}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">
                  {p.status === 'pending' ? (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handlePushPaper(p.id)}>
                      <Send className="w-3 h-3 mr-1" /> 推送
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">{p.pushTime}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proctor Arrangement */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" /> 监考人员安排
          </h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddProctor}>
            <Plus className="w-3 h-3 mr-1" /> 增加
          </Button>
        </div>
        {proctors.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">角色</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">考点</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proctors.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs">{s.role}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.site}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={`text-[10px] ${s.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {s.status === 'confirmed' ? '已确认' : '已安排'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleRemoveStaff('proctor', s.id)}>
                      <X className="w-3 h-3" /> 移除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p>点击右上角增加按钮添加监考人员</p>
          </div>
        )}
      </div>

      {/* Skill Examiner Arrangement */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600" /> 技能考评安排
          </h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAddStaff('skill', '王技能考评', '技能考评员')}>
            <Plus className="w-3 h-3 mr-1" /> 增加
          </Button>
        </div>
        {skillExaminers.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">角色</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">考点</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {skillExaminers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs">{s.role}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.site}</td>
                  <td className="px-3 py-2.5">
                    <Badge className="text-[10px] bg-blue-100 text-blue-700">已安排</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleRemoveStaff('skill', s.id)}>
                      <X className="w-3 h-3" /> 移除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            <GraduationCap className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p>点击右上角增加按钮添加技能考评人员</p>
          </div>
        )}
      </div>

      {/* Supervisor Arrangement */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" /> 督导安排
          </h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddSupervisor}>
            <Plus className="w-3 h-3 mr-1" /> 增加
          </Button>
        </div>
        {supervisors.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">角色</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">考点</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {supervisors.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs">{s.role}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.site}</td>
                  <td className="px-3 py-2.5">
                    <Badge className="text-[10px] bg-amber-100 text-amber-700">已安排</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleRemoveStaff('supervisor', s.id)}>
                      <X className="w-3 h-3" /> 移除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            <Shield className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p>点击右上角增加按钮添加督导</p>
          </div>
        )}
      </div>

      {/* Exam Materials */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-purple-600" /> 考务材料
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '考场安排表', icon: FileText, desc: '各考场考生安排明细' },
            { label: '考场简况表', icon: FileText, desc: '考场基本信息汇总' },
            { label: '考生签到表', icon: Users, desc: '考生入场签到记录' },
            { label: '监考记录表', icon: Printer, desc: '监考过程记录' },
          ].map((item, i) => (
            <Button key={i} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => toast.success(`${item.label}已导出`)}>
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Proctor Select Dialog */}
      {showProctorSelect && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowProctorSelect(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold">选择监考人员</h3>
              <button onClick={() => setShowProctorSelect(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {['赵监考', '钱监考', '孙监考', '周监考'].map((name, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                  onClick={() => handleAddStaff('proctor', name, '监考员')}
                >
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-gray-500">监考员 · 职业技能培训中心</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Select Dialog */}
      {showSupervisorSelect && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowSupervisorSelect(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold">选择督导</h3>
              <button onClick={() => setShowSupervisorSelect(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {['吴督导', '郑督导'].map((name, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                  onClick={() => handleAddStaff('supervisor', name, '督导员')}
                >
                  <Shield className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-gray-500">督导员 · 集团督导组</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
