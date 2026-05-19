import { useState } from 'react'
import { UserPlus, Save, CheckCircle, ChevronRight, Building2, Briefcase, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const occupations = ['核反应堆运行值班员', '电气试验员', '机械设备检修工', '仪控设备检修工', '焊接工']
const levels = ['一级', '二级', '三级', '四级', '五级']
const orgs = ['大亚湾核电', '阳江核电', '台山核电', '中广核工程', '中广核研究院']

export default function SelfRegistration() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', idCard: '', phone: '', org: '', occupation: '', level: '', workYears: '', edu: '', certNo: '', plan: '2026年第二批技能认定',
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const update = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }))

  const canNext = () => {
    if (step === 1) return form.name && form.idCard && form.phone
    if (step === 2) return form.org && form.occupation && form.level
    if (step === 3) return form.workYears && form.edu
    return true
  }

  const submit = () => { setShowSuccess(true) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><UserPlus className="w-6 h-6 text-[#1A56DB]" />个人网报</h1>

      {/* 进度条 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          {['基本信息', '报考信息', '资格确认', '提交报名'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 ${step === i + 1 ? 'text-[#1A56DB] font-medium' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-4 max-w-lg">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#1A56DB]" />基本信息</h3>
            <div><label className="text-sm font-medium text-gray-700">姓名 <span className="text-red-500">*</span></label><input value={form.name} onChange={e => update('name', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入真实姓名" /></div>
            <div><label className="text-sm font-medium text-gray-700">身份证号 <span className="text-red-500">*</span></label><input value={form.idCard} onChange={e => update('idCard', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入18位身份证号" maxLength={18} /></div>
            <div><label className="text-sm font-medium text-gray-700">手机号码 <span className="text-red-500">*</span></label><input value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入手机号码" maxLength={11} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 max-w-lg">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Briefcase className="w-4 h-4 text-[#1A56DB]" />报考信息</h3>
            <div><label className="text-sm font-medium text-gray-700">所属机构 <span className="text-red-500">*</span></label><select value={form.org} onChange={e => update('org', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm"><option value="">请选择</option>{orgs.map(o => <option key={o}>{o}</option>)}</select></div>
            <div><label className="text-sm font-medium text-gray-700">报考职业（工种） <span className="text-red-500">*</span></label><select value={form.occupation} onChange={e => update('occupation', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm"><option value="">请选择</option>{occupations.map(o => <option key={o}>{o}</option>)}</select></div>
            <div><label className="text-sm font-medium text-gray-700">报考等级 <span className="text-red-500">*</span></label><select value={form.level} onChange={e => update('level', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm"><option value="">请选择</option>{levels.map(l => <option key={l}>{l}</option>)}</select></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 max-w-lg">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Award className="w-4 h-4 text-[#1A56DB]" />资格确认</h3>
            <div><label className="text-sm font-medium text-gray-700">从事本职业工作年限 <span className="text-red-500">*</span></label><input type="number" value={form.workYears} onChange={e => update('workYears', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入工作年限" /></div>
            <div><label className="text-sm font-medium text-gray-700">最高学历 <span className="text-red-500">*</span></label><select value={form.edu} onChange={e => update('edu', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm"><option value="">请选择</option><option>高中/中专</option><option>大专</option><option>本科</option><option>硕士及以上</option></select></div>
            <div><label className="text-sm font-medium text-gray-700">已获证书编号（如有）</label><input value={form.certNo} onChange={e => update('certNo', e.target.value)} className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入已有证书编号，没有请留空" /></div>
            <div><label className="text-sm font-medium text-gray-700">认定计划</label><input value={form.plan} readOnly className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-md text-sm bg-gray-50" /></div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1A56DB]" />信息确认</h3>
            <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-4">
              {[{label:'姓名',val:form.name},{label:'身份证号',val:form.idCard},{label:'手机',val:form.phone},{label:'机构',val:form.org},{label:'报考职业',val:form.occupation},{label:'报考等级',val:form.level},{label:'工作年限',val:form.workYears+'年'},{label:'学历',val:form.edu},{label:'认定计划',val:form.plan}].map(item => (
                <div key={item.label} className="flex justify-between py-1 border-b border-gray-100 last:border-0"><span className="text-gray-500">{item.label}</span><span className="font-medium">{item.val}</span></div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <Button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} variant="outline" className="h-9">上一步</Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]">下一步 <ChevronRight className="w-4 h-4 ml-1" /></Button>
          ) : (
            <Button onClick={submit} className="h-9 bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-1" />确认提交</Button>
          )}
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>报名成功</DialogTitle></DialogHeader>
          <div className="text-center py-4">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">您的报名信息已提交，请等待审核</p>
            <p className="text-xs text-gray-400 mt-1">报名编号：CGN-BM-{Date.now().toString().slice(-6)}</p>
            <Button onClick={() => { setShowSuccess(false); setStep(1); setForm({ name:'',idCard:'',phone:'',org:'',occupation:'',level:'',workYears:'',edu:'',certNo:'',plan:'2026年第二批技能认定' }) }} className="mt-4 bg-[#1A56DB] h-9 text-xs">继续报名</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
