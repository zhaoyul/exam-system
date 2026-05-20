import { useState } from 'react'
import { Bell, CheckCheck, Trash2, Send, Settings, Mail, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

interface Message {
  id: string
  title: string
  content: string
  type: 'system' | 'approval' | 'exam' | 'cert'
  sender: string
  date: string
  read: boolean
  important: boolean
}

const msgs_init: Message[] = [
  { id: '1', title: '2026年第一批认定计划已发布', content: '2026年第一批技能认定计划已正式发布，请各位考务人员做好相关准备工作。', type: 'system', sender: '系统管理员', date: '2026-04-01 09:00', read: false, important: true },
  { id: '2', title: '成绩复核申请待审批', content: '考生李四提交成绩复核申请，需要您进行审批处理。', type: 'approval', sender: '考务系统', date: '2026-05-22 10:30', read: false, important: true },
  { id: '3', title: '考场安排通知', content: '您已被安排为第一考场监考员，考试时间为2026年5月20日。', type: 'exam', sender: '考务管理员', date: '2026-04-18 14:00', read: true, important: false },
  { id: '4', title: '证书打印完成', content: '2026年第一批认定证书已全部打印完成，请前往证书中心领取。', type: 'cert', sender: '证书管理员', date: '2026-06-02 16:00', read: true, important: false },
  { id: '5', title: '督导培训通知', content: '2026年下半年督导培训将于9月1日举行，请相关专家做好准备。', type: 'system', sender: '培训管理员', date: '2026-08-15 09:00', read: false, important: false },
  { id: '6', title: '违规处理提醒', content: '第二考场发现疑似违规行为，请及时查看并处理。', type: 'exam', sender: '监控系统', date: '2026-05-20 09:45', read: false, important: true },
]

const typeMeta: Record<string, { label: string; color: string; icon: typeof Mail }> = {
  system: { label: '系统', color: 'bg-blue-50 text-blue-700', icon: Mail },
  approval: { label: '审批', color: 'bg-amber-50 text-amber-700', icon: AlertCircle },
  exam: { label: '考试', color: 'bg-purple-50 text-purple-700', icon: FileText },
  cert: { label: '证书', color: 'bg-green-50 text-green-700', icon: FileText },
}

export default function MessageCenter() {
  const [msgs, setMsgs] = useBackendListState<Message>(msgs_init)
  const [tab, setTab] = useState<'inbox' | 'settings'>('inbox')
  const [filter, setFilter] = useState('全部')
  const [viewMsg, setViewMsg] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [composeForm, setComposeForm] = useState({ title: '', content: '', recipient: '' })
  const [settings, setSettings] = useState({
    systemNotify: true,
    approvalNotify: true,
    examNotify: true,
    certNotify: true,
    soundAlert: false,
    emailForward: true,
  })

  const unreadCount = msgs.filter(m => !m.read).length
  const importantCount = msgs.filter(m => m.important && !m.read).length

  const filtered = msgs.filter(m => {
    const f = filter === '全部' || m.type === filter
    const t = tab === 'inbox'
    return f && t
  })

  const markRead = (id: string) => { setMsgs(prev => prev.map(m => m.id === id ? { ...m, read: true } : m)) }
  const markAllRead = () => { setMsgs(prev => prev.map(m => ({ ...m, read: true }))) }
  const delMsg = (id: string) => { setMsgs(prev => prev.filter(m => m.id !== id)); setViewMsg(null) }
  const sendMsg = () => {
    if (!composeForm.title || !composeForm.content) return
    setMsgs(prev => [{ id: Date.now().toString(), title: composeForm.title, content: composeForm.content, type: 'system', sender: '我', date: new Date().toLocaleString(), read: true, important: false }, ...prev])
    setShowCompose(false)
    setComposeForm({ title: '', content: '', recipient: '' })
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-6 h-6 text-[#1A56DB]" />消息中心</h1>

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-xl font-bold text-[#1A56DB]">{msgs.length}</div><div className="text-xs text-gray-500">全部消息</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-xl font-bold text-amber-600">{unreadCount}</div><div className="text-xs text-gray-500">未读</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-xl font-bold text-red-600">{importantCount}</div><div className="text-xs text-gray-500">重要未读</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center"><div className="text-xl font-bold text-green-600">{msgs.filter(m => m.read).length}</div><div className="text-xs text-gray-500">已读</div></div>
      </div>

      {/* 标签 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setTab('inbox')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'inbox' ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>收件箱</button>
          <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'settings' ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>通知设置</button>
        </div>
        {tab === 'inbox' && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCompose(true)} variant="outline" className="h-8 text-xs"><Send className="w-3.5 h-3.5 mr-1" />发消息</Button>
            <Button onClick={markAllRead} variant="outline" className="h-8 text-xs"><CheckCheck className="w-3.5 h-3.5 mr-1" />全部已读</Button>
          </div>
        )}
      </div>

      {tab === 'inbox' ? (
        <>
          {/* 筛选 */}
          <div className="flex items-center gap-2 mb-3">
            {['全部', 'system', 'approval', 'exam', 'cert'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === f ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === '全部' ? '全部' : typeMeta[f]?.label}
              </button>
            ))}
          </div>

          {/* 消息列表 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            {filtered.map(m => {
              const meta = typeMeta[m.type]
              const Icon = meta.icon
              return (
                <div key={m.id} onClick={() => { markRead(m.id); setViewMsg(m) }} className={`flex items-start gap-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!m.read ? 'bg-blue-50/20' : ''}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${!m.read ? 'text-gray-900' : 'text-gray-600'}`}>{m.title}</span>
                      {m.important && <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px]">重要</span>}
                      {!m.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{m.content}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{m.sender}</span>
                      <span>{m.date}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* 设置 */
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-[#1A56DB]" />消息通知设置</h2>
          <div className="space-y-3">
            {[
              { key: 'systemNotify', label: '系统通知', desc: '接收系统公告、计划发布等通知' },
              { key: 'approvalNotify', label: '审批提醒', desc: '接收待审批事项提醒' },
              { key: 'examNotify', label: '考试通知', desc: '接收考场安排、成绩录入等通知' },
              { key: 'certNotify', label: '证书通知', desc: '接收证书打印、颁发等通知' },
              { key: 'soundAlert', label: '声音提醒', desc: '新消息到达时播放提示音' },
              { key: 'emailForward', label: '邮件转发', desc: '将重要消息转发至邮箱' },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div><div className="text-sm font-medium text-gray-900">{s.label}</div><div className="text-xs text-gray-500">{s.desc}</div></div>
                <button onClick={() => setSettings(prev => ({ ...prev, [s.key]: !prev[s.key as keyof typeof prev] }))} className={`w-11 h-6 rounded-full transition-colors ${settings[s.key as keyof typeof settings] ? 'bg-[#1A56DB]' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[s.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 查看消息 */}
      <Dialog open={!!viewMsg} onOpenChange={() => setViewMsg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{viewMsg?.title}</DialogTitle></DialogHeader>
          {viewMsg && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400"><span>{viewMsg.sender}</span><span>·</span><span>{viewMsg.date}</span></div>
              <p className="text-sm text-gray-700 leading-relaxed">{viewMsg.content}</p>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => delMsg(viewMsg.id)}><Trash2 className="w-3.5 h-3.5 mr-1" />删除</Button>
                <Button size="sm" className="h-8 text-xs bg-[#1A56DB]" onClick={() => setViewMsg(null)}>关闭</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 发消息 */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>发送消息</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium text-gray-700">接收人</label><input value={composeForm.recipient} onChange={e => setComposeForm({...composeForm,recipient:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入接收人" /></div>
            <div><label className="text-sm font-medium text-gray-700">标题</label><input value={composeForm.title} onChange={e => setComposeForm({...composeForm,title:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入标题" /></div>
            <div><label className="text-sm font-medium text-gray-700">内容</label><textarea value={composeForm.content} onChange={e => setComposeForm({...composeForm,content:e.target.value})} className="w-full mt-1 p-3 border border-gray-200 rounded-md text-sm min-h-[80px]" placeholder="输入内容" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCompose(false)}>取消</Button>
            <Button onClick={sendMsg} className="bg-[#1A56DB]"><Send className="w-4 h-4 mr-1" />发送</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
