/** 溯源时间轴事件类型 */
export type TimelineEventType =
  | 'registration'    // 报名
  | 'arrangement'     // 考场编排
  | 'theory-exam'     // 理论考试
  | 'skill-exam'      // 技能考试
  | 'score'           // 成绩
  | 'certificate'     // 证书

/** 溯源时间轴事件节点 */
export interface TimelineEvent {
  /** 事件类型 */
  type: TimelineEventType
  /** 发生时间 */
  time: string
  /** 操作者 */
  operator: string
  /** 事件标题 */
  title: string
  /** 事件详情 */
  detail: string
  /** 节点状态，默认为 completed */
  status?: 'completed' | 'active' | 'pending'
}
