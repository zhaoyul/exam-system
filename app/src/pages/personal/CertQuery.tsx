import { useState } from 'react'
import { Search, Award, Eye, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

const certData = [
  { id: '1', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', certNo: 'CGN-2026-001', issueDate: '2026-06-01', org: '大亚湾核电', status: '有效' },
  { id: '2', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', certNo: 'CGN-2026-002', issueDate: '2026-06-01', org: '大亚湾核电', status: '有效' },
]

export default function CertQuery() {
  const [certs] = useBackendListState(certData)
  const [searchId, setSearchId] = useState('')
  const [searched, setSearched] = useState(false)
  const [result, setResult] = useState<typeof certData[0] | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showVerify, setShowVerify] = useState(false)

  const handleSearch = () => {
    setSearched(true)
    setResult(certs.find(d => d.idCard === searchId || d.certNo === searchId) || null)
  }
  const reset = () => { setSearchId(''); setSearched(false); setResult(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-6 h-6 text-[#1A56DB]" />证书查询</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3"><Shield className="w-8 h-8 text-amber-600" /></div>
            <h2 className="text-lg font-semibold text-gray-900">职业技能等级证书查询</h2>
            <p className="text-xs text-gray-500 mt-1">输入身份证号或证书编号查询</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="身份证号 / 证书编号" className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB]" />
            </div>
            <Button onClick={handleSearch} className="h-10 px-6 bg-[#1A56DB] hover:bg-[#1748B5]">查询</Button>
            <Button onClick={reset} variant="outline" className="h-10">重置</Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">示例：440301199001011234 或 CGN-2026-001</p>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">证书信息</h3>
            <div className="flex gap-2">
              <Button onClick={() => setShowDetail(true)} variant="outline" className="h-8 text-xs"><Eye className="w-3.5 h-3.5 mr-1" />查看证书</Button>
              <Button onClick={() => setShowVerify(true)} variant="outline" className="h-8 text-xs"><Shield className="w-3.5 h-3.5 mr-1" />验证真伪</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">姓名</div><div className="font-medium">{result.name}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">证书编号</div><div className="font-medium font-mono text-xs">{result.certNo}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">职业(工种)</div><div className="font-medium">{result.occupation}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><div className="text-xs text-gray-500">技能等级</div><div className="font-medium">{result.level}</div></div>
            <div className="p-3 bg-green-50 rounded-lg text-center"><div className="text-xs text-gray-500">发证机构</div><div className="font-medium text-green-700">{result.org}</div></div>
            <div className="p-3 bg-green-50 rounded-lg text-center"><div className="text-xs text-gray-500">发证日期</div><div className="font-medium text-green-700">{result.issueDate}</div></div>
            <div className="p-3 bg-green-50 rounded-lg text-center col-span-2"><div className="text-xs text-gray-500">证书状态</div><div className="font-medium text-green-700 flex items-center justify-center gap-1"><Shield className="w-3.5 h-3.5" />{result.status}</div></div>
          </div>
        </div>
      )}

      {searched && !result && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-500 text-sm">未找到相关证书信息</div>
        </div>
      )}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>职业技能等级证书</DialogTitle></DialogHeader>
          {result && (
            <div className="text-center p-4">
              <div className="border-2 border-amber-200 rounded-lg p-6 bg-amber-50/30">
                <Award className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-gray-900">职业技能等级证书</div>
                <div className="text-xs text-gray-500 mt-1">证书编号：{result.certNo}</div>
                <div className="mt-4 space-y-2 text-sm text-left">
                  <div className="flex justify-between"><span className="text-gray-500">姓名</span><span>{result.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">身份证号</span><span>{result.idCard}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">职业(工种)</span><span>{result.occupation}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">技能等级</span><span>{result.level}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">发证日期</span><span>{result.issueDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">发证机构</span><span>{result.org}</span></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showVerify} onOpenChange={setShowVerify}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>证书验证</DialogTitle></DialogHeader>
          <div className="text-center p-4">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <div className="text-lg font-bold text-green-700">验证通过</div>
            <p className="text-sm text-gray-500 mt-2">该证书为真实有效的职业技能等级证书</p>
            {result && <div className="mt-3 text-xs text-gray-400">证书编号：{result.certNo}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
