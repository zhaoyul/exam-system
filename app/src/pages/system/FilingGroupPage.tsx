import { useState } from 'react'
import { Search, FileCheck, MapPin, ChevronRight, Plus, X, Trash2 } from 'lucide-react'

interface Filing { org: string; province: string; status: string; date: string; materials: number; sites: number; projects: number; staff: number; supervisors: number; examiners: number; examRooms: number }
interface ScopeItem { code: string; name: string; level: string; exam: string; form: string }

const filings: Filing[] = [
  { org: '大亚湾核电', province: '广东', status: 'approved', date: '2026-03-15', materials: 8, sites: 2, projects: 12, staff: 15, supervisors: 6, examiners: 20, examRooms: 5 },
  { org: '阳江核电', province: '广东', status: 'approved', date: '2026-02-20', materials: 6, sites: 1, projects: 10, staff: 12, supervisors: 4, examiners: 16, examRooms: 4 },
  { org: '台山核电', province: '广东', status: 'pending', date: '2026-04-10', materials: 7, sites: 1, projects: 8, staff: 10, supervisors: 3, examiners: 12, examRooms: 3 },
  { org: '宁德核电', province: '福建', status: 'approved', date: '2026-01-18', materials: 9, sites: 2, projects: 15, staff: 18, supervisors: 7, examiners: 22, examRooms: 6 },
  { org: '红沿河核电', province: '辽宁', status: 'pending', date: '2026-05-01', materials: 5, sites: 1, projects: 9, staff: 11, supervisors: 4, examiners: 14, examRooms: 4 },
  { org: '防城港核电', province: '广西', status: 'approved', date: '2026-03-22', materials: 6, sites: 1, projects: 7, staff: 9, supervisors: 3, examiners: 10, examRooms: 3 },
]
const initialScopes: ScopeItem[] = [
  { code: '4-07-03-04', name: '核反应堆运行值班员', level: '三级', exam: '理论+技能', form: '笔试+实操' },
  { code: '4-07-03-05', name: '电气试验员', level: '四级', exam: '理论+技能', form: '机考+实操' },
  { code: '4-07-03-06', name: '机械设备检修工', level: '三级', exam: '理论+技能', form: '笔试+实操' },
  { code: '4-07-03-07', name: '仪控设备检修工', level: '二级', exam: '理论+技能+综合', form: '机考+实操+答辩' },
]

