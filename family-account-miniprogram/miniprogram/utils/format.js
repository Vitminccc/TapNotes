function formatMoney(amount, unit = '¥') {
  if (amount === undefined || amount === null) return '0.00'
  const num = Math.abs(amount) / 100
  const str = num.toFixed(2)
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const prefix = amount < 0 ? '-' : ''
  return unit + prefix + parts.join('.')
}

function formatMoneySimple(amount) {
  if (amount === undefined || amount === null) return '0'
  const num = Math.abs(amount) / 100
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toFixed(0)
}

function formatDate(date, fmt = 'YYYY-MM-DD') {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date)
  const o = {
    'Y+': d.getFullYear(),
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  }
  let result = fmt
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(result)) {
      const val = o[k] + ''
      const len = RegExp.$1.length
      result = result.replace(RegExp.$1, len === 1 ? val : val.padStart(len, '0'))
    }
  }
  return result
}

function formatDateCN(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function getMonthDays(year, month) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay()
}

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function isSameDay(date1, date2) {
  const d1 = typeof date1 === 'string' ? new Date(date1.replace(/-/g, '/')) : new Date(date1)
  const d2 = typeof date2 === 'string' ? new Date(date2.replace(/-/g, '/')) : new Date(date2)
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

function percent(num, total) {
  if (!total) return 0
  const p = (num / total) * 100
  return Math.min(Math.round(p * 10) / 10, 100)
}

module.exports = {
  formatMoney,
  formatMoneySimple,
  formatDate,
  formatDateCN,
  getMonthDays,
  getFirstDayOfMonth,
  getToday,
  getCurrentMonth,
  isSameDay,
  percent
}
