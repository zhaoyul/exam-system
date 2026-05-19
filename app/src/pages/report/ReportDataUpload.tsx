import { useState } from 'react'
import { Upload, Download, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const uploads = [
  { id: '1', name: '2026年第一批认定数据', org: '大亚湾核电', date: '2026-05-25', status: 'uploaded' },
  { id: '2', name: '2026年第一批认定数据', org: '阳江核电', date: '2026-05-26', status: 'pending' },
]

export default function ReportDataUpload() {
  const [items, setItems] = useState(uploads)
  const [dragOver, setDragOver] = useState(false)

  const upload = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'uploaded' } : i)) }
  const del = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">上报数据报表</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">数据上报</h2>
        <div
          onDragEnter={() => setDragOver(true)} onDragLeave={() => setDragOver(false)} onDragOver={e => e.preventDefault()} onDrop={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${dragOver ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-300'}`}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">拖拽文件到此处或 <span className="text-[#1A56DB] cursor-pointer">点击上传</span></p>
          <p className="text-xs text-gray-400 mt-1">支持 Excel、CSV 格式</p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" className="h-9 text-xs"><Download className="w-3.5 h-3.5 mr-1" />下载上报模板</Button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">上报记录</h2>
        <div className="space-y-2">
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-[#1A56DB]" /><div><div className="text-sm font-medium text-gray-900">{i.name}</div><div className="text-xs text-gray-500">{i.org} · {i.date}</div></div></div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${i.status === 'uploaded' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'uploaded' ? '已上报' : '待上报'}</span>
                {i.status === 'pending' && <button onClick={() => upload(i.id)} className="text-xs text-[#1A56DB] hover:underline">上报</button>}
                <button onClick={() => del(i.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
