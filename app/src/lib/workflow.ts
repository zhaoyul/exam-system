export interface SiteNode {
  id: string
  label: string
  code: string
  filingArea: string
  children?: SiteNode[]
}

export const SITE_TREE: SiteNode[] = [
  {
    id: 'gd',
    label: '广东省',
    code: '44',
    filingArea: '广东省',
    children: [
      { id: 'dyw', label: '大亚湾基地考点', code: '44031005', filingArea: '广东省' },
      { id: 'yj', label: '阳江实操训练基地', code: '44170055', filingArea: '广东省' },
      { id: 'ts', label: '台山培训考点', code: '44070018', filingArea: '广东省' },
    ],
  },
  {
    id: 'bj',
    label: '北京市',
    code: '11',
    filingArea: '北京市',
    children: [
      { id: 'bjzx', label: '北京市技能人才评价站', code: '11010088', filingArea: '北京市' },
      { id: 'yzn', label: '中国原子能科学研究院', code: '11010084', filingArea: '北京市' },
    ],
  },
  {
    id: 'gx',
    label: '广西壮族自治区',
    code: '45',
    filingArea: '广西壮族自治区',
    children: [
      { id: 'fcg', label: '防城港核电评价站', code: '45060117', filingArea: '广西壮族自治区' },
    ],
  },
]

export interface FlatSiteOption {
  id: string
  filingArea: string
  siteName: string
  siteCode: string
  label: string
}

export const SITE_OPTIONS: FlatSiteOption[] = SITE_TREE.flatMap(group =>
  (group.children || []).map(site => ({
    id: site.id,
    filingArea: site.filingArea,
    siteName: site.label,
    siteCode: site.code,
    label: `${group.label} / ${site.label}`,
  })),
)

export const EXAM_ROOM_TYPES = ['笔试考场', '机考考场'] as const
export type ExamRoomType = typeof EXAM_ROOM_TYPES[number]

export function extractGenderFromIdCard(idCard: string) {
  const normalized = idCard.trim()
  if (!/^\d{17}[\dXx]$/.test(normalized)) return ''
  return Number(normalized.charAt(16)) % 2 === 0 ? '女' : '男'
}

export function getDefaultPasswordFromIdCard(idCard: string) {
  return idCard.trim().slice(-6)
}

export function formatChineseDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatChineseMonth(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`
}

export function generatePlanNumber(siteCode: string, examDate: string, sequence: number) {
  const date = examDate ? new Date(examDate) : new Date()
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${siteCode}/${year}/${month}/${String(sequence).padStart(4, '0')}`
}

const LEVEL_CODE_MAP: Record<string, string> = {
  一级: '01',
  二级: '02',
  三级: '03',
  四级: '04',
  五级: '05',
  初级工: '05',
  中级工: '04',
  高级工: '03',
  技师: '02',
  高级技师: '01',
}

export function getLevelCode(level: string) {
  const matched = Object.entries(LEVEL_CODE_MAP).find(([keyword]) => level.includes(keyword))
  return matched?.[1] || '00'
}

export function generateCertificateNumber(siteCode: string, issueDate: string, level: string, existingNumbers: string[]) {
  const date = issueDate ? new Date(issueDate) : new Date()
  const year = String(date.getFullYear()).slice(-2)
  const levelCode = getLevelCode(level)
  let sequence = existingNumbers
    .filter(item => item.startsWith(`${siteCode}${year}${levelCode}`))
    .map(item => Number(item.slice(-6)))
    .filter(item => Number.isFinite(item))
    .sort((a, b) => b - a)[0] || 0
  let next = ''
  do {
    sequence += 1
    next = `${siteCode}${year}${levelCode}${String(sequence).padStart(6, '0')}`
  } while (existingNumbers.includes(next))
  return next
}

export async function validateOneInchPhoto(file: File) {
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      resolve({ width: image.width, height: image.height })
      URL.revokeObjectURL(url)
    }
    image.onerror = () => {
      reject(new Error('照片读取失败'))
      URL.revokeObjectURL(url)
    }
    image.src = url
  })
  const valid = dimensions.width >= 300 && dimensions.width <= 500
  return {
    valid,
    width: dimensions.width,
    height: dimensions.height,
    message: valid ? `照片校验通过（${dimensions.width}×${dimensions.height}px）` : '请上传 1 寸标准照，宽度需在 300-500px 之间',
  }
}
