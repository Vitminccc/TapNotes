const { callCloud } = require('../../utils/cloud.js')
const { formatMoney, getCurrentMonth, formatDate } = require('../../utils/format.js')
const { groupBy } = require('../../utils/util.js')

Page({
  data: {
    periodList: ['本月', '本周', '今日', '本年', '自定义'],
    periodIndex: 0,
    month: '',
    totalExpense: 0,
    categoryStats: [],
    transactions: [],
    groupedTransactions: [],
    showPieChart: true
  },

  onLoad() {
    this.setData({ month: getCurrentMonth() })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.loadStatistics()
    this.loadTransactions()
  },

  getDateRange() {
    const idx = this.data.periodIndex
    const now = new Date()
    let startDate, endDate

    switch (idx) {
      case 0:
        startDate = getCurrentMonth() + '-01'
        endDate = getCurrentMonth() + '-31'
        break
      case 1: {
        const day = now.getDay() || 7
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - day + 1)
        startDate = formatDate(weekStart, 'YYYY-MM-DD')
        endDate = formatDate(now, 'YYYY-MM-DD')
        break
      }
      case 2:
        startDate = formatDate(now, 'YYYY-MM-DD')
        endDate = formatDate(now, 'YYYY-MM-DD')
        break
      case 3:
        startDate = now.getFullYear() + '-01-01'
        endDate = now.getFullYear() + '-12-31'
        break
      default:
        startDate = getCurrentMonth() + '-01'
        endDate = getCurrentMonth() + '-31'
    }

    return { startDate, endDate }
  },

  loadStatistics() {
    const { startDate, endDate } = this.getDateRange()
    callCloud('getStatistics', {
      startDate,
      endDate,
      type: 'expense'
    }).then(res => {
      const stats = res.data.categoryStats || []
      const total = res.data.total || 0
      const statsWithPercent = stats.map(s => ({
        ...s,
        percent: total ? Math.round((s.amount / total) * 1000) / 10 : 0,
        amountStr: formatMoney(s.amount)
      }))
      this.setData({
        totalExpense: total,
        categoryStats: statsWithPercent
      })
    })
  },

  loadTransactions() {
    const { startDate, endDate } = this.getDateRange()
    callCloud('getTransactionList', {
      startDate,
      endDate,
      type: 'expense'
    }).then(res => {
      const list = res.data.list || []
      const groups = groupBy(list, 'date')
      const grouped = Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .map(date => ({
          date,
          dateStr: this.formatDateLabel(date),
          dayTotal: groups[date].reduce((sum, t) => sum + t.amount, 0),
          dayTotalStr: formatMoney(groups[date].reduce((sum, t) => sum + t.amount, 0)),
          items: groups[date]
        }))
      this.setData({
        transactions: list,
        groupedTransactions: grouped
      })
    })
  },

  formatDateLabel(date) {
    const today = formatDate(new Date(), 'YYYY-MM-DD')
    if (date === today) return '今天'
    const d = new Date(date.replace(/-/g, '/'))
    return `${d.getMonth() + 1}月${d.getDate()}日`
  },

  switchPeriod(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ periodIndex: idx })
    this.loadData()
  },

  onCategoryTap(e) {
    const item = e.currentTarget.dataset.item
    wx.showToast({
      title: item.categoryName + ': ' + item.amountStr,
      icon: 'none'
    })
  },

  onTxTap(e) {
    const tx = e.detail.transaction
    wx.showModal({
      title: '交易详情',
      content: `${tx.categoryName}\n金额：${formatMoney(tx.amount)}\n备注：${tx.remark || '无'}`,
      showCancel: false
    })
  },

  toggleChart() {
    this.setData({ showPieChart: !this.data.showPieChart })
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  }
})
