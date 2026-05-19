import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Monitor, Users, Armchair, RotateCcw, Save, Grid3X3
} from 'lucide-react'

interface Seat {
  row: number
  col: number
  candidateId: number | null
  candidateName: string
  status: 'empty' | 'occupied' | 'selected'
}

interface Candidate {
  id: number
  name: string
  idCard: string
  profession: string
  level: string
}

const mockCandidates: Candidate[] = Array.from({ length: 40 }, (_, i) => ({
  id: 1000 + i,
  name: ['张', '李', '王', '赵', '孙', '周', '吴', '郑'][i % 8] + ['伟', '芳', '敏', '静', '强', '磊', '洋', '勇', '艳', '杰'][Math.floor(i / 4) % 10],
  idCard: `4403011990${String(i + 1).padStart(2, '0')}01${String(i).padStart(4, '0')}`,
  profession: ['核能工程', '电气工程', '自动化', '热能动力', '化学工程'][i % 5],
  level: ['三级', '四级', '三级', '四级', '二级'][i % 5],
}))

const ROWS = 6
const COLS = 7

export default function SeatArrange() {
  const [seats, setSeats] = useState<Seat[][]>(() => {
    const grid: Seat[][] = []
    for (let r = 0; r < ROWS; r++) {
      const row: Seat[] = []
      for (let c = 0; c < COLS; c++) {
        row.push({ row: r, col: c, candidateId: null, candidateName: '', status: 'empty' })
      }
      grid.push(row)
    }
    return grid
  })
  const [selectedSeat, setSelectedSeat] = useState<{ row: number; col: number } | null>(null)
  const [candidates] = useState<Candidate[]>(mockCandidates)
  const [assignedCount, setAssignedCount] = useState(0)
  const [examRoom, setExamRoom] = useState('room1')

  const stats = {
    total: ROWS * COLS,
    assigned: assignedCount,
    empty: ROWS * COLS - assignedCount,
  }

  const handleAutoArrange = useCallback(() => {
    const newSeats: Seat[][] = seats.map(row => row.map(seat => ({ ...seat, candidateId: null, candidateName: '', status: 'empty' as const })))
    let idx = 0
    for (let r = 0; r < ROWS && idx < candidates.length; r++) {
      for (let c = 0; c < COLS && idx < candidates.length; c++) {
        newSeats[r][c] = {
          ...newSeats[r][c],
          candidateId: candidates[idx].id,
          candidateName: candidates[idx].name,
          status: 'occupied' as const,
        }
        idx++
      }
    }
    setSeats(newSeats)
    setAssignedCount(idx)
    toast.success(`自动编排完成：成功编排 ${idx} 名考生`)
  }, [seats, candidates, toast])

  const handleClear = useCallback(() => {
    setSeats(prev => prev.map(row => row.map(seat => ({ ...seat, candidateId: null, candidateName: '', status: 'empty' as const }))))
    setAssignedCount(0)
    setSelectedSeat(null)
    toast.success('已清空：座位编排已重置')
  }, [toast])

  const handleSeatClick = useCallback((row: number, col: number) => {
    setSelectedSeat({ row, col })
  }, [])

  const handleAssignCandidate = useCallback((candidateId: number) => {
    if (!selectedSeat) return
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return
    setSeats(prev => {
      const newSeats = prev.map(r => r.map(s => ({ ...s })))
      const wasOccupied = newSeats[selectedSeat.row][selectedSeat.col].status === 'occupied'
      newSeats[selectedSeat.row][selectedSeat.col] = {
        ...newSeats[selectedSeat.row][selectedSeat.col],
        candidateId,
        candidateName: candidate.name,
        status: 'occupied',
      }
      if (!wasOccupied) setAssignedCount(c => c + 1)
      return newSeats
    })
    setSelectedSeat(null)
    toast.success(`安排成功：已将 ${candidate.name} 安排到座位`)
  }, [selectedSeat, candidates, toast])

  const handleRemoveCandidate = useCallback(() => {
    if (!selectedSeat) return
    setSeats(prev => {
      const newSeats = prev.map(r => r.map(s => ({ ...s })))
      const wasOccupied = newSeats[selectedSeat.row][selectedSeat.col].status === 'occupied'
      newSeats[selectedSeat.row][selectedSeat.col] = {
        ...newSeats[selectedSeat.row][selectedSeat.col],
        candidateId: null,
        candidateName: '',
        status: 'empty',
      }
      if (wasOccupied) setAssignedCount(c => Math.max(0, c - 1))
      return newSeats
    })
    setSelectedSeat(null)
    toast.success('已移除：该座位已清空')
  }, [selectedSeat, toast])

  const unassignedCandidates = candidates.filter(c => {
    for (const row of seats) {
      for (const seat of row) {
        if (seat.candidateId === c.id) return false
      }
    }
    return true
  })

  return (
    <div className="p-6 space-y-4 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考场座位编排</h1>
          <p className="text-sm text-gray-500 mt-1">可视化座位编排，支持自动分配和手动调整</p>
        </div>
        <div className="flex gap-2">
          <Select value={examRoom} onValueChange={setExamRoom}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择考场" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="room1">第1考场 - A栋201（42座）</SelectItem>
              <SelectItem value="room2">第2考场 - A栋202（42座）</SelectItem>
              <SelectItem value="room3">第3考场 - B栋301（42座）</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClear}>
            <RotateCcw className="w-4 h-4 mr-2" /> 清空
          </Button>
          <Button variant="outline" onClick={handleAutoArrange}>
            <Grid3X3 className="w-4 h-4 mr-2" /> 自动编排
          </Button>
          <Button onClick={() => toast.success('保存成功：座位编排已保存')}>
            <Save className="w-4 h-4 mr-2" /> 保存编排
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Seat Grid */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
              <span className="text-gray-500">空座位</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-400" />
              <span className="text-gray-500">已安排</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded bg-amber-100 border-2 border-amber-500" />
              <span className="text-gray-500">选中</span>
            </div>
            <div className="ml-auto flex gap-4 text-xs">
              <span className="text-gray-500">总座位: <strong className="text-gray-700">{stats.total}</strong></span>
              <span className="text-gray-500">已安排: <strong className="text-blue-600">{stats.assigned}</strong></span>
              <span className="text-gray-500">空座位: <strong className="text-gray-600">{stats.empty}</strong></span>
            </div>
          </div>

          {/* Teacher podium */}
          <div className="w-32 mx-auto h-8 bg-gray-200 rounded-t-lg flex items-center justify-center text-xs text-gray-500 mb-4">
            <Monitor className="w-3 h-3 mr-1" /> 监考台
          </div>

          <div className="space-y-2">
            {seats.map((row, ri) => (
              <div key={ri} className="flex items-center gap-2">
                <span className="w-6 text-xs text-gray-400 text-right">{ri + 1}</span>
                <div className="flex-1 flex justify-center gap-2">
                  {row.map((seat, ci) => {
                    const isSelected = selectedSeat?.row === ri && selectedSeat?.col === ci
                    return (
                      <button
                        key={ci}
                        onClick={() => handleSeatClick(ri, ci)}
                        className={`w-20 h-14 rounded-lg border text-xs flex flex-col items-center justify-center transition-all duration-150 ${
                          isSelected
                            ? 'bg-amber-100 border-2 border-amber-500 shadow-sm'
                            : seat.status === 'occupied'
                            ? 'bg-blue-50 border border-blue-300 hover:bg-blue-100'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                        title={seat.candidateName || '空座位'}
                      >
                        {seat.status === 'occupied' ? (
                          <>
                            <Armchair className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
                            <span className="text-[10px] text-blue-700 truncate max-w-full px-1">{seat.candidateName}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-300 text-[10px]">{ri + 1}-{ci + 1}</span>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 flex-shrink-0 space-y-3 overflow-auto">
          {selectedSeat ? (
            <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
              <h3 className="font-medium text-sm">座位信息</h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">位置</span><span>第{selectedSeat.row + 1}排 第{selectedSeat.col + 1}列</span></div>
                <div className="flex justify-between"><span className="text-gray-500">状态</span>
                  <Badge variant={seats[selectedSeat.row][selectedSeat.col].status === 'occupied' ? 'default' : 'secondary'} className="text-[10px]">
                    {seats[selectedSeat.row][selectedSeat.col].status === 'occupied' ? '已安排' : '空闲'}
                  </Badge>
                </div>
                {seats[selectedSeat.row][selectedSeat.col].candidateName && (
                  <div className="flex justify-between"><span className="text-gray-500">考生</span><span>{seats[selectedSeat.row][selectedSeat.col].candidateName}</span></div>
                )}
              </div>
              {seats[selectedSeat.row][selectedSeat.col].status === 'occupied' && (
                <Button variant="outline" size="sm" className="w-full text-red-600" onClick={handleRemoveCandidate}>
                  <RotateCcw className="w-3 h-3 mr-1" /> 移除考生
                </Button>
              )}
            </div>
          ) : null}

          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 待安排考生 ({unassignedCandidates.length})</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {unassignedCandidates.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">所有考生已安排</p>
              ) : (
                unassignedCandidates.map(c => (
                  <button
                    key={c.id}
                    className="w-full text-left p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-xs"
                    onClick={() => selectedSeat && handleAssignCandidate(c.id)}
                    disabled={!selectedSeat}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      <Badge variant="outline" className="text-[9px]">{c.level}</Badge>
                    </div>
                    <div className="text-gray-400 mt-0.5">{c.profession}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
