import { useState } from 'react'
import { Search, Download, X } from 'lucide-react'

interface Person {
  id: string
  name: string
  idCard: string
  gender: string
  org: string
  phone: string
  post: string
}

const initialPersonnel: Person[] = [
  { id: '1', name: '陈小明', idCard: '440301199001011234', gender: '男', org: '大亚湾核电', phone: '13800138001', post: '运行值班员' },
  { id: '2', name: '林小红', idCard: '440301199002021567', gender: '女', org: '阳江核电', phone: '13800138002', post: '电气试验员' },
  { id: '3', name: '周小强', idCard: '440301199003031890', gender: '男', org: '台山核电', phone: '13800138003', post: '机械检修工' },
  { id: '4', name: '吴小丽', idCard: '440301199004042123', gender: '女', org: '宁德核电', phone: '13800138004', post: '仪控检修工' },
  { id: '5', name: '郑小华', idCard: '440301199005052456', gender: '男', org: '红沿河核电', phone: '13800138005', post: '燃料操作工' },
]

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Person[]>(initialPersonnel)
  const [search, setSearch] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState('')

  const filtered = personnel.filter(p =>
    !search || p.name.includes(search) || p.idCard.includes(search) || p.org.includes(search)
  )

  const doImport = () => {
    const newPersons: Person[] = [
      { id: Date.now().toString(), name: '批量导入人员A', idCard: '440301199006062789', gender: '男', org: '大亚湾核电', phone: '13800138006', post: '运行值班员' },
      { id: (Date.now() + 1).toString(), name: '批量导入人员B', idCard: '440301199007073012', gender: '女', org: '阳江核电', phone: '13800138007', post: '电气试验员' },
    ]
    setPersonnel(prev => [...newPersons, ...prev])
    setShowImport(false)
    setImportFile('')
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">人员信息</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名/身份证号/单位..."
            className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB] w-72" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="h-9 px-3 border border-gray-200 rounded-md text-sm flex items-center gap-1.5 hover:bg-gray-50">
            <Download className="w-4 h-4" /> 批量导入
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0">
            <tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">性别</th><th className="px-4 py-3 text-left">所属单位</th><th className="px-4 py-3 text-left">联系电话</th><th className="px-4 py-3 text-left">岗位</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{p.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{p.gender}</td>
                <td className="px-4 py-3 text-gray-600">{p.org}</td>
                <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.post}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无数据</div>}
      </div>
      {showImport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">批量导入人员</h3><button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500 hover:border-gray-300 cursor-pointer" onClick={() => setImportFile('selected')}>
                {importFile ? <span className="text-[#1A56DB]">已选择文件: personnel_template.xlsx</span> : <><Download className="w-6 h-6 mx-auto mb-2 text-gray-400" />点击选择Excel文件 (.xlsx)</>}
              </div>
              <p className="text-xs text-gray-400 mt-2">请先下载导入模板，按要求填写后上传</p>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button onClick={() => setShowImport(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={doImport} disabled={!importFile} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm hover:bg-[#1748B5] disabled:opacity-40">开始导入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
