import { useState } from 'react'
import { Search, Award, Shield, QrCode, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'

const certDB = [
  { id: '1', name: '张三', idCard: '440301199001011234', certNo: 'CGN-2026-001', occupation: '核反应堆运行值班员', level: '三级', issueDate: '2026-06-01', org: '大亚湾核电' },
  { id: '2', name: '李四', idCard: '440301199002022345', certNo: 'CGN-2026-002', occupation: '电气试验员', level: '四级', issueDate: '2026-06-01', org: '大亚湾核电' },
]

export default function PublicCertQuery() {
  const [certs] = useBackendListState(certDB)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<typeof certDB[0] | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    setSearched(true)
    setResult(certs.find(c => c.certNo === query || c.idCard === query) || null)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1A56DB] flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">职业技能等级证书查询</h1>
            <p className="text-xs text-gray-500">中广核职业技能等级认定平台</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">证书真伪查询</h2>
            <p className="text-xs text-gray-500 mt-1">输入证书编号或身份证号进行查询验证</p>
          </div>
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="证书编号 / 身份证号" className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB]" />
            </div>
            <Button onClick={handleSearch} className="h-10 px-6 bg-[#1A56DB] hover:bg-[#1748B5]">查询</Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">示例证书编号：CGN-2026-001</p>
        </div>

        {result && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">查询成功</h3>
                <p className="text-xs text-gray-500">该证书为真实有效的职业技能等级证书</p>
              </div>
            </div>
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/30 mb-4">
              <div className="text-center mb-3">
                <Award className="w-10 h-10 text-amber-600 mx-auto" />
                <div className="text-lg font-bold text-gray-900 mt-1">职业技能等级证书</div>
                <div className="text-xs text-gray-500">{result.certNo}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white rounded"><div className="text-xs text-gray-500">姓名</div><div className="font-medium">{result.name}</div></div>
                <div className="p-2 bg-white rounded"><div className="text-xs text-gray-500">身份证号</div><div className="font-medium">{result.idCard}</div></div>
                <div className="p-2 bg-white rounded"><div className="text-xs text-gray-500">职业(工种)</div><div className="font-medium">{result.occupation}</div></div>
                <div className="p-2 bg-white rounded"><div className="text-xs text-gray-500">技能等级</div><div className="font-medium">{result.level}</div></div>
                <div className="p-2 bg-white rounded"><div className="text-xs text-gray-500">发证日期</div><div className="font-medium">{result.issueDate}</div></div>
                <div className="p-2 bg-white rounded"><div className="text-xs text-gray-500">发证机构</div><div className="font-medium">{result.org}</div></div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <QrCode className="w-4 h-4" />
              <span>扫描二维码验证证书</span>
            </div>
          </div>
        )}

        {searched && !result && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">未找到该证书信息，请检查输入是否正确</p>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-xs text-gray-400">
        中广核集团人力资源部 · 技术支持
      </footer>
    </div>
  )
}
