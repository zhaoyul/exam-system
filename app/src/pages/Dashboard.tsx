import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Building2, Award, TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react'
import { certStats, scoreData, statusPieData } from '@/data/mockData'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const statCards = [
  { label: '本月认定人数', value: certStats.monthCount, icon: Users, color: '#1A56DB', trend: '+12.5%', up: true },
  { label: '备案机构数', value: certStats.orgCount, icon: Building2, color: '#0E9F6E', trend: '+1', up: true },
  { label: '待审批事项', value: certStats.pendingApproval, icon: AlertCircle, color: '#F59E0B', trend: '需关注', up: false },
  { label: '证书发放数', value: certStats.certIssued, icon: Award, color: '#1A56DB', trend: '+8.3%', up: true },
]

const todoItems = [
  { title: '阳江核电认定计划待审批', time: '2026-05-18 10:30', type: 'warning' as const },
  { title: '台山核电考场编排待完成', time: '2026-05-18 09:45', type: 'warning' as const },
  { title: '宁德核电成绩公示待确认', time: '2026-05-17 16:20', type: 'info' as const },
  { title: '大亚湾核电证书打印待处理', time: '2026-05-17 14:10', type: 'info' as const },
  { title: '红沿河核电备案材料待审核', time: '2026-05-17 11:00', type: 'warning' as const },
]

const activities = [
  { user: '张三', action: '提交了新认定计划', target: '2026年第二批技能认定', time: '10:30' },
  { user: '李四', action: '完成了考场编排', target: '电气试验员四级认定', time: '09:45' },
  { user: '王五', action: '审核通过了备案申请', target: '阳江核电新增考点', time: '09:15' },
  { user: '赵六', action: '录入了考试成绩', target: '机械设备检修工三级', time: '昨天' },
  { user: '孙七', action: '生成了证书批次', target: '2026年第四批认定', time: '昨天' },
]

export default function Dashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = canvas.offsetWidth
    let h = 320
    canvas.width = w * 2
    canvas.height = h * 2
    ctx.scale(2, 2)

    const PARTICLE_COUNT = 80
    const CONNECTION_DIST = 120
    const particles = new Float32Array(PARTICLE_COUNT * 4)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles[i * 4] = Math.random() * w
      particles[i * 4 + 1] = Math.random() * h
      particles[i * 4 + 2] = (Math.random() - 0.5) * 0.8
      particles[i * 4 + 3] = (Math.random() - 0.5) * 0.8
    }

    const mouse = { x: -200, y: -200 }
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const handleLeave = () => { mouse.x = -200; mouse.y = -200 }
    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('mouseleave', handleLeave)

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let px = particles[i * 4], py = particles[i * 4 + 1]
        const dx = px - mouse.x, dy = py - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 2
          particles[i * 4] += (dx / dist) * force
          particles[i * 4 + 1] += (dy / dist) * force
        }
        particles[i * 4] += particles[i * 4 + 2]
        particles[i * 4 + 1] += particles[i * 4 + 3]
        if (particles[i * 4] < 0 || particles[i * 4] > w) particles[i * 4 + 2] *= -1
        if (particles[i * 4 + 1] < 0 || particles[i * 4 + 1] > h) particles[i * 4 + 3] *= -1
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const dx = particles[i * 4] - particles[j * 4]
          const dy = particles[i * 4 + 1] - particles[j * 4 + 1]
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECTION_DIST) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(26, 86, 219, ${0.15 * (1 - d / CONNECTION_DIST)})`
            ctx.lineWidth = 1
            ctx.moveTo(particles[i * 4], particles[i * 4 + 1])
            ctx.lineTo(particles[j * 4], particles[j * 4 + 1])
            ctx.stroke()
          }
        }
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        ctx.beginPath()
        ctx.arc(particles[i * 4], particles[i * 4 + 1], 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(26, 86, 219, 0.4)'
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">工作台</h1>

      <div className="relative mb-6">
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 320 }} />
        <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '15' }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <span className={`text-xs flex items-center gap-0.5 ${card.up ? 'text-green-600' : 'text-amber-600'}`}>
                  {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">认定趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={scoreData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A56DB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#1A56DB" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">认定状态分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {statusPieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">待办事项</h3>
            <button onClick={() => navigate('/cert/approval')} className="text-xs text-[#1A56DB] hover:underline">查看全部</button>
          </div>
          <div className="space-y-2">
            {todoItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate('/cert/approval')}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{item.title}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">最近活动</h3>
          <div className="space-y-3">
            {activities.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {item.user[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">{item.user}</span>
                    <span className="text-gray-500"> {item.action}</span>
                  </div>
                  <div className="text-xs text-[#1A56DB] mt-0.5">{item.target}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
