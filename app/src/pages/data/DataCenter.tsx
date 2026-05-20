import { useState } from 'react'
import { Upload, Download, FileText, CheckCircle, Database, Users, Award, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'

const importTasks = [
  { id: '1', name: '考生信息导入', type: '导入', records: 156, status: 'completed', date: '2026-05-18' },
  { id: '2', name: '成绩数据导入', type: '导入', records: 156, status: 'completed', date: '2026-05-21' },
  { id: '3', name: '证书信息导入', type: '导入', records: 0, status: 'pending', date: '--' },
]

const exportTasks = [
  { id: '1', name: '认定统计报表导出', type: '导出', records: 1256, status: 'completed', date: '2026-05-22' },
  { id: '2', name: '证书数据上报导出', type: '导出', records: 0, status: 'pending', date: '--' },
]

export default function DataCenter() {
  const [dragOver, setDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [imports, setImports] = useBackendListState(importTasks)
  const [exports, setExports] = useBackendListState(exportTasks)

  const runImport = (id: string) => { setImports(prev => prev.map(i => i.id === id ? { ...i, status: 'completed', records: 156, date: new Date().toISOString().slice(0,10) } : i)) }
  const runExport = (id: string) => { setExports(prev => prev.map(i => i.id === id ? { ...i, status: 'completed', records: Math.floor(Math.random()*500)+100, date: new Date().toISOString().slice(0,10) } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Database className="w-6 h-6 text-[#1A56DB]" />数据导入导出中心</h1>

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><Users className="w-5 h-5 text-[#1A56DB] mx-auto mb-1" /><div className="text-lg font-bold">1,256</div><div className="text-xs text-gray-500">考生总数</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><BookOpen className="w-5 h-5 text-green-600 mx-auto mb-1" /><div className="text-lg font-bold">892</div><div className="text-xs text-gray-500">已导入</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><Award className="w-5 h-5 text-amber-600 mx-auto mb-1" /><div className="text-lg font-bold">1,056</div><div className="text-xs text-gray-500">证书数据</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><Database className="w-5 h-5 text-purple-600 mx-auto mb-1" /><div className="text-lg font-bold">3.2GB</div><div className="text-xs text-gray-500">数据总量</div></div>
      </div>

      {/* 拖拽上传 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">文件上传</h2>
        <div onDragEnter={()=>setDragOver(true)} onDragLeave={()=>setDragOver(false)} onDragOver={e=>e.preventDefault()} onDrop={()=>setDragOver(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver?'border-[#1A56DB] bg-blue-50':'border-gray-300'}`}>
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">拖拽文件到此处或 <span className="text-[#1A56DB] cursor-pointer">点击上传</span></p>
          <p className="text-xs text-gray-400 mt-1">支持 Excel (.xlsx)、CSV (.csv) 格式，单个文件不超过 10MB</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={()=>setActiveTab('import')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab==='import'?'bg-[#1A56DB] text-white':'bg-gray-100 text-gray-600'}`}>数据导入</button>
        <button onClick={()=>setActiveTab('export')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab==='export'?'bg-[#1A56DB] text-white':'bg-gray-100 text-gray-600'}`}>数据导出</button>
      </div>

      {activeTab === 'import' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">任务名称</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-right">记录数</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {imports.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.type}</span></td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.records || '--'}</td>
                  <td className="px-4 py-3 text-gray-600">{i.date}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status==='completed'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{i.status==='completed'?'已完成':'待执行'}</span></td>
                  <td className="px-4 py-3">{i.status==='pending'&&<Button onClick={()=>runImport(i.id)} className="h-7 text-xs bg-[#1A56DB]"><Upload className="w-3 h-3 mr-1" />执行导入</Button>}{i.status==='completed'&&<span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />已完成</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">任务名称</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-right">记录数</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {exports.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{i.type}</span></td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.records || '--'}</td>
                  <td className="px-4 py-3 text-gray-600">{i.date}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status==='completed'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{i.status==='completed'?'已完成':'待执行'}</span></td>
                  <td className="px-4 py-3">{i.status==='pending'&&<Button onClick={()=>runExport(i.id)} variant="outline" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" />执行导出</Button>}{i.status==='completed'&&<Button variant="outline" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" />下载</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
