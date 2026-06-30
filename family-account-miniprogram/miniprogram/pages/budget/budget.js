const { callCloud } = require('../../utils/cloud.js')
const { formatMoney, percent } = require('../../utils/format.js')

Page({
  data: {
    budget: null,
    items: [],
    recentTransactions: [],
    totalPercent: 0
  },

  onLoad() {
    this.loadBudget()
    this.loadRecentTransactions()
  },

  onShow() {
    this.loadBudget()
    this.loadRecentTransactions()
  },

  loadBudget() {
    wx.showLoading({ title: '加载中...' })
    callCloud('getBudgetDetail').then(res => {
      wx.hideLoading()
      if (res.data) {
        const items = (res.data.items || []).sort((a, b) => a.sort - b.sort)
        this.setData({
          budget: res.data,
          items,
          totalPercent: res.data.percent
        })
      }
    }).catch(() => {
      wx.hideLoading()
    })
  },

  loadRecentTransactions() {
    callCloud('getTransactionList', {
      type: 'expense',
      pageSize: 5
    }).then(res => {
      this.setData({
        recentTransactions: (res.data.list || []).slice(0, 5)
      })
    })
  },

  goToSetting() {
    wx.navigateTo({
      url: '/pages/budget-setting/budget-setting'
    })
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/transaction-edit/transaction-edit?type=expense&project=装修'
    })
  },

  onBudgetTap() {
    this.goToSetting()
  },

  onItemTap(e) {
    const item = e.detail.item
    wx.showToast({
      title: item.categoryName,
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

  onPullDownRefresh() {
    this.loadBudget()
    this.loadRecentTransactions()
    wx.stopPullDownRefresh()
  }
})
