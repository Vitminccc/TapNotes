const { callCloud } = require('../../utils/cloud.js')
const { formatMoney, getCurrentMonth, formatDate } = require('../../utils/format.js')

Page({
  data: {
    month: '',
    monthIncome: 0,
    monthExpense: 0,
    monthBalance: 0,
    todayIncome: 0,
    todayExpense: 0,
    recentTransactions: [],
    showAddPanel: false,
    activeTab: 0
  },

  onLoad() {
    this.setData({ month: getCurrentMonth() })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.loadMonthStats()
    this.loadTodayStats()
    this.loadRecentTransactions()
  },

  loadMonthStats() {
    const month = this.data.month
    const startDate = month + '-01'
    const endDate = month + '-31'
    
    callCloud('getStatistics', {
      startDate,
      endDate,
      type: 'expense'
    }).then(res => {
      const expense = res.data.total || 0
      this.setData({ monthExpense: expense })
      this.updateBalance()
    })

    callCloud('getStatistics', {
      startDate,
      endDate,
      type: 'income'
    }).then(res => {
      const income = res.data.total || 0
      this.setData({ monthIncome: income })
      this.updateBalance()
    })
  },

  updateBalance() {
    this.setData({
      monthBalance: this.data.monthIncome - this.data.monthExpense
    })
  },

  loadTodayStats() {
    const today = formatDate(new Date(), 'YYYY-MM-DD')
    callCloud('getStatistics', {
      startDate: today,
      endDate: today,
      type: 'expense'
    }).then(res => {
      this.setData({ todayExpense: res.data.total || 0 })
    })
    callCloud('getStatistics', {
      startDate: today,
      endDate: today,
      type: 'income'
    }).then(res => {
      this.setData({ todayIncome: res.data.total || 0 })
    })
  },

  loadRecentTransactions() {
    callCloud('getTransactionList', {
      pageSize: 10
    }).then(res => {
      this.setData({
        recentTransactions: (res.data.list || []).slice(0, 10)
      })
    })
  },

  goToAdd(e) {
    const type = e.currentTarget.dataset.type || 'expense'
    wx.navigateTo({
      url: '/pages/transaction-edit/transaction-edit?type=' + type
    })
  },

  showAddOptions() {
    this.setData({ showAddPanel: true })
  },

  hideAddPanel() {
    this.setData({ showAddPanel: false })
  },

  switchTab(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ activeTab: idx })
  },

  onTxTap(e) {
    const tx = e.detail.transaction
    wx.showModal({
      title: '交易详情',
      content: `${tx.categoryName}\n金额：${formatMoney(tx.amount)}\n备注：${tx.remark || '无'}`,
      showCancel: true,
      cancelText: '删除',
      cancelColor: '#E74C3C',
      success: (res) => {
        if (!res.confirm && res.cancel) {
          this.deleteTransaction(tx._id)
        }
      }
    })
  },

  deleteTransaction(id) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          callCloud('deleteTransaction', { id }).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadData()
          })
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  }
})
