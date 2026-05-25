const levelCodes: Record<string, string> = {
  '一级': '1',
  '一级/高级技师': '1',
  '二级': '2',
  '二级/技师': '2',
  '三级': '3',
  '三级/高级工': '3',
  '四级': '4',
  '四级/中级工': '4',
  '五级': '5',
  '五级/初级工': '5',
}

export function certificateNo(siteCode: string, year: string | number, level: string, sequence: number) {
  const yy = String(year).slice(-2)
  const cnLevel = level.match(/[一二三四五]/)?.[0]
  const levelCode = levelCodes[level] || (cnLevel ? levelCodes[cnLevel] : undefined) || '0'
  return `${siteCode}${yy}${levelCode}${String(sequence).padStart(6, '0')}`
}

export function admissionTicketNo(date: string, filingNo: string, employeeNo: string) {
  const digits = date.replaceAll('-', '')
  const yyMMdd = `${digits.slice(2, 4)}${digits.slice(4, 6)}${digits.slice(6, 8)}`
  const filingTail = filingNo.replace(/\D/g, '').slice(-8).padStart(8, '0')
  const employeeTail = employeeNo.replace(/^P/i, '').replace(/\D/g, '').slice(-6).padStart(6, '0')
  return `${yyMMdd}${filingTail}P${employeeTail}`
}