export default function FilingGroupPage() {
  const [tab, setTab] = useState<'workbench' | 'view' | 'scope'>('workbench')
  const [search, setSearch] = useState('')
  const [detailOrg, setDetailOrg] = useState<string | null>(null)
  const [scopes, setScopes] = useState<ScopeItem[]>(initialScopes)
  const [showAddScope, setShowAddScope] = useState(false)
  const [showDeleteScope, setShowDeleteScope] = useState<string | null>(null)
  const [scopeForm, setScopeForm] = useState({ code: '', name: '', level: '三级', exam: '理论+技能', form: '笔试+实操' })

  const pendingCount = filings.filter(f => f.status === 'pending').length
  const approvedCount = filings.filter(f => f.status === 'approved').length

  const doAddScope = () => {
    if (!scopeForm.code || !scopeForm.name) return
    setScopes(prev => [{ ...scopeForm }, ...prev])
    setScopeForm({ code: '', name: '', level: '三级', exam: '理论+技能', form: '笔试+实操' })
    setShowAddScope(false)
  }
  const doDeleteScope = (code: string) => { setScopes(prev => prev.filter(s => s.code !== code)); setShowDeleteScope(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">备案信息（集团）</h1>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-4">
        {[{ key: 'workbench', label: '工作台' }, { key: 'view', label: '备案查看' }, { key: 'scope', label: '评价范围' }].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key as any); setDetailOrg(null); }} className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'workbench' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-5 border border-gray-200"><div className="text-sm text-gray-500 mb-1">备案总数</div><div className="text-3xl font-bold text-gray-900">{filings.length}</div></div>
            <div className="bg-white rounded-lg p-5 border border-gray-200"><div className="text-sm text-gray-500 mb-1">待审核</div><div className="text-3xl font-bold text-amber-600">{pendingCount}</div></div>
            <div className="bg-white rounded-lg p-5 border border-gray-200"><div className="text-sm text-gray-500 mb-1">已通过</div><div className="text-3xl font-bold text-green-600">{approvedCount}</div></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">近期备案活动</h3>
            <div className="space-y-3">
              {filings.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setTab('view'); setDetailOrg(f.org) }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${f.status === 'approved' ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <FileCheck className={`w-5 h-5 ${f.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{f.org} 提交了备案申请</div>
                    <div className="text-xs text-gray-500 mt-0.5">{f.date} · {f.projects}个认定项目 · {f.examiners}名考评人员</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${f.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{f.status === 'approved' ? '已通过' : '审核中'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'view' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索机构名称..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB] w-72" /></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0">
              <tr><th className="px-4 py-3 text-left">机构名称</th><th className="px-4 py-3 text-left">备案省份</th><th className="px-4 py-3 text-left">备案状态</th><th className="px-4 py-3 text-left">备案时间</th><th className="px-4 py-3 text-left">认定项目</th><th className="px-4 py-3 text-left">考评人员</th><th className="px-4 py-3 text-left">操作</th></tr>
            </thead><tbody className="divide-y divide-gray-100">
              {filings.filter(f => !search || f.org.includes(search)).map((f, i) => (
                <tr key={i} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900">{f.org}</td><td className="px-4 py-3 text-gray-600"><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{f.province}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${f.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{f.status === 'approved' ? '已通过' : '审核中'}</span></td>
                  <td className="px-4 py-3 text-gray-600">{f.date}</td><td className="px-4 py-3 text-gray-600">{f.projects}个</td><td className="px-4 py-3 text-gray-600">{f.examiners}人</td>
                  <td className="px-4 py-3"><button onClick={() => setDetailOrg(detailOrg === f.org ? null : f.org)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5">{detailOrg === f.org ? '收起' : '查看详情'} <ChevronRight className={`w-3 h-3 transition-transform ${detailOrg === f.org ? 'rotate-90' : ''}`} /></button></td>
                </tr>
              ))}
            </tbody></table>
          </div>
          {detailOrg && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{detailOrg} 备案详情</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{ label: '备案材料', value: filings.find(f => f.org === detailOrg)?.materials }, { label: '站点', value: filings.find(f => f.org === detailOrg)?.sites }, { label: '认定项目', value: filings.find(f => f.org === detailOrg)?.projects }, { label: '工作人员', value: filings.find(f => f.org === detailOrg)?.staff }, { label: '督导人员', value: filings.find(f => f.org === detailOrg)?.supervisors }, { label: '考评人员', value: filings.find(f => f.org === detailOrg)?.examiners }, { label: '考点', value: filings.find(f => f.org === detailOrg)?.examRooms }].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-lg font-semibold text-gray-900">{item.value}</div><div className="text-xs text-gray-500 mt-0.5">{item.label}</div></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'scope' && (
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          <div className="w-56 bg-white rounded-lg border border-gray-200 p-3 flex-shrink-0 overflow-y-auto">
            <div className="text-sm font-medium text-[#1A56DB] bg-[#E8EFFF] px-2 py-1.5 rounded-md mb-1">中广核集团</div>
            {['大亚湾核电', '阳江核电', '台山核电', '宁德核电', '红沿河核电', '防城港核电'].map((org, i) => (
              <div key={i} className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer ml-2">{org}</div>
            ))}
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">评价项目范围</h3>
              <button onClick={() => setShowAddScope(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加职业/工种</button>
            </div>
            <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-auto">
              <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0">
                <tr><th className="px-4 py-3 text-left">职业编码</th><th className="px-4 py-3 text-left">职业名称</th><th className="px-4 py-3 text-left">级别</th><th className="px-4 py-3 text-left">考试科目</th><th className="px-4 py-3 text-left">形式</th><th className="px-4 py-3 text-left">操作</th></tr>
              </thead><tbody className="divide-y divide-gray-100">
                {scopes.map(item => (
                  <tr key={item.code} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 font-mono">{item.code}</td><td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.level}</span></td><td className="px-4 py-3 text-gray-600">{item.exam}</td><td className="px-4 py-3 text-gray-600">{item.form}</td>
                    <td className="px-4 py-3"><button onClick={() => setShowDeleteScope(item.code)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody></table>
              {scopes.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无评价范围数据</div>}
            </div>
          </div>
        </div>
      )}

      {showAddScope && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddScope(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[560px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加职业/工种</h3><button onClick={() => setShowAddScope(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-700 mb-1">职业编码 <span className="text-red-500">*</span></label><input value={scopeForm.code} onChange={e => setScopeForm({ ...scopeForm, code: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">职业名称 <span className="text-red-500">*</span></label><input value={scopeForm.name} onChange={e => setScopeForm({ ...scopeForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">级别</label><select value={scopeForm.level} onChange={e => setScopeForm({ ...scopeForm, level: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>五级</option><option>四级</option><option>三级</option><option>二级</option><option>一级</option></select></div>
              <div><label className="block text-sm text-gray-700 mb-1">考试形式</label><input value={scopeForm.form} onChange={e => setScopeForm({ ...scopeForm, form: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button onClick={() => setShowAddScope(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={doAddScope} disabled={!scopeForm.code || !scopeForm.name} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm hover:bg-[#1748B5] disabled:opacity-40">保存</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteScope && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowDeleteScope(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除该职业/工种?</h3>
              <p className="text-sm text-gray-500">编码: {showDeleteScope}</p>
            </div>
            <div className="flex justify-center gap-3 px-6 pb-6">
              <button onClick={() => setShowDeleteScope(null)} className="h-9 px-6 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={() => doDeleteScope(showDeleteScope)} className="h-9 px-6 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
