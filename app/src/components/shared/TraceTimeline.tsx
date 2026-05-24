import { cn } from '@/lib/utils'
import {
  ClipboardList,
  LayoutGrid,
  BookOpen,
  Wrench,
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  CircleDot,
} from 'lucide-react'
import type { TimelineEvent, TimelineEventType } from '@/types/traceTimeline'

export interface TraceTimelineProps {
  /** 事件数组，按时间顺序排列 */
  events: TimelineEvent[]
  /** 额外的 class */
  className?: string
}

/** 事件类型 → 颜色与图标映射 */
const eventTypeConfig: Record<TimelineEventType, { icon: React.ElementType; lineColor: string; dotColor: string; bgColor: string }> = {
  registration:  {
    icon: ClipboardList,
    lineColor: 'bg-blue-400',
    dotColor: 'bg-blue-500',
    bgColor: 'bg-blue-50',
  },
  arrangement: {
    icon: LayoutGrid,
    lineColor: 'bg-violet-400',
    dotColor: 'bg-violet-500',
    bgColor: 'bg-violet-50',
  },
  'theory-exam': {
    icon: BookOpen,
    lineColor: 'bg-emerald-400',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  'skill-exam': {
    icon: Wrench,
    lineColor: 'bg-amber-400',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-50',
  },
  score: {
    icon: BarChart3,
    lineColor: 'bg-orange-400',
    dotColor: 'bg-orange-500',
    bgColor: 'bg-orange-50',
  },
  certificate: {
    icon: Award,
    lineColor: 'bg-rose-400',
    dotColor: 'bg-rose-500',
    bgColor: 'bg-rose-50',
  },
}

const eventTypeLabels: Record<TimelineEventType, string> = {
  registration: '报名',
  arrangement: '考场编排',
  'theory-exam': '理论考试',
  'skill-exam': '技能考试',
  score: '成绩',
  certificate: '证书',
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    iconClass: 'text-green-500',
    dotClass: '',
    label: '已完成',
  },
  active: {
    icon: CircleDot,
    iconClass: 'text-blue-500 animate-pulse',
    dotClass: 'ring-4 ring-blue-200 animate-pulse',
    label: '进行中',
  },
  pending: {
    icon: Clock,
    iconClass: 'text-gray-300',
    dotClass: 'opacity-40',
    label: '待处理',
  },
}

/**
 * 溯源时间轴组件
 *
 * 纵向时间轴展示认定全过程事件链路，按时间排列，
 * 每种事件类型有独立图标与颜色，支持完成/进行中/待处理三种状态。
 *
 * @example
 * <TraceTimeline events={[
 *   { type: 'registration', time: '2026-04-05 14:22', operator: '报名管理员', title: '考生报名与审核', detail: '考生通过在线报名提交资料，资格审核通过。' },
 *   { type: 'arrangement', time: '2026-04-15 16:30', operator: '考务管理员', title: '考场与准考证编排', detail: '分配第一考场，座位15。' },
 * ]} />
 */
export function TraceTimeline({ events, className }: TraceTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12 text-sm text-muted-foreground', className)}>
        暂无溯源数据
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* 中央竖线 */}
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200" />

      <div className="space-y-0">
        {events.map((event, index) => {
          const config = eventTypeConfig[event.type]
          const status = event.status || 'completed'
          const statusCfg = statusConfig[status]
          const StatusIcon = statusCfg.icon
          const TypeIcon = config.icon
          return (
            <div key={index} className="relative flex gap-4 pb-4 last:pb-0">
              {/* 左侧：时间轴节点 */}
              <div className="relative flex shrink-0 flex-col items-center pt-1">
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-sm',
                    config.dotColor,
                    statusCfg.dotClass,
                  )}
                >
                  <TypeIcon className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* 右侧：事件卡片 */}
              <div className={cn('min-w-0 flex-1 rounded-lg border p-3', config.bgColor, 'border-gray-100')}>
                {/* 标题行：类型标签 + 状态 */}
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white',
                        config.dotColor,
                      )}
                    >
                      {eventTypeLabels[event.type]}
                    </span>
                    <StatusIcon className={cn('h-3.5 w-3.5', statusCfg.iconClass)} />
                    <span className="text-xs text-muted-foreground">{statusCfg.label}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{event.time}</span>
                </div>

                {/* 标题 */}
                <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>

                {/* 操作者 */}
                <p className="mt-0.5 text-xs text-gray-500">
                  操作者：{event.operator}
                </p>

                {/* 详情 */}
                {event.detail && (
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{event.detail}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TraceTimeline
