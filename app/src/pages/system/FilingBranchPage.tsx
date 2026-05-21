import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Upload, FileCheck, ChevronRight, X, Trash2, Edit3, Save } from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

const tabs = ['基本信息', '备案材料', '站点信息', '认定项目', '工作人员', '督导人员', '考评人员', '考点信息']
const staffMock = [
  { id: '1', name: '张三', idCard: '440301198001011234', phone: '13800138001', role: '考务负责人' },
  { id: '2', name: '李四', idCard: '440301198002021567', phone: '13800138002', role: '考务人员' },
  { id: '3', name: '王五', idCard: '440301198003031890', phone: '13800138003', role: '考务人员' },
]
const examSites = [
  { id: '1', name: '大亚湾基地考点', type: '理论考场', site: '大亚湾基地' },
  { id: '2', name: '实操考试中心A', type: '实操考场', site: '大亚湾基地' },
  { id: '3', name: '答辩室1', type: '答辩考场', site: '大亚湾基地' },
]
const docs = [
  { id: '1', name: '机构设立批准文件', type: 'pdf', size: '2.3MB' },
  { id: '2', name: '法人证书', type: 'pdf', size: '1.1MB' },
  { id: '3', name: '质量管理体系认证', type: 'pdf', size: '3.5MB' },
]
const applyList = [
  { id: '1', batch: 'BA-2026-001', type: '初始备案', date: '2026-03-15', status: 'approved' },
  { id: '2', batch: 'BA-2026-002', type: '增量备案', date: '2026-04-20', status: 'pending' },
  { id: '3', batch: 'BA-2026-003', type: '备案修改', date: '2026-05-10', status: 'processing' },
]
const modifyList = [
  { id: 'm1', info: '基本信息', remark: '联系人手机号变更', field: '联系人手机号', changeTime: '2026-04-21 10:30', reportTime: '2026-04-21 15:20', status: '待上报' },
  { id: 'm2', info: '认定项目', remark: '新增企业人力资源管理师三级', field: '职业等级', changeTime: '2026-04-18 09:10', reportTime: '2026-04-19 11:08', status: '已上报' },
]
const sites = [
  { id: '1', name: '大亚湾基地', address: '深圳市大鹏新区', rooms: 5 },
  { id: '2', name: '阳江分站点', address: '阳江市江城区', rooms: 3 },
]
const projects = [
  { id: '1', name: '核反应堆运行值班员', level: '三级', code: '4-07-03-04' },
  { id: '2', name: '电气试验员', level: '四级', code: '4-07-03-05' },
]
type TabKey = typeof tabs[number]

