import { useState } from 'react'
import { Users, Settings, ChevronRight, PenTool, X, Save, Search, Plus, Edit3, Trash2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const initialPlans = [
  { id: '1', name: '2026年第一批技能认定-理论阅卷', subject: '核反应堆运行值班员', type: '理论', status: 'in_progress' as const, experts: 3, candidates: 45 },
  { id: '2', name: '2026年第一批技能认定-技能评分', subject: '核反应堆运行值班员', type: '技能', status: 'pending' as const, experts: 5, candidates: 45 },
  { id: '3', name: '2026年第四批技能认定-综合阅卷', subject: '仪控设备检修工', type: '综合', status: 'completed' as const, experts: 4, candidates: 56 },
]

interface Expert {
  id: string
  name: string
  idCard: string
  gender: string
  phone: string
  papersGraded: number
  subject: string
}

const initialExperts: Expert[] = [
  { id: '1', name: '张专家', idCard: '51132119870701690X', gender: '女', phone: '00000000', papersGraded: 60, subject: '秘书' },
  { id: '2', name: '李专家', idCard: '420606198201132540', gender: '女', phone: '0000000', papersGraded: 30, subject: '秘书' },
]

export default function GradingPage() {
  const [activeTab, setActiveTab] = useState<'task' | 'expert'>('task')
  const [plans] = useState(initialPlans)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showAddRule, setShowAddRule] = useState(false)
  const [ruleForm, setRuleForm] = useState({ name: '', maxDiff: 5 })
  const [score, setScore] = useState(4)
  const [candidateIdx, setCandidateIdx] = useState(0)

  // Expert management state
  const [experts, setExperts] = useState<Expert[]>(initialExperts)
  const [expertSearch, setExpertSearch] = useState('')
  const [showExpertForm, setShowExpertForm] = useState(false)
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null)
  const [expertForm, setExpertForm] = useState({ name: '', idCard: '', gender: '男', phone: '', subject: '' })
  const [showResetPwd, setShowResetPwd] = useState<string | null>(null)
  const [showDeleteExpert, setShowDeleteExpert] = useState<string | null>(null)

  const candidates = ['陈小明', '林小红', '周小强', '吴小丽', '郑小华', '王小明', '赵小红', '钱小强']

  const doAddRule = () => { setShowAddRule(false); setRuleForm({ name: '', maxDiff: 5 }) }
  const doSubmitScore = () => { setCandidateIdx(p => Math.min(p + 1, candidates.length - 1)); setScore(4) }

  // Expert functions
  const openAddExpert = () => {
    setExpertForm({ name: '', idCard: '', gender: '男', phone: '', subject: '' })
    setEditingExpert(null)
    setShowExpertForm(true)
  }
  const openEditExpert = (exp: Expert) => {
    setExpertForm({ name: exp.name, idCard: exp.idCard, gender: exp.gender, phone: exp.phone, subject: exp.subject })
    setEditingExpert(exp)
    setShowExpertForm(true)
  }
  const saveExpert = () => {
    if (!expertForm.name || !expertForm.idCard) {
      toast.error('请填写完整信息')
      return
    }
    if (editingExpert) {
      setExperts(prev => prev.map(e => e.id === editingExpert.id ? { ...e, ...expertForm } : e))
      toast.success('专家信息已更新')
    } else {
      setExperts(prev => [...prev, { ...expertForm, id: Date.now().toString(), papersGraded: 0 }])
      toast.success('专家已添加')
    }
    setShowExpertForm(false)
  }
  const deleteExpert = (id: string) => {
    setExperts(prev => prev.filter(e => e.id !== id))
    setShowDeleteExpert(null)
    toast.success('专家已删除')
  }
  const resetPassword = (_id: string) => {
    setShowResetPwd(null)
    toast.success('密码已重置为默认密码')
  }

  const filteredExperts = experts.filter(e => !expertSearch || e.name.includes(expertSearch))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">阅卷管理</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('task'); setSelectedPlan(null) }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'task' ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          阅卷任务
        </button>
        <button
          onClick={() => { setActiveTab('expert'); setSelectedPlan(null) }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'expert' ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          阅卷专家
        </button>
      </div>

      {activeTab === 'task' ? (
        <div>
          {!selectedPlan ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[{ label: '待评分计划', value: plans.filter(p => p.status === 'pending').length, color: '#F59E0B' }, { label: '评分中', value: plans.filter(p => p.status === 'in_progress').length, color: '#1A56DB' }, { label: '已完成', value: plans.filter(p => p.status === 'completed').length, color: '#0E9F6E' }].map((s, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4"><div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div><div className="text-sm text-gray-500 mt-1">{s.label}</div></div>
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
                <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0"><tr><th className="px-4 py-3 text-left">计划名称</th><th className="px-4 py-3 text-left">科目</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">阅卷专家</th><th className="px-4 py-3 text-left">考生数</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
                <tbody className="divide-y divide-gray-100">{plans.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td><td className="px-4 py-3 text-gray-600">{p.subject}</td><td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.type}</span></td><td className="px-4 py-3 text-gray-600">{p.experts}人</td><td className="px-4 py-3 text-gray-600">{p.candidates}人</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === 'completed' ? 'bg-green-50 text-green-700' : p.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{p.status === 'completed' ? '已完成' : p.status === 'in_progress' ? '评分中' : '待评分'}</span></td>
                    <td className="px-4 py-3"><button onClick={() => setSelectedPlan(p.id)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5"><PenTool className="w-3.5 h-3.5" /> 评分 <ChevronRight className="w-3 h-3" /></button></td>
                  </tr>
                ))}</tbody></table>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setActiveTab('expert')} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Users className="w-4 h-4" /> 添加阅卷专家</button>
                <button onClick={() => setShowAddRule(true)} className="h-9 px-4 border border-gray-200 rounded-md text-sm flex items-center gap-1.5 hover:bg-gray-50"><Settings className="w-4 h-4" /> 添加规则</button>
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedPlan(null)} className="text-sm text-[#1A56DB] hover:underline mb-4">&larr; 返回阅卷列表</button>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{plans.find(p => p.id === selectedPlan)?.name} - 评分</h2>
                  <div className="text-sm text-gray-500">考生 {candidateIdx + 1} / {candidates.length} : {candidates[candidateIdx]}</div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div><h3 className="text-sm font-semibold text-gray-900 mb-3">标准答案</h3><div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">压水堆核电站一回路压力通常维持在 <span className="font-semibold text-green-700">15.5 MPa</span>。</div></div>
                  <div><h3 className="text-sm font-semibold text-gray-900 mb-3">考生答案</h3><div className="bg-amber-50 rounded-lg p-4 text-sm text-gray-700 border border-amber-200">15 MPa</div></div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">评分</h3>
                  <div className="flex items-center gap-3"><span className="text-sm text-gray-600">配分: 5分</span><input type="number" value={score} onChange={e => setScore(Number(e.target.value))} min={0} max={5} className="h-9 w-20 px-2 border border-gray-200 rounded-md text-sm text-center" /><span className="text-sm text-gray-600">分</span></div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={doSubmitScore} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1 hover:bg-[#1748B5]"><Save className="w-4 h-4" /> 提交评分</button>
                    <button onClick={() => setCandidateIdx(p => Math.min(p + 1, candidates.length - 1))} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-50">下一份</button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">考生列表:</div>
                  <div className="flex flex-wrap gap-1">{candidates.map((c, i) => (<button key={i} onClick={() => setCandidateIdx(i)} className={`px-2 py-1 rounded text-xs ${i === candidateIdx ? 'bg-[#1A56DB] text-white' : i < candidateIdx ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c}</button>))}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Expert Management Tab */
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={expertSearch}
                onChange={e => setExpertSearch(e.target.value)}
                placeholder="专家姓名"
                className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]"
              />
            </div>
            <Button onClick={openAddExpert} className="h-9 px-4 bg-amber-500 text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-amber-600">
              <Plus className="w-4 h-4" /> 增加专家
            </Button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">专家姓名</th>
                  <th className="px-4 py-3 text-left">身份证号</th>
                  <th className="px-4 py-3 text-left">性别</th>
                  <th className="px-4 py-3 text-left">联系方式</th>
                  <th className="px-4 py-3 text-right">阅卷份数</th>
                  <th className="px-4 py-3 text-left">阅卷科目</th>
                  <th className="px-4 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExperts.map((exp, idx) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{exp.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{exp.idCard}</td>
                    <td className="px-4 py-3 text-gray-600">{exp.gender}</td>
                    <td className="px-4 py-3 text-gray-600">{exp.phone}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{exp.papersGraded}</td>
                    <td className="px-4 py-3 text-gray-600">{exp.subject}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditExpert(exp)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5"><Edit3 className="w-3 h-3" />编辑</button>
                        <button onClick={() => setShowDeleteExpert(exp.id)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5"><Trash2 className="w-3 h-3" />删除</button>
                        <button onClick={() => setShowResetPwd(exp.id)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5"><KeyRound className="w-3 h-3" />重置密码</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Expert Dialog */}
      <Dialog open={showExpertForm} onOpenChange={setShowExpertForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingExpert ? '编辑专家' : '增加专家'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium text-gray-700">专家姓名 <span className="text-red-500">*</span></label><input value={expertForm.name} onChange={e => setExpertForm({...expertForm,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入姓名" /></div>
            <div><label className="text-sm font-medium text-gray-700">身份证号 <span className="text-red-500">*</span></label><input value={expertForm.idCard} onChange={e => setExpertForm({...expertForm,idCard:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm font-mono" placeholder="输入身份证号" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-gray-700">性别</label><select value={expertForm.gender} onChange={e => setExpertForm({...expertForm,gender:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>男</option><option>女</option></select></div>
              <div><label className="text-sm font-medium text-gray-700">联系方式</label><input value={expertForm.phone} onChange={e => setExpertForm({...expertForm,phone:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入电话" /></div>
            </div>
            <div><label className="text-sm font-medium text-gray-700">阅卷科目</label><input value={expertForm.subject} onChange={e => setExpertForm({...expertForm,subject:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入科目" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowExpertForm(false)}>取消</Button>
            <Button onClick={saveExpert} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!showResetPwd} onOpenChange={() => setShowResetPwd(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">确定要重置该专家的登录密码吗？重置后将恢复为默认密码。</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowResetPwd(null)}>取消</Button>
            <Button onClick={() => showResetPwd && resetPassword(showResetPwd)} className="bg-amber-500 hover:bg-amber-600"><KeyRound className="w-4 h-4 mr-1" />确认重置</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Expert Dialog */}
      <Dialog open={!!showDeleteExpert} onOpenChange={() => setShowDeleteExpert(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">确定要删除此专家吗？删除后不可恢复。</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteExpert(null)}>取消</Button>
            <Button variant="destructive" onClick={() => showDeleteExpert && deleteExpert(showDeleteExpert)}><Trash2 className="w-4 h-4 mr-1" />删除</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Rule Modal */}
      {showAddRule && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddRule(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加规则</h3><button onClick={() => setShowAddRule(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 space-y-4"><div><label className="block text-sm text-gray-700 mb-1">规则名称</label><input value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">最大差值(分)</label><input type="number" value={ruleForm.maxDiff} onChange={e => setRuleForm({ ...ruleForm, maxDiff: Number(e.target.value) })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddRule(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAddRule} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm">保存</button></div></div></div>)}
    </div>
  )
}