export default function FilingBranchPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabKey>('基本信息')
  const [subNav, setSubNav] = useState<'info' | 'apply' | 'modify'>(() => {
    if (location.pathname.endsWith('/apply')) return 'apply'
    if (location.pathname.endsWith('/modify')) return 'modify'
    return 'info'
  })
  const [staff, setStaff] = useBackendListState(staffMock)
  const [rooms, setRooms] = useBackendListState(examSites)
  const [docsList, setDocsList] = useBackendListState(docs)
  const [sitesList, setSitesList] = useBackendListState(sites)
  const [projectList, setProjectList] = useBackendListState(projects)
  const [applyData, setApplyData] = useBackendListState(applyList)
  const [modifyData] = useBackendListState(modifyList)
  const [modifyType, setModifyType] = useState('全部')
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddApply, setShowAddApply] = useState(false)
  const [editBasic, setEditBasic] = useState(false)
  const [basicInfo, setBasicInfo] = useState({ name: '大亚湾核电运营管理有限责任公司', code: '91440300192351234X', nature: '国有企业', group: '中国广核集团', contact: '张经理', phone: '0755-84212345', email: 'dayawan@cgnpc.com.cn', address: '广东省深圳市大鹏新区大亚湾核电站' })
  const [sForm, setSForm] = useState({ name: '', idCard: '', phone: '', role: '考务人员' })
  const [rForm, setRForm] = useState({ name: '', type: '理论考场', site: '大亚湾基地', seats: 40 })
  const [dForm, setDForm] = useState({ name: '' })
  const [siForm, setSiForm] = useState({ name: '', address: '', rooms: 1 })
  const [pForm, setPForm] = useState({ name: '', level: '三级', code: '' })
  const [aForm, setAForm] = useState({ batch: '', type: '初始备案' })
  const [importFile, setImportFile] = useState('')

  const doAddStaff = () => { if (!sForm.name || !sForm.idCard) return; setStaff(p => [...p, { ...sForm, id: Date.now().toString() }]); setSForm({ name: '', idCard: '', phone: '', role: '考务人员' }); setShowAddStaff(false) }
  const doAddRoom = () => { if (!rForm.name) return; setRooms(p => [...p, { ...rForm, id: Date.now().toString() }]); setRForm({ name: '', type: '理论考场', site: '大亚湾基地', seats: 40 }); setShowAddRoom(false) }
  const doAddDoc = () => { if (!dForm.name) return; setDocsList(p => [...p, { name: dForm.name, type: 'pdf', size: '1.0MB', id: Date.now().toString() }]); setDForm({ name: '' }); setShowAddDoc(false) }
  const doAddSite = () => { if (!siForm.name) return; setSitesList(p => [...p, { ...siForm, id: Date.now().toString() }]); setSiForm({ name: '', address: '', rooms: 1 }); setShowAddSite(false) }
  const doAddProject = () => { if (!pForm.name || !pForm.code) return; setProjectList(p => [...p, { ...pForm, id: Date.now().toString() }]); setPForm({ name: '', level: '三级', code: '' }); setShowAddProject(false) }
  const doAddApply = () => { if (!aForm.batch) return; setApplyData(p => [{ ...aForm, date: new Date().toISOString().split('T')[0], status: 'pending', id: Date.now().toString() }, ...p]); setAForm({ batch: '', type: '初始备案' }); setShowAddApply(false) }
  const doImportStaff = () => { setStaff(p => [...p, { id: Date.now().toString(), name: '导入人员A', idCard: '440301199909091234', phone: '13800138999', role: '考务人员' }]); setImportFile('') }
  const delStaff = (id: string) => setStaff(p => p.filter(s => s.id !== id))
  const delRoom = (id: string) => setRooms(p => p.filter(r => r.id !== id))
  const delDoc = (id: string) => setDocsList(p => p.filter(d => d.id !== id))
  const delSite = (id: string) => setSitesList(p => p.filter(s => s.id !== id))
  const delProject = (id: string) => setProjectList(p => p.filter(pr => pr.id !== id))
  const filteredModifyData = modifyData.filter(item => modifyType === '全部' || item.info === modifyType)

  useEffect(() => {
    if (location.pathname.endsWith('/apply')) setSubNav('apply')
    else if (location.pathname.endsWith('/modify')) setSubNav('modify')
    else setSubNav('info')
  }, [location.pathname])

  const renderStaffTable = (_title: string) => (
    <div>
      <div className="flex justify-between items-center mb-3"><span className="text-sm text-gray-500">共 {staff.length} 人</span><div className="flex gap-2">
        <button onClick={() => setImportFile('ready')} className="h-9 px-3 border border-gray-200 rounded-md text-sm flex items-center gap-1.5 hover:bg-gray-50"><Upload className="w-4 h-4" /> 批量导入</button>
        <button onClick={() => setShowAddStaff(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 新增</button>
      </div></div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">手机号</th><th className="px-4 py-3 text-left">职务</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{staff.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900">{s.name}</td><td className="px-4 py-3 text-gray-600">{s.idCard}</td><td className="px-4 py-3 text-gray-600">{s.phone}</td><td className="px-4 py-3 text-gray-600">{s.role}</td><td className="px-4 py-3"><button onClick={() => delStaff(s.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody>
        </table>
      </div>
      {importFile && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2"><input type="file" onChange={() => doImportStaff()} className="text-sm" /><button onClick={() => setImportFile('')} className="text-xs text-gray-500">取消</button></div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">备案信息（分支机构）</h1>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-4">
        <button onClick={() => setSubNav('info')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${subNav === 'info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>备案信息</button>
        <button onClick={() => setSubNav('apply')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${subNav === 'apply' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>备案申报</button>
        <button onClick={() => setSubNav('modify')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${subNav === 'modify' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>备案修改</button>
      </div>
      {subNav === 'info' && (<div>
        <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">{tabs.map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>))}</div>
        {activeTab === '基本信息' && (<div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
          <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold text-gray-900">机构基本信息</h3>{!editBasic ? (<button onClick={() => setEditBasic(true)} className="h-8 px-3 border border-gray-200 rounded-md text-xs flex items-center gap-1 hover:bg-gray-50"><Edit3 className="w-3.5 h-3.5" /> 编辑</button>) : null}</div>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'name', label: '机构名称' }, { key: 'code', label: '统一社会信用代码' }, { key: 'nature', label: '机构性质' }, { key: 'group', label: '所属集团' }, { key: 'contact', label: '联系人' }, { key: 'phone', label: '联系电话' }, { key: 'email', label: '邮箱' }, { key: 'address', label: '地址' }].map(item => (
              <div key={item.key}><div className="text-xs text-gray-500 mb-1">{item.label}</div>{editBasic ? (<input value={(basicInfo as any)[item.key]} onChange={e => setBasicInfo({ ...basicInfo, [item.key]: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" />) : (<div className="text-sm text-gray-900 font-medium">{(basicInfo as any)[item.key]}</div>)}</div>
            ))}
          </div>
          {editBasic && (<div className="mt-4 flex gap-2"><button onClick={() => setEditBasic(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={() => setEditBasic(false)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1"><Save className="w-4 h-4" /> 保存</button></div>)}
        </div>)}
        {activeTab === '备案材料' && (<div><div className="flex justify-end mb-3"><button onClick={() => setShowAddDoc(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加备案材料</button></div><div className="space-y-2">{docsList.map(d => (<div key={d.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3"><FileCheck className="w-8 h-8 text-[#1A56DB]" /><div className="flex-1"><div className="text-sm font-medium text-gray-900">{d.name}</div><div className="text-xs text-gray-500">{d.type.toUpperCase()} · {d.size}</div></div><button onClick={() => delDoc(d.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></div>))}</div></div>)}
        {activeTab === '站点信息' && (<div><div className="flex justify-end mb-3"><button onClick={() => setShowAddSite(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 增加站点</button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{sitesList.map(s => (<div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex justify-between"><div className="text-base font-semibold text-gray-900">{s.name}</div><button onClick={() => delSite(s.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></div><div className="text-sm text-gray-500 mt-1">{s.address}</div><div className="text-sm text-gray-600 mt-2">考点数量: {s.rooms}个</div></div>))}</div></div>)}
        {activeTab === '认定项目' && (<div><div className="flex justify-end mb-3"><button onClick={() => setShowAddProject(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加认定项目</button></div><div className="bg-white rounded-lg border border-gray-200 overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">职业编码</th><th className="px-4 py-3 text-left">职业名称</th><th className="px-4 py-3 text-left">级别</th><th className="px-4 py-3 text-left">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{projectList.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600 font-mono">{p.code}</td><td className="px-4 py-3 font-medium text-gray-900">{p.name}</td><td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.level}</span></td><td className="px-4 py-3"><button onClick={() => delProject(p.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div></div>)}
        {['工作人员', '督导人员', '考评人员'].includes(activeTab) && renderStaffTable(activeTab)}
        {activeTab === '考点信息' && (<div><div className="flex justify-end mb-3"><button onClick={() => setShowAddRoom(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加考点</button></div><div className="bg-white rounded-lg border border-gray-200 overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">考点名称</th><th className="px-4 py-3 text-left">考点类型</th><th className="px-4 py-3 text-left">所属站点</th><th className="px-4 py-3 text-left">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{rooms.map(r => (<tr key={r.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900">{r.name}</td><td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{r.type}</span></td><td className="px-4 py-3 text-gray-600">{r.site}</td><td className="px-4 py-3"><button onClick={() => delRoom(r.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div></div>)}
      </div>)}

      {subNav === 'apply' && (<div>
        <div className="mb-3 flex flex-wrap gap-2">
          {['待申报(0个)', '正在审核(1个)', '审核通过(3个)', '退回(0个)', '拒绝(0个)'].map(item => <button key={item} className="h-8 rounded-md bg-gray-100 px-3 text-xs text-gray-600 hover:bg-gray-200">{item}</button>)}
        </div>
        <div className="flex justify-end mb-3"><button onClick={() => setShowAddApply(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 新增备案申请</button></div>
        <div className="mb-3 flex justify-end"><button className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-50">新增地市备案</button></div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">批次号</th><th className="px-4 py-3 text-left">备案类型</th><th className="px-4 py-3 text-left">申报时间</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{applyData.map(a => (<tr key={a.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-mono text-gray-900">{a.batch}</td><td className="px-4 py-3 text-gray-600">{a.type}</td><td className="px-4 py-3 text-gray-600">{a.date}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${a.status === 'approved' ? 'bg-green-50 text-green-700' : a.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{a.status === 'approved' ? '已通过' : a.status === 'pending' ? '待审核' : '处理中'}</span></td><td className="px-4 py-3"><button className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5">查看 <ChevronRight className="w-3 h-3" /></button></td></tr>))}</tbody></table></div>
      </div>)}

      {subNav === 'modify' && (<div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {['全部', '基本信息', '站点信息', '认定项目', '工作人员', '督导人员', '考评人员', '考点信息'].map(item => (
              <button key={item} onClick={() => setModifyType(item)} className={`h-8 rounded-md px-3 text-xs ${modifyType === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item === '全部' ? '全 部' : item}</button>
            ))}
          </div>
          <button className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm hover:bg-[#1748B5]">上 报</button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600 font-medium">
              <tr><th className="px-4 py-3 text-left">序号</th><th className="px-4 py-3 text-left">备案信息</th><th className="px-4 py-3 text-left">备注</th><th className="px-4 py-3 text-left">变更字段</th><th className="px-4 py-3 text-left">变更时间</th><th className="px-4 py-3 text-left">上报时间</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredModifyData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3 font-medium text-gray-900">{item.info}</td><td className="px-4 py-3 text-gray-600">{item.remark}</td><td className="px-4 py-3 text-gray-600">{item.field}</td><td className="px-4 py-3 text-gray-600">{item.changeTime}</td><td className="px-4 py-3 text-gray-600">{item.reportTime}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${item.status === '已上报' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></td><td className="px-4 py-3"><button className="text-xs text-[#1A56DB] hover:underline">查看</button></td>
                </tr>
              ))}
              {filteredModifyData.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
      </div>)}

      {/* Modals */}
      {showAddStaff && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddStaff(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加{activeTab === '工作人员' ? '工作人员' : activeTab === '督导人员' ? '督导人员' : '考评人员'}</h3><button onClick={() => setShowAddStaff(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">姓名 *</label><input value={sForm.name} onChange={e => setSForm({ ...sForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">身份证号 *</label><input value={sForm.idCard} onChange={e => setSForm({ ...sForm, idCard: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">手机号</label><input value={sForm.phone} onChange={e => setSForm({ ...sForm, phone: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddStaff(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAddStaff} disabled={!sForm.name || !sForm.idCard} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showAddRoom && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddRoom(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加考场</h3><button onClick={() => setShowAddRoom(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">考场名称 *</label><input value={rForm.name} onChange={e => setRForm({ ...rForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">考场类型</label><select value={rForm.type} onChange={e => setRForm({ ...rForm, type: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>理论考场</option><option>实操考场</option><option>答辩考场</option></select></div><div><label className="block text-sm text-gray-700 mb-1">所属站点</label><select value={rForm.site} onChange={e => setRForm({ ...rForm, site: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>大亚湾基地</option><option>阳江基地</option></select></div><div><label className="block text-sm text-gray-700 mb-1">座位数</label><input type="number" value={rForm.seats} onChange={e => setRForm({ ...rForm, seats: Number(e.target.value) })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddRoom(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAddRoom} disabled={!rForm.name} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showAddDoc && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddDoc(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加备案材料</h3><button onClick={() => setShowAddDoc(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 space-y-4"><div><label className="block text-sm text-gray-700 mb-1">材料名称 *</label><input value={dForm.name} onChange={e => setDForm({ name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500 hover:border-gray-300 cursor-pointer" onClick={() => {}}><Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />点击上传PDF文件</div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddDoc(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAddDoc} disabled={!dForm.name} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showAddSite && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddSite(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">增加站点</h3><button onClick={() => setShowAddSite(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">站点名称 *</label><input value={siForm.name} onChange={e => setSiForm({ ...siForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">地址</label><input value={siForm.address} onChange={e => setSiForm({ ...siForm, address: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">考点数量</label><input type="number" value={siForm.rooms} onChange={e => setSiForm({ ...siForm, rooms: Number(e.target.value) })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddSite(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAddSite} disabled={!siForm.name} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showAddProject && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddProject(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加认定项目</h3><button onClick={() => setShowAddProject(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">职业名称 *</label><input value={pForm.name} onChange={e => setPForm({ ...pForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">职业编码 *</label><input value={pForm.code} onChange={e => setPForm({ ...pForm, code: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">级别</label><select value={pForm.level} onChange={e => setPForm({ ...pForm, level: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>五级</option><option>四级</option><option>三级</option><option>二级</option><option>一级</option></select></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddProject(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAddProject} disabled={!pForm.name || !pForm.code} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showAddApply && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddApply(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">新增备案申请</h3><button onClick={() => setShowAddApply(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">批次号 *</label><input value={aForm.batch} onChange={e => setAForm({ ...aForm, batch: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="如: BA-2026-004" /></div><div><label className="block text-sm text-gray-700 mb-1">备案类型</label><select value={aForm.type} onChange={e => setAForm({ ...aForm, type: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>初始备案</option><option>增量备案</option><option>备案修改</option></select></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddApply(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAddApply} disabled={!aForm.batch} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">提交申请</button></div></div></div>)}
    </div>
  )
}
